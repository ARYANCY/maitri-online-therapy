
import { normalizeScoreByAge, getExpectedReactionTime } from './ageNormalization';

export const DIFFICULTY = {
  easy: { rounds: 5, minDelay: 2000, maxDelay: 4000 },
  medium: { rounds: 7, minDelay: 1000, maxDelay: 3000 },
  hard: { rounds: 10, minDelay: 500, maxDelay: 2000 },
};

export const calculateDelay = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const { minDelay, maxDelay } = DIFFICULTY[difficulty];
  return Math.random() * (maxDelay - minDelay) + minDelay;
};

export const calculateRoundScore = (reactionTime) => {
  return Math.max(0, 1000 - reactionTime);
};

export const calculateAverageReactionTime = (reactionTimes) => {
  if (!reactionTimes || reactionTimes.length === 0) return 0;
  return Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
};

export const getBestReactionTime = (reactionTimes) => {
  if (!reactionTimes || reactionTimes.length === 0) return 0;
  return Math.min(...reactionTimes);
};

export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
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

