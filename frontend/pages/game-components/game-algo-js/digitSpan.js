/**
 * Digit Span Game Algorithm
 * Tests working memory by having users recall digit sequences
 */

/**
 * Difficulty settings for Digit Span game
 */
export const DIFFICULTY = {
  easy: { length: 3, rounds: 5 },
  medium: { length: 5, rounds: 7 },
  hard: { length: 7, rounds: 10 },
};

/**
 * Generate a random digit sequence
 * @param {string} difficulty - Difficulty level
 * @returns {Array} - Array of random digits (1-9)
 */
export const generateDigitSequence = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const { length } = DIFFICULTY[difficulty];
  return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
};

/**
 * Calculate score based on user input
 * @param {string} userInput - User's digit input string
 * @param {Array} correctSequence - Correct digit sequence
 * @returns {Object} - Score and details
 */
export const calculateScore = (userInput, correctSequence) => {
  if (!userInput || !correctSequence.length) {
    return { score: 0, correct: 0, total: correctSequence.length };
  }
  
  const userDigits = userInput.split("").map(Number);
  let correct = 0;
  
  for (let i = 0; i < Math.min(userDigits.length, correctSequence.length); i++) {
    if (userDigits[i] === correctSequence[i]) {
      correct++;
    }
  }
  
  return {
    score: correct * 10,
    correct,
    total: correctSequence.length
  };
};

/**
 * Validate user input (only digits)
 * @param {string} input - User input
 * @returns {string} - Cleaned input with only digits
 */
export const validateInput = (input) => {
  return input.replace(/\D/g, "");
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
 * Check if game should end
 * @param {number} currentRound - Current round number
 * @param {number} maxRounds - Maximum rounds
 * @returns {boolean} - True if game should end
 */
export const isGameComplete = (currentRound, maxRounds) => {
  return currentRound >= maxRounds;
};

/**
 * Prepare result data for submission
 * @param {number} totalScore - Total score
 * @param {number} totalTime - Total time spent
 * @param {string} difficulty - Difficulty level
 * @param {number} maxRounds - Number of rounds played
 * @returns {Object} - Formatted result for onFinish
 */
export const prepareDigitSpanResult = (totalScore, totalTime, difficulty, maxRounds) => {
  const config = DIFFICULTY[difficulty];
  return {
    key: "digit_span",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
      correct: Math.round(totalScore / 10),
      total: maxRounds * config.length,
    },
  };
};

