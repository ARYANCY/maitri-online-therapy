/**
 * Pattern Recall Game Algorithm
 * Tests visual pattern memory by repeating color sequences
 */

import { shuffleArray, getColorStyle as baseColorStyle } from './utils';

/**
 * Difficulty settings for Pattern Recall game
 */
export const DIFFICULTY = {
  easy: { 
    rounds: 4, 
    sequenceLength: 3, 
    colors: ["red", "green", "blue", "yellow"],
    showDuration: 800,
    inputTimeout: 15000
  },
  medium: { 
    rounds: 6, 
    sequenceLength: 4, 
    colors: ["red", "green", "blue", "yellow", "purple"],
    showDuration: 700,
    inputTimeout: 12000
  },
  hard: { 
    rounds: 8, 
    sequenceLength: 5, 
    colors: ["red", "green", "blue", "yellow", "purple", "orange"],
    showDuration: 600,
    inputTimeout: 10000
  },
};

/**
 * Color map for styling
 */
const COLOR_MAP = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#eab308",
  purple: "#9333ea",
  orange: "#ea580c"
};

/**
 * Get color style for display
 * @param {string} color - Color name
 * @returns {Object} - Style object with backgroundColor
 */
export const getColorStyle = (color) => {
  return { backgroundColor: COLOR_MAP[color] || color };
};

/**
 * Get color name for display (can be localized)
 * @param {string} color - Color key
 * @param {Function} t - Translation function (optional)
 * @returns {string} - Color name
 */
export const getColorName = (color, t = null) => {
  const names = {
    red: "Red",
    green: "Green",
    blue: "Blue",
    yellow: "Yellow",
    purple: "Purple",
    orange: "Orange"
  };
  
  if (t) {
    return t(`dementia.patternRecall.${color}`, names[color] || color);
  }
  return names[color] || color;
};

/**
 * Generate a random pattern sequence
 * @param {string} difficulty - Difficulty level
 * @returns {Array} - Random color sequence
 */
export const generateSequence = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const { colors, sequenceLength } = DIFFICULTY[difficulty];
  return Array.from({ length: sequenceLength }, () => 
    colors[Math.floor(Math.random() * colors.length)]
  );
};

/**
 * Check if user sequence matches correct sequence
 * @param {Array} userSequence - User's sequence
 * @param {Array} correctSequence - Correct sequence
 * @returns {boolean} - True if sequences match
 */
export const checkSequence = (userSequence, correctSequence) => {
  if (userSequence.length !== correctSequence.length) return false;
  return userSequence.every((color, idx) => color === correctSequence[idx]);
};

/**
 * Check if latest input is correct
 * @param {Array} userSequence - User's sequence so far
 * @param {Array} correctSequence - Correct sequence
 * @returns {boolean} - True if last input is correct
 */
export const isLatestInputCorrect = (userSequence, correctSequence) => {
  const lastIdx = userSequence.length - 1;
  return userSequence[lastIdx] === correctSequence[lastIdx];
};

/**
 * Calculate score for a round
 * @param {number} sequenceLength - Length of sequence
 * @returns {number} - Points scored
 */
export const calculateRoundScore = (sequenceLength) => {
  return sequenceLength * 10;
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
 * @param {number} maxRounds - Maximum rounds
 * @param {number} completedRounds - Rounds completed
 * @param {number} sequenceLength - Current sequence length
 * @returns {Object} - Formatted result for onFinish
 */
export const preparePatternRecallResult = (totalScore, totalTime, difficulty, maxRounds, completedRounds, sequenceLength) => {
  return {
    key: "pattern_recall",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      completedRounds,
      averageScore: Math.round(totalScore / maxRounds),
      accuracy: Math.round((totalScore / (maxRounds * sequenceLength * 10)) * 100)
    },
  };
};

// Re-export shuffle
export { shuffleArray };

