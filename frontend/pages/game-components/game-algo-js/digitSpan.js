
import { normalizeScoreByAge } from './ageNormalization';

export const DIFFICULTY = {
  easy: { length: 3, rounds: 5 },
  medium: { length: 5, rounds: 7 },
  hard: { length: 7, rounds: 10 },
};

export const generateDigitSequence = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  
  const { length } = DIFFICULTY[difficulty];
  return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
};

export const calculateScore = (userInput, correctSequence) => {
  if (!userInput || !correctSequence.length) {
    return { score: 0, correct: 0, total: correctSequence.length };
  }
  
  const userDigits = userInput.split("").map(Number);
  let correct = 0;
  
  for (let i = 0; i < Math.min(userDigits.length, correctSequence.length); i++) {
    if (userDigits[i] === correctSequence[i]) {
      correct++;
    }
  }
  
  return {
    score: correct * 10,
    correct,
    total: correctSequence.length
  };
};

export const validateInput = (input) => {
  return input.replace(/\D/g, "");
};

export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
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

