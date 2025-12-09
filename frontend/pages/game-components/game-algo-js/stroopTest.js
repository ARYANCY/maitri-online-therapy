
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
  
  const safeTime = Number.isFinite(timeSpent) && timeSpent > 0 ? timeSpent : 0;

  // Correct answer: reward faster responses
  const maxTime = 10;
  const baseScore = 10;
  const timePenalty = Math.min(safeTime / maxTime, 1) * (baseScore - 1);
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

