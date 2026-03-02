/**
 * ===== Encouragement Engine =====
 *
 * Pure logic - selects the right encouragement message based on context.
 * Designed to be swappable with AI-generated messages in Phase 2.
 */

import ENCOURAGEMENTS from "@data/config/encouragements";

/**
 * Get a random item from an array
 */
function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Replace {name} placeholder in message text
 */
function personalize(message, childName) {
  return {
    ...message,
    text: message.text.replace(/\{name\}/g, childName),
  };
}

/**
 * Get encouragement for a correct answer
 * @param {string} childName
 * @param {number} streak - current consecutive correct count
 */
export function getCorrectEncouragement(childName, streak = 0) {
  // Use streak messages for 3+ consecutive correct
  const pool =
    streak >= 3 ? ENCOURAGEMENTS.streak : ENCOURAGEMENTS.correct;
  return personalize(randomPick(pool), childName);
}

/**
 * Get encouragement for a wrong answer
 * @param {string} childName
 */
export function getWrongEncouragement(childName) {
  return personalize(randomPick(ENCOURAGEMENTS.wrong), childName);
}

/**
 * Get result screen encouragement based on performance
 * @param {string} childName
 * @param {string} performanceLevel - "perfect" | "good" | "okay" | "keepGoing"
 */
export function getResultEncouragement(childName, performanceLevel) {
  const keyMap = {
    perfect: "resultPerfect",
    good: "resultGood",
    okay: "resultOkay",
    keepGoing: "resultKeepGoing",
  };

  const key = keyMap[performanceLevel] || "resultOkay";
  return personalize(randomPick(ENCOURAGEMENTS[key]), childName);
}

/**
 * Get encouragement for answer feedback
 * Main function used by the game UI
 */
export function getAnswerEncouragement(childName, isCorrect, streak = 0) {
  if (isCorrect) {
    return getCorrectEncouragement(childName, streak);
  }
  return getWrongEncouragement(childName);
}
