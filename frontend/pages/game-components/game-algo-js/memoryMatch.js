
import { shuffleArray } from './utils';
import { normalizeScoreByAge } from './ageNormalization';

export const DIFFICULTY = {
  easy: { rounds: 5, pairs: 3 },
  medium: { rounds: 7, pairs: 6 },
  hard: { rounds: 10, pairs: 9 },
};

export const FRUIT_SYMBOLS = [
  "🍎", 
  "🍌", 
  "🍇", 
  "🍊", 
  "🍓", 
  "🥝", 
  "🍑", 
  "🍉", 
  "🍍", 
  "🥭", 
  "🍒", 
  "🫐", 
  "🍋", 
  "🥑", 
  "🍐", 
];

export const generateGrid = (pairs) => {
  const selectedFruits = FRUIT_SYMBOLS.slice(0, pairs);
  const double = [...selectedFruits, ...selectedFruits];
  return shuffleArray(double);
};

export const checkMatch = (grid, first, second) => {
  return grid[first] === grid[second];
};

export const getMatchScore = () => 10;

export const isRoundComplete = (matchedCount, gridSize) => {
  return matchedCount === gridSize && gridSize > 0;
};

export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
};

export const prepareMemoryMatchResult = (totalScore, totalTime, difficulty, maxRounds, matchedCount, flippedCount, ageGroup = "20-30") => {
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30"
    ? normalizeScoreByAge(totalScore, "memory", ageGroup, difficulty)
    : totalScore;
  
  return {
    key: "memory",
    score: Math.round(ageAdjustedScore),
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(ageAdjustedScore / maxRounds),
      matches: Math.floor(matchedCount / 2),
      attempts: Math.floor(matchedCount / 2) + Math.floor(flippedCount / 2),
      ageGroup: ageGroup,
    },
  };
};

export { shuffleArray };

