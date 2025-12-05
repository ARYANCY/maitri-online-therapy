

import { shuffleArray, getColorStyle as baseGetColorStyle } from './utils';

export const DIFFICULTY = {
  easy: { rounds: 5, sequenceLength: 3, colors: ["red", "green", "blue"] },
  medium: { rounds: 7, sequenceLength: 4, colors: ["red", "green", "blue", "yellow"] },
  hard: { rounds: 10, sequenceLength: 5, colors: ["red", "green", "blue", "yellow", "purple"] },
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

export const generateSequence = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const { colors, sequenceLength } = DIFFICULTY[difficulty];
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

export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
};

export const prepareColorSequenceResult = (totalScore, timer, difficulty, maxRounds) => {
  return {
    key: "color_sequence",
    score: totalScore,
    time: timer,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: timer,
      averageScore: Math.round(totalScore / maxRounds),
    },
  };
};

export { shuffleArray };

