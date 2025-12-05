/**
 * Memory Match Game Algorithm
 * Tests visual memory through card matching
 */

import { shuffleArray } from './utils';

/**
 * Difficulty settings for Memory Match game
 */
export const DIFFICULTY = {
  easy: { rounds: 5, pairs: 3 },
  medium: { rounds: 7, pairs: 6 },
  hard: { rounds: 10, pairs: 9 },
};

/**
 * Fruit symbols used for cards
 */
export const FRUIT_SYMBOLS = [
  "🍎", // Apple
  "🍌", // Banana
  "🍇", // Grapes
  "🍊", // Orange
  "🍓", // Strawberry
  "🥝", // Kiwi
  "🍑", // Peach
  "🍉", // Watermelon
  "🍍", // Pineapple
  "🥭", // Mango
  "🍒", // Cherry
  "🫐", // Blueberry
  "🍋", // Lemon
  "🥑", // Avocado
  "🍐", // Pear
];

/**
 * Generate a shuffled grid of pairs
 * @param {number} pairs - Number of pairs
 * @returns {Array} - Shuffled array of symbols
 */
export const generateGrid = (pairs) => {
  const selectedFruits = FRUIT_SYMBOLS.slice(0, pairs);
  const double = [...selectedFruits, ...selectedFruits];
  return shuffleArray(double);
};

/**
 * Check if two cards match
 * @param {Array} grid - Current grid
 * @param {number} first - First card index
 * @param {number} second - Second card index
 * @returns {boolean} - True if cards match
 */
export const checkMatch = (grid, first, second) => {
  return grid[first] === grid[second];
};

/**
 * Calculate score for a match
 * @returns {number} - Points for a successful match
 */
export const getMatchScore = () => 10;

/**
 * Check if round is complete
 * @param {number} matchedCount - Number of matched cards
 * @param {number} gridSize - Total grid size
 * @returns {boolean} - True if all cards are matched
 */
export const isRoundComplete = (matchedCount, gridSize) => {
  return matchedCount === gridSize && gridSize > 0;
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
 * @param {number} matchedCount - Total matched cards
 * @param {number} flippedCount - Total flipped cards (attempts)
 * @returns {Object} - Formatted result for onFinish
 */
export const prepareMemoryMatchResult = (totalScore, totalTime, difficulty, maxRounds, matchedCount, flippedCount) => {
  return {
    key: "memory",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
      matches: Math.floor(matchedCount / 2),
      attempts: Math.floor(matchedCount / 2) + Math.floor(flippedCount / 2)
    },
  };
};

// Re-export shuffle
export { shuffleArray };

