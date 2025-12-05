/**
 * Stroop Test Algorithm
 * Tests cognitive flexibility and executive function
 */

import { shuffleArray, getColorStyle, getTextColor } from './utils';

/**
 * Difficulty settings for Stroop Test
 */
export const DIFFICULTY = {
  easy: { rounds: 5, colors: ["red", "green", "blue"] },
  medium: { rounds: 7, colors: ["red", "green", "blue", "yellow"] },
  hard: { rounds: 10, colors: ["red", "green", "blue", "yellow", "purple"] },
};

/**
 * Generate a random word-color combination
 * @param {string} difficulty - Difficulty level
 * @returns {Object} - Contains word and color (may be different)
 */
export const generateStimulus = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const colors = DIFFICULTY[difficulty].colors;
  const word = colors[Math.floor(Math.random() * colors.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return { word, color };
};

/**
 * Calculate score for a round
 * @param {string} userChoice - User's color choice
 * @param {string} correctColor - Correct color
 * @param {number} timeSpent - Time spent in seconds
 * @returns {number} - Score (10 points base, minus time penalty)
 */
export const calculateRoundScore = (userChoice, correctColor, timeSpent) => {
  const baseScore = userChoice === correctColor ? 10 : 0;
  const timePenalty = Math.min(timeSpent, 10);
  return Math.max(0, baseScore - timePenalty);
};

/**
 * Get shuffled colors for display
 * @param {string} difficulty - Difficulty level
 * @returns {Array} - Shuffled array of colors
 */
export const getShuffledColors = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const colors = DIFFICULTY[difficulty].colors;
  return shuffleArray([...colors]);
};

/**
 * Get game configuration for difficulty
 * @param {string} difficulty - Difficulty level
 * @returns {Object} - Game configuration
 */
export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
};

/**
 * Prepare result data for submission
 * @param {number} totalScore - Total score
 * @param {number} totalTime - Total time spent
 * @param {string} difficulty - Difficulty level
 * @param {number} maxRounds - Number of rounds
 * @returns {Object} - Formatted result for onFinish
 */
export const prepareStroopTestResult = (totalScore, totalTime, difficulty, maxRounds) => {
  return {
    key: "stroop_test",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
    },
  };
};

// Re-export color utilities
export { getColorStyle, getTextColor };

