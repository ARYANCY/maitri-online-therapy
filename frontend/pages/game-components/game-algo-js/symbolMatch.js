
import { shuffleArray } from './utils';
import { normalizeScoreByAge } from './ageNormalization';

export const SYMBOLS = {
  medium: ["★", "●", "▲", "■", "◆", "♥", "♦", "♠", "♣", "☀", "☁", "☂"],
};

export const DIFFICULTY = {
  medium: { rounds: 7, pairs: 6, timeLimit: 180 },
};

export const generateGrid = (pairs, level = "medium") => {
  const symbolSet = SYMBOLS.medium;
  const safePairs = Math.max(1, Math.min(pairs || 0, symbolSet.length));
  const selectedSymbols = symbolSet.slice(0, safePairs);
  const pairsArray = [...selectedSymbols, ...selectedSymbols];
  return shuffleArray(pairsArray);
};

export const checkMatch = (grid, first, second) => {
  if (!Array.isArray(grid) || first === second) return false;
  if (first < 0 || second < 0 || first >= grid.length || second >= grid.length) return false;
  return grid[first] === grid[second];
};

export const getMatchScore = () => 20;

export const calculateAccuracy = (matches, attempts) => {
  if (!Number.isFinite(attempts) || attempts <= 0) return 0;
  if (!Number.isFinite(matches) || matches < 0) return 0;
  return Math.round((matches / attempts) * 100);
};

export const getGameConfig = (difficulty = "medium") => {
  return { ...DIFFICULTY.medium };
};

export const prepareSymbolMatchResult = (totalScore, totalTime, difficulty, maxRounds, matchedCount, attempts, ageGroup = "20-30") => {
  const matches = Math.floor(matchedCount / 2);
  const accuracy = calculateAccuracy(matches, attempts);
  
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30"
    ? normalizeScoreByAge(totalScore, "symbol_match", ageGroup, difficulty)
    : totalScore;
  
  return {
    key: "symbol_match",
    score: Math.round(ageAdjustedScore),
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(ageAdjustedScore / maxRounds),
      matches: matches,
      attempts: attempts,
      accuracy: accuracy,
      ageGroup: ageGroup,
    },
  };
};

export { shuffleArray };

