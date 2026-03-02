/**
 * ===== useGame Hook =====
 *
 * Bridges the pure game engine with React's state system.
 * Components use this hook - never the engine directly.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { createGameEngine, GAME_STATUS } from "@engine/gameEngine";
import { getAnswerEncouragement, getResultEncouragement } from "@engine/encouragementEngine";
import { saveGameSession } from "@services/firebase";

export { GAME_STATUS };

/**
 * @param {object} config
 * @param {string} config.subject
 * @param {string} config.grade
 * @param {string} config.level
 * @param {string} config.childName
 * @param {number} config.questionCount
 */
export function useGame(config) {
  const engineRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect, message, emoji }
  const [results, setResults] = useState(null);

  // Initialize engine
  useEffect(() => {
    if (!config.subject || !config.grade || !config.childName) return;

    const engine = createGameEngine(config);
    engineRef.current = engine;

    // Subscribe to engine state changes
    const unsubscribe = engine.subscribe((newState) => {
      setGameState({ ...newState });
    });

    // Set initial state
    setGameState(engine.getState());
    setFeedback(null);
    setResults(null);

    return unsubscribe;
  }, [config.subject, config.grade, config.level, config.childName, config.questionCount]);

  // Start the game
  const startGame = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.start();
    setFeedback(null);
  }, []);

  // Submit answer
  const submitAnswer = useCallback(
    (selectedIndex) => {
      if (!engineRef.current) return;

      const result = engineRef.current.submitAnswer(selectedIndex);
      if (!result) return;

      // Get encouragement message
      const state = engineRef.current.getState();
      const message = getAnswerEncouragement(
        config.childName,
        result.isCorrect,
        state.streak
      );

      setFeedback({
        isCorrect: result.isCorrect,
        correctIndex: result.correctIndex,
        pointsEarned: result.pointsEarned,
        streakBonus: result.streakBonus,
        message: message.text,
        emoji: message.emoji,
      });
    },
    [config.childName]
  );

  // Go to next question
  const goNext = useCallback(() => {
    if (!engineRef.current) return;

    setFeedback(null);
    const newState = engineRef.current.nextQuestion();

    // If finished, calculate results
    if (newState.status === GAME_STATUS.FINISHED) {
      const gameResults = engineRef.current.getResults();
      const resultMessage = getResultEncouragement(
        config.childName,
        gameResults.performanceLevel
      );
      const finalResults = {
        ...gameResults,
        encouragement: resultMessage,
      };
      setResults(finalResults);

      // Save to Firebase
      const childId = config.childId || `guest_${config.childName || "unknown"}`;
      saveGameSession(childId, {
        childName: config.childName,
        subject: config.subject,
        grade: config.grade,
        level: config.level || "standard",
        score: gameResults.score,
        correctCount: gameResults.correctCount,
        wrongCount: gameResults.wrongCount,
        totalQuestions: gameResults.totalQuestions,
        percentage: gameResults.percentage,
        maxStreak: gameResults.maxStreak,
        performanceLevel: gameResults.performanceLevel,
        playedAt: new Date().toISOString(),
      }).catch((err) => console.warn("Failed to save progress:", err));
    }
  }, [config.childName, config.childId, config.subject, config.grade, config.level]);

  // Restart game
  const restartGame = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.reset();
    engineRef.current.start();
    setFeedback(null);
    setResults(null);
  }, []);

  return {
    // State
    gameState,
    feedback,
    results,
    isPlaying: gameState?.status === GAME_STATUS.PLAYING,
    isAnswered: gameState?.status === GAME_STATUS.ANSWERED,
    isFinished: gameState?.status === GAME_STATUS.FINISHED,
    isIdle: gameState?.status === GAME_STATUS.IDLE,

    // Actions
    startGame,
    submitAnswer,
    goNext,
    restartGame,
  };
}
