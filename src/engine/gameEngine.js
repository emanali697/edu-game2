/**
 * ===== Game Engine =====
 *
 * Pure game logic - NO React, NO DOM, NO UI
 * This engine manages: question loading, answer evaluation, scoring, progression
 *
 * Usage:
 *   const engine = createGameEngine({ subject, grade, level, childName, questionCount });
 *   engine.getCurrentQuestion();
 *   engine.submitAnswer(selectedIndex);
 *   engine.getState();
 */

import { getQuestionSet } from "@data/questions";
import { shuffleArray, pickRandom, calcPercentage } from "@utils/helpers";
import {
  POINTS_CORRECT,
  POINTS_BONUS_STREAK,
  SCORE_THRESHOLDS,
} from "@utils/constants";

// ===== Game States =====
export const GAME_STATUS = {
  IDLE: "idle", // before starting
  PLAYING: "playing", // in progress
  ANSWERED: "answered", // waiting after answer feedback
  FINISHED: "finished", // all questions done
};

/**
 * Create a new game engine instance
 *
 * @param {object} config
 * @param {string} config.subject - e.g. "math"
 * @param {string} config.grade - e.g. "first"
 * @param {string} config.level - e.g. "standard"
 * @param {string} config.childName - child's name for personalization
 * @param {number} config.questionCount - how many questions per session
 * @returns {object} Game engine API
 */
export function createGameEngine(config) {
  const {
    subject,
    grade,
    level = "standard",
    childName = "",
    questionCount = 10,
  } = config;

  // ===== Internal State =====
  let state = {
    status: GAME_STATUS.IDLE,
    questions: [],
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    streak: 0,
    maxStreak: 0,
    answers: [], // { questionId, selectedIndex, isCorrect, timeSpent }
    startTime: null,
    endTime: null,
  };

  // ===== Listeners (Observer pattern) =====
  const listeners = new Set();

  function notify() {
    listeners.forEach((fn) => fn(getState()));
  }

  // ===== Core Methods =====

  /**
   * Initialize the game - load and shuffle questions
   */
  function init() {
    const questionSet = getQuestionSet(subject, grade, level);

    if (!questionSet) {
      throw new Error(
        `Question set not found: ${subject}_${grade}_${level}`
      );
    }

    // Pick random subset & shuffle
    const selected = pickRandom(questionSet.questions, questionCount);

    // Shuffle options for each question (prevent pattern memorization)
    const prepared = selected.map((q) => prepareQuestion(q));

    state = {
      ...state,
      status: GAME_STATUS.IDLE,
      questions: prepared,
      currentIndex: 0,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      streak: 0,
      maxStreak: 0,
      answers: [],
      startTime: null,
      endTime: null,
    };

    notify();
    return getState();
  }

  /**
   * Prepare a question - shuffle options while tracking correct answer
   */
  function prepareQuestion(question) {
  // normalize: support both "correct" and "correctIndex" field names
  const normalizedQuestion = {
    ...question,
    correctIndex: question.correctIndex ?? question.correct ?? 0,
  };

  // Create option objects with correct flag
  const optionObjects = normalizedQuestion.options.map((text, i) => ({
    text,
    isCorrect: i === normalizedQuestion.correctIndex,
  }));

  // Shuffle options
  const shuffledOptions = shuffleArray(optionObjects);

  // Find new correct index after shuffle
  const newCorrectIndex = shuffledOptions.findIndex((o) => o.isCorrect);

  return {
    ...normalizedQuestion,
    options: shuffledOptions.map((o) => o.text),
    correctIndex: newCorrectIndex,
    _original: question, // keep reference for debugging
  };
}

  /**
   * Start the game
   */
  function start() {
    if (state.questions.length === 0) {
      init();
    }
    state.status = GAME_STATUS.PLAYING;
    state.startTime = Date.now();
    notify();
  }

  /**
   * Get current question
   */
  function getCurrentQuestion() {
    if (state.currentIndex >= state.questions.length) return null;
    return state.questions[state.currentIndex];
  }

  /**
   * Submit an answer
   * @param {number} selectedIndex - index of selected option
   * @returns {object} { isCorrect, correctIndex, pointsEarned, streakBonus }
   */
  function submitAnswer(selectedIndex) {
    const question = getCurrentQuestion();
    if (!question || state.status !== GAME_STATUS.PLAYING) return null;

    const isCorrect = selectedIndex === question.correctIndex;
    let pointsEarned = 0;
    let streakBonus = false;

    if (isCorrect) {
      pointsEarned = POINTS_CORRECT;
      state.correctCount++;
      state.streak++;

      // Streak bonus
      if (state.streak >= 3) {
        pointsEarned += POINTS_BONUS_STREAK;
        streakBonus = true;
      }

      if (state.streak > state.maxStreak) {
        state.maxStreak = state.streak;
      }
    } else {
      state.wrongCount++;
      state.streak = 0;
    }

    state.score += pointsEarned;

    // Record answer
    state.answers.push({
      questionId: question.id,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      pointsEarned,
    });

    state.status = GAME_STATUS.ANSWERED;
    notify();

    return {
      isCorrect,
      correctIndex: question.correctIndex,
      pointsEarned,
      streakBonus,
    };
  }

  /**
   * Move to next question
   */
  function nextQuestion() {
    state.currentIndex++;

    if (state.currentIndex >= state.questions.length) {
      state.status = GAME_STATUS.FINISHED;
      state.endTime = Date.now();
    } else {
      state.status = GAME_STATUS.PLAYING;
    }

    notify();
    return getState();
  }

  /**
   * Get game results (only when finished)
   */
  function getResults() {
    if (state.status !== GAME_STATUS.FINISHED) return null;

    const totalQuestions = state.questions.length;
    const percentage = calcPercentage(state.correctCount, totalQuestions);
    const timeTaken = state.endTime - state.startTime;

    let performanceLevel;
    if (percentage >= SCORE_THRESHOLDS.EXCELLENT) performanceLevel = "perfect";
    else if (percentage >= SCORE_THRESHOLDS.GOOD) performanceLevel = "good";
    else if (percentage >= SCORE_THRESHOLDS.OKAY) performanceLevel = "okay";
    else performanceLevel = "keepGoing";

    return {
      childName,
      subject,
      grade,
      score: state.score,
      correctCount: state.correctCount,
      wrongCount: state.wrongCount,
      totalQuestions,
      percentage,
      maxStreak: state.maxStreak,
      performanceLevel,
      timeTaken,
      answers: state.answers,
    };
  }

  /**
   * Reset the engine for replay
   */
  function reset() {
    init();
  }

  /**
   * Get current state snapshot (immutable)
   */
  function getState() {
    return {
      ...state,
      totalQuestions: state.questions.length,
      percentage: calcPercentage(state.correctCount, state.answers.length || 1),
      progress: calcPercentage(state.currentIndex, state.questions.length),
      currentQuestion: getCurrentQuestion(),
    };
  }

  /**
   * Subscribe to state changes
   */
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  // Initialize on creation
  init();

  // ===== Public API =====
  return {
    init,
    start,
    getCurrentQuestion,
    submitAnswer,
    nextQuestion,
    getResults,
    getState,
    reset,
    subscribe,
  };
}
