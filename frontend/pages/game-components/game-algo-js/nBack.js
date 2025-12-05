
import { normalizeScoreByAge } from './ageNormalization';

export const DIFFICULTY = {
  easy: { level: 1, rounds: 5 },
  medium: { level: 2, rounds: 7 },
  hard: { level: 3, rounds: 10 },
};

export const SEQUENCE_LENGTH = 7;

export const generateSequence = (length = SEQUENCE_LENGTH) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
};

export const calculateScore = (sequence, userInputs, nLevel) => {
  if (!sequence.length || !userInputs.length) {
    return { score: 0, correct: 0, total: 0 };
  }
  
  let score = 0;
  let correct = 0;
  let total = 0;

  for (let i = nLevel; i < sequence.length; i++) {
    total++;
    const expected = sequence[i - nLevel];
    const userInput = userInputs[i - nLevel];
    if (userInput === expected) {
      score += 10;
      correct++;
    }
  }

  return { score, correct, total };
};

export const getExpectedAnswers = (sequence, nLevel) => {
  const answers = [];
  for (let i = nLevel; i < sequence.length; i++) {
    answers.push(sequence[i - nLevel]);
  }
  return answers;
};

export const getInputCount = (sequence, nLevel) => {
  return Math.max(0, sequence.length - nLevel);
};

export const validateInput = (value) => {
  if (value === "" || value === null) return "";
  const numValue = Number(value);
  if (numValue >= 1 && numValue <= 9) {
    return numValue;
  }
  return "";
};

export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
};

export const getSequenceDisplayTime = () => 1500;

export const prepareNBackResult = (totalScore, totalTime, difficulty, maxRounds, lastRoundScore = {}, ageGroup = "20-30") => {
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30"
    ? normalizeScoreByAge(totalScore, "n_back", ageGroup, difficulty)
    : totalScore;
  
  return {
    key: "n_back",
    score: Math.round(ageAdjustedScore),
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(ageAdjustedScore / maxRounds),
      ageGroup: ageGroup,
      ...lastRoundScore,
    },
  };
};

