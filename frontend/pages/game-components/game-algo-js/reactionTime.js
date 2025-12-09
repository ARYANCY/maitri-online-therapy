
import { normalizeScoreByAge, getExpectedReactionTime } from './ageNormalization';

export const DIFFICULTY = {
  medium: { rounds: 7, minDelay: 1000, maxDelay: 3000 },
};

export const calculateDelay = (difficulty = "medium") => {
  const { minDelay, maxDelay } = DIFFICULTY.medium;
  return Math.random() * (maxDelay - minDelay) + minDelay;
};

export const calculateRoundScore = (reactionTime) => {
  const rt = Number.isFinite(reactionTime) && reactionTime > 0 ? reactionTime : 0;
  return Math.max(0, 1000 - rt);
};

export const calculateAverageReactionTime = (reactionTimes) => {
  if (!reactionTimes || reactionTimes.length === 0) return 0;
  return Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
};

export const getBestReactionTime = (reactionTimes) => {
  if (!reactionTimes || reactionTimes.length === 0) return 0;
  return Math.min(...reactionTimes);
};

export const getGameConfig = (difficulty = "medium") => {
  return { ...DIFFICULTY.medium };
};

export const prepareReactionTimeResult = (totalScore, totalTime, difficulty, maxRounds, reactionTimes, ageGroup = "20-30") => {
  const avgReactionTime = calculateAverageReactionTime(reactionTimes);
  const bestReactionTime = getBestReactionTime(reactionTimes);
  const expectedReactionTime = getExpectedReactionTime(ageGroup);
  
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30"
    ? normalizeScoreByAge(totalScore, "reaction_time", ageGroup, difficulty)
    : totalScore;
  
  return {
    key: "reaction_time",
    score: Math.round(ageAdjustedScore),
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(ageAdjustedScore / maxRounds),
      averageReactionTime: avgReactionTime,
      bestReactionTime: bestReactionTime,
      expectedReactionTime: expectedReactionTime,
      reactionTimes: reactionTimes,
      ageGroup: ageGroup,
    },
  };
};

