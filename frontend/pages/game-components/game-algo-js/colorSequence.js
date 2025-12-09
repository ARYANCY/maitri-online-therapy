
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
  if (!Array.isArray(colors) || colors.length === 0 || !Number.isFinite(sequenceLength)) {
    return { sequence: [], shuffledColors: [] };
  }
  const len = Math.max(1, sequenceLength);
  const sequence = Array.from({ length: len }, () => 
    colors[Math.floor(Math.random() * colors.length)]
  );
  const shuffledColors = shuffleArray([...colors]);
  
  return { sequence, shuffledColors };
};

export const calculateRoundScore = (userSequence, correctSequence) => {
  if (!Array.isArray(userSequence) || !Array.isArray(correctSequence)) return 0;
  const len = Math.min(userSequence.length, correctSequence.length);
  let score = 0;
  for (let i = 0; i < len; i++) {
    if (userSequence[i] === correctSequence[i]) {
      score += 10;
    }
  }
  const maxScore = (correctSequence.length || 0) * 10;
  return Math.max(0, Math.min(score, maxScore));
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

