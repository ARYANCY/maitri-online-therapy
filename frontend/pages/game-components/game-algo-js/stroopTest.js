

import { shuffleArray, getColorStyle, getTextColor } from './utils';

export const DIFFICULTY = {
  easy: { rounds: 5, colors: ["red", "green", "blue"] },
  medium: { rounds: 7, colors: ["red", "green", "blue", "yellow"] },
  hard: { rounds: 10, colors: ["red", "green", "blue", "yellow", "purple"] },
};

export const generateStimulus = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const colors = DIFFICULTY[difficulty].colors;
  const word = colors[Math.floor(Math.random() * colors.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return { word, color };
};

export const calculateRoundScore = (userChoice, correctColor, timeSpent) => {
  const baseScore = userChoice === correctColor ? 10 : 0;
  const timePenalty = Math.min(timeSpent, 10);
  return Math.max(0, baseScore - timePenalty);
};

export const getShuffledColors = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const colors = DIFFICULTY[difficulty].colors;
  return shuffleArray([...colors]);
};

export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
};

export const prepareStroopTestResult = (totalScore, totalTime, difficulty, maxRounds) => {
  return {
    key: "stroop_test",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
    },
  };
};

export { getColorStyle, getTextColor };

