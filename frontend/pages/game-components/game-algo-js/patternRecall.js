
import { shuffleArray, getColorStyle as baseColorStyle } from './utils';
import { normalizeScoreByAge } from './ageNormalization';

export const DIFFICULTY = {
  medium: { 
    rounds: 6, 
    sequenceLength: 4, 
    colors: ["red", "green", "blue", "yellow", "purple"],
    showDuration: 700,
    inputTimeout: 12000
  },
};

const COLOR_MAP = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#eab308",
  purple: "#9333ea",
  orange: "#ea580c"
};

export const getColorStyle = (color) => {
  return { backgroundColor: COLOR_MAP[color] || color };
};

export const getColorName = (color, t = null) => {
  const names = {
    red: "Red",
    green: "Green",
    blue: "Blue",
    yellow: "Yellow",
    purple: "Purple",
    orange: "Orange"
  };
  
  if (t) {
    return t(`dementia.patternRecall.${color}`, names[color] || color);
  }
  return names[color] || color;
};

export const generateSequence = (difficulty = "medium") => {
  const { colors, sequenceLength } = DIFFICULTY.medium;
  if (!Array.isArray(colors) || colors.length === 0 || !Number.isFinite(sequenceLength)) {
    return [];
  }
  const len = Math.max(1, sequenceLength);
  return Array.from({ length: len }, () => 
    colors[Math.floor(Math.random() * colors.length)]
  );
};

export const checkSequence = (userSequence, correctSequence) => {
  if (!Array.isArray(userSequence) || !Array.isArray(correctSequence)) return false;
  if (userSequence.length !== correctSequence.length) return false;
  return userSequence.every((color, idx) => color === correctSequence[idx]);
};

export const isLatestInputCorrect = (userSequence, correctSequence) => {
  if (!Array.isArray(userSequence) || !Array.isArray(correctSequence)) return false;
  const lastIdx = userSequence.length - 1;
  if (lastIdx < 0 || lastIdx >= correctSequence.length) return false;
  return userSequence[lastIdx] === correctSequence[lastIdx];
};

export const calculateRoundScore = (sequenceLength) => {
  const len = Number.isFinite(sequenceLength) && sequenceLength > 0 ? sequenceLength : 0;
  return len * 10;
};

export const getGameConfig = (difficulty = "medium") => {
  return { ...DIFFICULTY.medium };
};

export const preparePatternRecallResult = (totalScore, totalTime, difficulty, maxRounds, completedRounds, sequenceLength, ageGroup = "20-30") => {
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30"
    ? normalizeScoreByAge(totalScore, "pattern_recall", ageGroup, difficulty)
    : totalScore;
  
  return {
    key: "pattern_recall",
    score: Math.round(ageAdjustedScore),
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      completedRounds,
      averageScore: Math.round(ageAdjustedScore / maxRounds),
      accuracy: Math.round((ageAdjustedScore / (maxRounds * sequenceLength * 10)) * 100),
      ageGroup: ageGroup,
    },
  };
};

export { shuffleArray };

