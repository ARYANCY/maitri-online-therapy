/**
 * Symbol Match Game Algorithm
 * Tests visual memory through symbol matching
 */

import { shuffleArray } from './utils';

/**
 * Symbol sets for different difficulty levels
 */
export const SYMBOLS = {
  easy: ["★", "●", "▲", "■", "◆", "♥"],
  medium: ["★", "●", "▲", "■", "◆", "♥", "♦", "♠", "♣", "☀", "☁", "☂"],
  hard: ["★", "●", "▲", "■", "◆", "♥", "♦", "♠", "♣", "☀", "☁", "☂", "☃", "☄", "☎", "☏", "☐", "☑", "☒", "☓"]
};

/**
 * Difficulty settings for Symbol Match game
 */
export const DIFFICULTY = {
  easy: { rounds: 5, pairs: 4, timeLimit: 120 },
  medium: { rounds: 7, pairs: 6, timeLimit: 180 },
  hard: { rounds: 10, pairs: 9, timeLimit: 240 },
};

/**
 * Generate a shuffled grid of symbol pairs
 * @param {number} pairs - Number of pairs
 * @param {string} level - Difficulty level (easy/medium/hard)
 * @returns {Array} - Shuffled array of symbols
 */
export const generateGrid = (pairs, level) => {
  if (!SYMBOLS[level]) {
    throw new Error(`Invalid level: ${level}`);
  }
  
  const symbolSet = SYMBOLS[level];
  const selectedSymbols = symbolSet.slice(0, pairs);
  const pairsArray = [...selectedSymbols, ...selectedSymbols];
  return shuffleArray(pairsArray);
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
export const getMatchScore = () => 20;

/**
 * Calculate accuracy percentage
 * @param {number} matches - Number of successful matches
 * @param {number} attempts - Total attempts
 * @returns {number} - Accuracy percentage (0-100)
 */
export const calculateAccuracy = (matches, attempts) => {
  if (attempts === 0) return 0;
  return Math.round((matches / attempts) * 100);
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
 * @param {number} attempts - Total attempts
 * @returns {Object} - Formatted result for onFinish
 */
export const prepareSymbolMatchResult = (totalScore, totalTime, difficulty, maxRounds, matchedCount, attempts) => {
  const matches = Math.floor(matchedCount / 2);
  const accuracy = calculateAccuracy(matches, attempts);
  
  return {
    key: "symbol_match",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
      matches: matches,
      attempts: attempts,
      accuracy: accuracy
    },
  };
};

// Re-export shuffle
export { shuffleArray };

