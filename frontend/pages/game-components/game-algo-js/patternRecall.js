

import { shuffleArray, getColorStyle as baseColorStyle } from './utils';

export const DIFFICULTY = {
  easy: { 
    rounds: 4, 
    sequenceLength: 3, 
    colors: ["red", "green", "blue", "yellow"],
    showDuration: 800,
    inputTimeout: 15000
  },
  medium: { 
    rounds: 6, 
    sequenceLength: 4, 
    colors: ["red", "green", "blue", "yellow", "purple"],
    showDuration: 700,
    inputTimeout: 12000
  },
  hard: { 
    rounds: 8, 
    sequenceLength: 5, 
    colors: ["red", "green", "blue", "yellow", "purple", "orange"],
    showDuration: 600,
    inputTimeout: 10000
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

export const generateSequence = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const { colors, sequenceLength } = DIFFICULTY[difficulty];
  return Array.from({ length: sequenceLength }, () => 
    colors[Math.floor(Math.random() * colors.length)]
  );
};

export const checkSequence = (userSequence, correctSequence) => {
  if (userSequence.length !== correctSequence.length) return false;
  return userSequence.every((color, idx) => color === correctSequence[idx]);
};

export const isLatestInputCorrect = (userSequence, correctSequence) => {
  const lastIdx = userSequence.length - 1;
  return userSequence[lastIdx] === correctSequence[lastIdx];
};

export const calculateRoundScore = (sequenceLength) => {
  return sequenceLength * 10;
};

export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
};

export const preparePatternRecallResult = (totalScore, totalTime, difficulty, maxRounds, completedRounds, sequenceLength) => {
  return {
    key: "pattern_recall",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      completedRounds,
      averageScore: Math.round(totalScore / maxRounds),
      accuracy: Math.round((totalScore / (maxRounds * sequenceLength * 10)) * 100)
    },
  };
};

export { shuffleArray };

