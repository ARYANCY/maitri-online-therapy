/**
 * Matching Cards Game Algorithm
 * Tests visual memory through card matching
 * Similar to Memory Match but may have different scoring or rules
 */

import { shuffleArray } from './utils';

/**
 * Difficulty settings for Matching Cards game
 */
export const DIFFICULTY = {
  easy: { rounds: 5, pairs: 3 },
  medium: { rounds: 7, pairs: 6 },
  hard: { rounds: 10, pairs: 9 },
};

/**
 * Card symbols used for matching
 * Can be customized based on game requirements
 */
export const CARD_SYMBOLS = [
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
 * Generate a shuffled grid of card pairs
 * @param {number} pairs - Number of pairs to create
 * @returns {Array} - Shuffled array of card symbols
 */
export const generateGrid = (pairs) => {
  // Select required number of symbols
  const selectedSymbols = CARD_SYMBOLS.slice(0, pairs);
  
  // Create pairs (each symbol appears twice)
  const double = [...selectedSymbols, ...selectedSymbols];
  
  // Shuffle using Fisher-Yates algorithm
  return shuffleArray(double);
};

/**
 * Check if two cards match
 * @param {Array} grid - Current grid of cards
 * @param {number} first - First card index
 * @param {number} second - Second card index
 * @returns {boolean} - True if cards match
 */
export const checkMatch = (grid, first, second) => {
  if (first === second) return false; // Same card cannot match itself
  if (first < 0 || second < 0 || first >= grid.length || second >= grid.length) {
    return false; // Invalid indices
  }
  return grid[first] === grid[second];
};

/**
 * Calculate score for a successful match
 * @param {string} difficulty - Difficulty level
 * @param {number} timeTaken - Time taken to find the match (in seconds)
 * @returns {number} - Points awarded for the match
 */
export const getMatchScore = (difficulty = 'easy', timeTaken = 0) => {
  const baseScore = 10;
  
  // Optional: Add time-based bonus (faster matches = more points)
  // This can be customized based on game requirements
  const timeBonus = Math.max(0, Math.floor((30 - timeTaken) / 5));
  
  return baseScore + timeBonus;
};

/**
 * Check if a round is complete
 * @param {number} matchedCount - Number of matched cards
 * @param {number} gridSize - Total grid size
 * @returns {boolean} - True if all cards are matched
 */
export const isRoundComplete = (matchedCount, gridSize) => {
  return matchedCount === gridSize && gridSize > 0;
};

/**
 * Get game configuration for a difficulty level
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns {Object} - Game configuration object
 */
export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}. Must be one of: easy, medium, hard`);
  }
  return { ...DIFFICULTY[difficulty] };
};

/**
 * Calculate efficiency score (matches per attempt)
 * @param {number} totalMatches - Total number of matches found
 * @param {number} totalAttempts - Total number of attempts made
 * @returns {number} - Efficiency percentage (0-100)
 */
export const calculateEfficiency = (totalMatches, totalAttempts) => {
  if (totalAttempts === 0) return 0;
  return Math.round((totalMatches / totalAttempts) * 100);
};

/**
 * Calculate average time per match
 * @param {number} totalTime - Total time spent (in seconds)
 * @param {number} totalMatches - Total number of matches found
 * @returns {number} - Average time per match
 */
export const calculateAverageTimePerMatch = (totalTime, totalMatches) => {
  if (totalMatches === 0) return 0;
  return Math.round((totalTime / totalMatches) * 10) / 10; // Round to 1 decimal
};

/**
 * Prepare result data for submission
 * @param {number} totalScore - Total score accumulated
 * @param {number} totalTime - Total time spent (in seconds)
 * @param {string} difficulty - Difficulty level
 * @param {number} maxRounds - Number of rounds completed
 * @param {number} matchedCount - Total number of matched cards
 * @param {number} totalAttempts - Total number of attempts made
 * @returns {Object} - Formatted result object for onFinish callback
 */
export const prepareMatchingCardsResult = (
  totalScore,
  totalTime,
  difficulty,
  maxRounds,
  matchedCount,
  totalAttempts
) => {
  const totalPairs = Math.floor(matchedCount / 2);
  const efficiency = calculateEfficiency(totalPairs, totalAttempts);
  const avgTimePerMatch = calculateAverageTimePerMatch(totalTime, totalPairs);
  
  return {
    key: "matching_cards",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
      matches: totalPairs,
      attempts: totalAttempts,
      efficiency: efficiency,
      averageTimePerMatch: avgTimePerMatch,
    },
  };
};

/**
 * Validate game state
 * @param {Array} grid - Current grid
 * @param {Array} flipped - Currently flipped card indices
 * @param {Array} matched - Already matched card indices
 * @returns {Object} - Validation result with isValid flag and error message
 */
export const validateGameState = (grid, flipped, matched) => {
  if (!Array.isArray(grid) || grid.length === 0) {
    return { isValid: false, error: "Grid is empty or invalid" };
  }
  
  if (grid.length % 2 !== 0) {
    return { isValid: false, error: "Grid must have even number of cards" };
  }
  
  if (!Array.isArray(flipped)) {
    return { isValid: false, error: "Flipped array is invalid" };
  }
  
  if (flipped.length > 2) {
    return { isValid: false, error: "Cannot flip more than 2 cards at once" };
  }
  
  if (!Array.isArray(matched)) {
    return { isValid: false, error: "Matched array is invalid" };
  }
  
  // Check for overlapping indices
  const allIndices = [...flipped, ...matched];
  const uniqueIndices = new Set(allIndices);
  if (allIndices.length !== uniqueIndices.size) {
    return { isValid: false, error: "Card indices overlap between flipped and matched" };
  }
  
  return { isValid: true, error: null };
};

// Re-export shuffle utility
export { shuffleArray };

