/**
 * Color Sequence Game Algorithm
 * Tests sequential memory by having users recall color sequences
 */

import { shuffleArray, getColorStyle as baseGetColorStyle } from './utils';

/**
 * Difficulty settings for Color Sequence game
 */
export const DIFFICULTY = {
  easy: { rounds: 5, sequenceLength: 3, colors: ["red", "green", "blue"] },
  medium: { rounds: 7, sequenceLength: 4, colors: ["red", "green", "blue", "yellow"] },
  hard: { rounds: 10, sequenceLength: 5, colors: ["red", "green", "blue", "yellow", "purple"] },
};

/**
 * Get color style for display
 * @param {string} color - Color name
 * @returns {Object} - Style object
 */
export const getColorStyle = (color) => {
  const colorMap = {
    red: "#dc2626",
    green: "#16a34a",
    blue: "#2563eb",
    yellow: "#eab308",
    purple: "#9333ea"
  };
  return { backgroundColor: colorMap[color] || color };
};

/**
 * Generate a random color sequence based on difficulty
 * @param {string} difficulty - Difficulty level (easy/medium/hard)
 * @returns {Object} - Contains sequence and shuffled colors for input
 */
export const generateSequence = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const { colors, sequenceLength } = DIFFICULTY[difficulty];
  const sequence = Array.from({ length: sequenceLength }, () => 
    colors[Math.floor(Math.random() * colors.length)]
  );
  const shuffledColors = shuffleArray([...colors]);
  
  return { sequence, shuffledColors };
};

/**
 * Calculate score for a round
 * @param {Array} userSequence - User's input sequence
 * @param {Array} correctSequence - Correct sequence
 * @returns {number} - Score (10 points per correct position)
 */
export const calculateRoundScore = (userSequence, correctSequence) => {
  let score = 0;
  userSequence.forEach((color, idx) => {
    if (color === correctSequence[idx]) {
      score += 10;
    }
  });
  return score;
};

/**
 * Check if user completed the sequence
 * @param {Array} userSequence - User's sequence
 * @param {Array} correctSequence - Correct sequence
 * @returns {boolean} - True if sequence is complete
 */
export const isSequenceComplete = (userSequence, correctSequence) => {
  return userSequence.length === correctSequence.length;
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
 * @param {number} timer - Time spent
 * @param {string} difficulty - Difficulty level
 * @param {number} maxRounds - Number of rounds
 * @returns {Object} - Formatted result for onFinish
 */
export const prepareColorSequenceResult = (totalScore, timer, difficulty, maxRounds) => {
  return {
    key: "color_sequence",
    score: totalScore,
    time: timer,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: timer,
      averageScore: Math.round(totalScore / maxRounds),
    },
  };
};

// Re-export shuffle for convenience
export { shuffleArray };

