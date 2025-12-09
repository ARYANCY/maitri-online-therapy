
import { shuffleArray, getColorStyle, getTextColor } from './utils';
import { normalizeScoreByAge } from './ageNormalization';

export const DIFFICULTY = {
  medium: { rounds: 7, colors: ["red", "green", "blue", "yellow"] },
};

export const generateStimulus = (difficulty = "medium") => {
  const colors = DIFFICULTY.medium.colors;
  const word = colors[Math.floor(Math.random() * colors.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return { word, color };
};

export const calculateRoundScore = (userChoice, correctColor, timeSpent) => {
  if (userChoice !== correctColor) {
    return 0; // Wrong answer = 0 points
  }
  
  // Correct answer: reward faster responses
  // Maximum score: 10 points for instant response (0 seconds)
  // Minimum score: 1 point for slow response (10+ seconds)
  // Linear decay: 10 points at 0s, 1 point at 10s+
  const maxTime = 10;
  const baseScore = 10;
  const timePenalty = Math.min(timeSpent / maxTime, 1) * (baseScore - 1);
  const finalScore = Math.max(1, baseScore - timePenalty);
  
  return Math.round(finalScore * 10) / 10; // Round to 1 decimal place
};

export const getShuffledColors = (difficulty = "medium") => {
  const colors = DIFFICULTY.medium.colors;
  return shuffleArray([...colors]);
};

export const getGameConfig = (difficulty = "medium") => {
  return { ...DIFFICULTY.medium };
};

export const prepareStroopTestResult = (totalScore, totalTime, difficulty, maxRounds, ageGroup = "20-30") => {
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30"
    ? normalizeScoreByAge(totalScore, "stroop_test", ageGroup, difficulty)
    : totalScore;
  
  return {
    key: "stroop_test",
    score: Math.round(ageAdjustedScore),
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(ageAdjustedScore / maxRounds),
      ageGroup: ageGroup,
    },
  };
};

export { getColorStyle, getTextColor };

