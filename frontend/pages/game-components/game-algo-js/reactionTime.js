/**
 * Reaction Time Test Algorithm
 * Tests processing speed and reaction time
 */

/**
 * Difficulty settings for Reaction Time Test
 */
export const DIFFICULTY = {
  easy: { rounds: 5, minDelay: 2000, maxDelay: 4000 },
  medium: { rounds: 7, minDelay: 1000, maxDelay: 3000 },
  hard: { rounds: 10, minDelay: 500, maxDelay: 2000 },
};

/**
 * Calculate random delay for green signal
 * @param {string} difficulty - Difficulty level
 * @returns {number} - Random delay in milliseconds
 */
export const calculateDelay = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const { minDelay, maxDelay } = DIFFICULTY[difficulty];
  return Math.random() * (maxDelay - minDelay) + minDelay;
};

/**
 * Calculate score for a reaction time
 * @param {number} reactionTime - Reaction time in milliseconds
 * @returns {number} - Score (max 1000, decreases with slower reaction)
 */
export const calculateRoundScore = (reactionTime) => {
  return Math.max(0, 1000 - reactionTime);
};

/**
 * Calculate average reaction time
 * @param {Array<number>} reactionTimes - Array of reaction times
 * @returns {number} - Average reaction time in milliseconds
 */
export const calculateAverageReactionTime = (reactionTimes) => {
  if (!reactionTimes || reactionTimes.length === 0) return 0;
  return Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
};

/**
 * Get best (fastest) reaction time
 * @param {Array<number>} reactionTimes - Array of reaction times
 * @returns {number} - Best reaction time in milliseconds
 */
export const getBestReactionTime = (reactionTimes) => {
  if (!reactionTimes || reactionTimes.length === 0) return 0;
  return Math.min(...reactionTimes);
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
 * @param {Array<number>} reactionTimes - Array of reaction times
 * @returns {Object} - Formatted result for onFinish
 */
export const prepareReactionTimeResult = (totalScore, totalTime, difficulty, maxRounds, reactionTimes) => {
  const avgReactionTime = calculateAverageReactionTime(reactionTimes);
  const bestReactionTime = getBestReactionTime(reactionTimes);
  
  return {
    key: "reaction_time",
    score: Math.round(totalScore),
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
      averageReactionTime: avgReactionTime,
      bestReactionTime: bestReactionTime,
      reactionTimes: reactionTimes,
    },
  };
};

