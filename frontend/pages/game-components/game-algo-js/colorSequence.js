
import { shuffleArray, getColorStyle as baseGetColorStyle } from './utils';
import { normalizeScoreByAge } from './ageNormalization';

export const DIFFICULTY = {
  medium: { rounds: 7, sequenceLength: 4, colors: ["red", "green", "blue", "yellow"] },
};

export const getColorStyle = (color) => {
  const colorMap = {
    red: "#dc2626",
    green: "#16a34a",
    blue: "#2563eb",
    yellow: "#eab308",
    purple: "#9333ea"
  };
  return { backgroundColor: colorMap[color] || color };
};

export const generateSequence = (difficulty = "medium") => {
  const { colors, sequenceLength } = DIFFICULTY.medium;
  const sequence = Array.from({ length: sequenceLength }, () => 
    colors[Math.floor(Math.random() * colors.length)]
  );
  const shuffledColors = shuffleArray([...colors]);
  
  return { sequence, shuffledColors };
};

export const calculateRoundScore = (userSequence, correctSequence) => {
  let score = 0;
  userSequence.forEach((color, idx) => {
    if (color === correctSequence[idx]) {
      score += 10;
    }
  });
  return score;
};

export const isSequenceComplete = (userSequence, correctSequence) => {
  return userSequence.length === correctSequence.length;
};

export const getGameConfig = (difficulty = "medium") => {
  return { ...DIFFICULTY.medium };
};

export const prepareColorSequenceResult = (totalScore, timer, difficulty, maxRounds, ageGroup = "20-30") => {
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30"
    ? normalizeScoreByAge(totalScore, "color_sequence", ageGroup, difficulty)
    : totalScore;
  
  return {
    key: "color_sequence",
    score: Math.round(ageAdjustedScore),
    time: timer,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: timer,
      averageScore: Math.round(ageAdjustedScore / maxRounds),
      ageGroup: ageGroup,
    },
  };
};

export { shuffleArray };

