
import { shuffleArray } from './utils';
import { normalizeScoreByAge } from './ageNormalization';

export const DIFFICULTY = {
  medium: { rounds: 7, pairs: 6 },
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
  const safePairs = Math.max(1, Math.min(pairs || 0, FRUIT_SYMBOLS.length));
  const selectedFruits = FRUIT_SYMBOLS.slice(0, safePairs);
  const double = [...selectedFruits, ...selectedFruits];
  return shuffleArray(double);
};

export const checkMatch = (grid, first, second) => {
  if (!Array.isArray(grid) || first === second) return false;
  if (first < 0 || second < 0 || first >= grid.length || second >= grid.length) return false;
  return grid[first] === grid[second];
};

export const getMatchScore = () => 10;

export const isRoundComplete = (matchedCount, gridSize) => {
  return matchedCount === gridSize && gridSize > 0;
};

export const getGameConfig = (difficulty = "medium") => {
  return { ...DIFFICULTY.medium };
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

