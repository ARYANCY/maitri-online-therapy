

import { shuffleArray } from './utils';

export const SYMBOLS = {
  easy: ["★", "●", "▲", "■", "◆", "♥"],
  medium: ["★", "●", "▲", "■", "◆", "♥", "♦", "♠", "♣", "☀", "☁", "☂"],
  hard: ["★", "●", "▲", "■", "◆", "♥", "♦", "♠", "♣", "☀", "☁", "☂", "☃", "☄", "☎", "☏", "☐", "☑", "☒", "☓"]
};

export const DIFFICULTY = {
  easy: { rounds: 5, pairs: 4, timeLimit: 120 },
  medium: { rounds: 7, pairs: 6, timeLimit: 180 },
  hard: { rounds: 10, pairs: 9, timeLimit: 240 },
};

export const generateGrid = (pairs, level) => {
  if (!SYMBOLS[level]) {
    throw new Error(`Invalid level: ${level}`);
  }
  
  const symbolSet = SYMBOLS[level];
  const selectedSymbols = symbolSet.slice(0, pairs);
  const pairsArray = [...selectedSymbols, ...selectedSymbols];
  return shuffleArray(pairsArray);
};

export const checkMatch = (grid, first, second) => {
  return grid[first] === grid[second];
};

export const getMatchScore = () => 20;

export const calculateAccuracy = (matches, attempts) => {
  if (attempts === 0) return 0;
  return Math.round((matches / attempts) * 100);
};

export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
};

export const prepareSymbolMatchResult = (totalScore, totalTime, difficulty, maxRounds, matchedCount, attempts) => {
  const matches = Math.floor(matchedCount / 2);
  const accuracy = calculateAccuracy(matches, attempts);
  
  return {
    key: "symbol_match",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
      matches: matches,
      attempts: attempts,
      accuracy: accuracy
    },
  };
};

export { shuffleArray };

