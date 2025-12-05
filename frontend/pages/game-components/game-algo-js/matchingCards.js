
import { shuffleArray } from './utils';
import { normalizeScoreByAge } from './ageNormalization';

export const DIFFICULTY = {
  easy: { rounds: 5, pairs: 3 },
  medium: { rounds: 7, pairs: 6 },
  hard: { rounds: 10, pairs: 9 },
};

export const CARD_SYMBOLS = [
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

  const selectedSymbols = CARD_SYMBOLS.slice(0, pairs);

  const double = [...selectedSymbols, ...selectedSymbols];

  return shuffleArray(double);
};

export const checkMatch = (grid, first, second) => {
  if (first === second) return false;
  if (first < 0 || second < 0 || first >= grid.length || second >= grid.length) {
    return false;
  }
  return grid[first] === grid[second];
};

export const getMatchScore = (difficulty = 'easy', timeTaken = 0) => {
  const baseScore = 10;

  const timeBonus = Math.max(0, Math.floor((30 - timeTaken) / 5));
  
  return baseScore + timeBonus;
};

export const isRoundComplete = (matchedCount, gridSize) => {
  return matchedCount === gridSize && gridSize > 0;
};

export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}. Must be one of: easy, medium, hard`);
  }
  return { ...DIFFICULTY[difficulty] };
};

export const calculateEfficiency = (totalMatches, totalAttempts) => {
  if (totalAttempts === 0) return 0;
  return Math.round((totalMatches / totalAttempts) * 100);
};

export const calculateAverageTimePerMatch = (totalTime, totalMatches) => {
  if (totalMatches === 0) return 0;
  return Math.round((totalTime / totalMatches) * 10) / 10;
};

export const prepareMatchingCardsResult = (
  totalScore,
  totalTime,
  difficulty,
  maxRounds,
  matchedCount,
  totalAttempts,
  ageGroup = "20-30"
) => {
  const totalPairs = Math.floor(matchedCount / 2);
  const efficiency = calculateEfficiency(totalPairs, totalAttempts);
  const avgTimePerMatch = calculateAverageTimePerMatch(totalTime, totalPairs);
  
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30"
    ? normalizeScoreByAge(totalScore, "memory", ageGroup, difficulty)
    : totalScore;
  
  return {
    key: "matching_cards",
    score: Math.round(ageAdjustedScore),
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(ageAdjustedScore / maxRounds),
      matches: totalPairs,
      attempts: totalAttempts,
      efficiency: efficiency,
      averageTimePerMatch: avgTimePerMatch,
      ageGroup: ageGroup,
    },
  };
};

export const validateGameState = (grid, flipped, matched) => {
  if (!Array.isArray(grid) || grid.length === 0) {
    return { isValid: false, error: "Grid is empty or invalid" };
  }
  
  if (grid.length % 2 !== 0) {
    return { isValid: false, error: "Grid must have even number of cards" };
  }
  
  if (!Array.isArray(flipped)) {
    return { isValid: false, error: "Flipped array is invalid" };
  }
  
  if (flipped.length > 2) {
    return { isValid: false, error: "Cannot flip more than 2 cards at once" };
  }
  
  if (!Array.isArray(matched)) {
    return { isValid: false, error: "Matched array is invalid" };
  }

  const allIndices = [...flipped, ...matched];
  const uniqueIndices = new Set(allIndices);
  if (allIndices.length !== uniqueIndices.size) {
    return { isValid: false, error: "Card indices overlap between flipped and matched" };
  }
  
  return { isValid: true, error: null };
};

export { shuffleArray };

