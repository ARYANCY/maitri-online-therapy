/**
 * N-Back Game Algorithm
 * Tests working memory by recalling items from n steps back
 */

/**
 * Difficulty settings for N-Back game
 */
export const DIFFICULTY = {
  easy: { level: 1, rounds: 5 },    // 1-back
  medium: { level: 2, rounds: 7 },  // 2-back
  hard: { level: 3, rounds: 10 },   // 3-back
};

/**
 * Sequence length constant
 */
export const SEQUENCE_LENGTH = 7;

/**
 * Generate a random number sequence
 * @param {number} length - Sequence length (default 7)
 * @returns {Array} - Array of random numbers (1-9)
 */
export const generateSequence = (length = SEQUENCE_LENGTH) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
};

/**
 * Calculate score based on user inputs
 * @param {Array} sequence - Original sequence
 * @param {Array} userInputs - User's inputs
 * @param {number} nLevel - N-back level
 * @returns {Object} - Score details
 */
export const calculateScore = (sequence, userInputs, nLevel) => {
  if (!sequence.length || !userInputs.length) {
    return { score: 0, correct: 0, total: 0 };
  }
  
  let score = 0;
  let correct = 0;
  let total = 0;

  for (let i = nLevel; i < sequence.length; i++) {
    total++;
    const expected = sequence[i - nLevel];
    const userInput = userInputs[i - nLevel];
    if (userInput === expected) {
      score += 10;
      correct++;
    }
  }

  return { score, correct, total };
};

/**
 * Get expected answers for a sequence
 * @param {Array} sequence - Original sequence
 * @param {number} nLevel - N-back level
 * @returns {Array} - Expected answers
 */
export const getExpectedAnswers = (sequence, nLevel) => {
  const answers = [];
  for (let i = nLevel; i < sequence.length; i++) {
    answers.push(sequence[i - nLevel]);
  }
  return answers;
};

/**
 * Get number of input fields needed
 * @param {Array} sequence - Original sequence
 * @param {number} nLevel - N-back level
 * @returns {number} - Number of inputs needed
 */
export const getInputCount = (sequence, nLevel) => {
  return Math.max(0, sequence.length - nLevel);
};

/**
 * Validate single input
 * @param {string|number} value - User input
 * @returns {number|string} - Validated input
 */
export const validateInput = (value) => {
  if (value === "" || value === null) return "";
  const numValue = Number(value);
  if (numValue >= 1 && numValue <= 9) {
    return numValue;
  }
  return "";
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
 * Get display time for sequence item
 * @returns {number} - Milliseconds per item
 */
export const getSequenceDisplayTime = () => 1500;

/**
 * Prepare result data for submission
 * @param {number} totalScore - Total score
 * @param {number} totalTime - Total time spent
 * @param {string} difficulty - Difficulty level
 * @param {number} maxRounds - Number of rounds
 * @param {Object} lastRoundScore - Last round score details
 * @returns {Object} - Formatted result for onFinish
 */
export const prepareNBackResult = (totalScore, totalTime, difficulty, maxRounds, lastRoundScore = {}) => {
  return {
    key: "n_back",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
      ...lastRoundScore,
    },
  };
};

