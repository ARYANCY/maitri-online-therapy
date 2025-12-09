
import { normalizeScoreByAge } from './ageNormalization';

export const DIFFICULTY = {
  medium: { length: 5, rounds: 7 },
};

export const generateDigitSequence = (difficulty = "medium") => {
  const { length } = DIFFICULTY.medium;
  return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
};

export const calculateScore = (userInput, correctSequence) => {
  if (!Array.isArray(correctSequence) || correctSequence.length === 0) {
    return { score: 0, correct: 0, total: 0 };
  }

  const safeInput = typeof userInput === "string" ? userInput : "";
  const userDigits = safeInput.split("").map(Number).filter(Number.isFinite);
  let correct = 0;

  for (let i = 0; i < Math.min(userDigits.length, correctSequence.length); i++) {
    if (userDigits[i] === correctSequence[i]) {
      correct++;
    }
  }

  const total = correctSequence.length;
  const rawScore = correct * 10;
  const score = Math.max(0, Math.min(rawScore, total * 10));

  return {
    score,
    correct,
    total
  };
};

export const validateInput = (input) => {
  return input.replace(/\D/g, "");
};

export const getGameConfig = (difficulty = "medium") => {
  return { ...DIFFICULTY.medium };
};

export const isGameComplete = (currentRound, maxRounds) => {
  return currentRound >= maxRounds;
};

export const prepareDigitSpanResult = (totalScore, totalTime, difficulty, maxRounds, ageGroup = "20-30") => {
  const timeInSeconds = totalTime > 10000 ? Math.floor(totalTime / 1000) : totalTime;
  
  const config = DIFFICULTY[difficulty];
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30" 
    ? normalizeScoreByAge(totalScore, "digit_span", ageGroup, difficulty)
    : totalScore;
  
  return {
    key: "digit_span",
    score: Math.round(ageAdjustedScore),
    time: timeInSeconds,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: timeInSeconds, 
      averageScore: Math.round(ageAdjustedScore / maxRounds),
      correct: Math.round(ageAdjustedScore / 10),
      total: maxRounds * config.length,
      ageGroup: ageGroup,
    },
  };
};

