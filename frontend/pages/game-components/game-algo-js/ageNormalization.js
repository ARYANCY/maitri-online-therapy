export const AGE_GROUPS = {
  "10-15": { min: 10, max: 15, label: "10-15 years" },
  "15-20": { min: 15, max: 20, label: "15-20 years" },
  "20-30": { min: 20, max: 30, label: "20-30 years" },
  "30-40": { min: 30, max: 40, label: "30-40 years" },
  "40-50": { min: 40, max: 50, label: "40-50 years" },
  "50-60": { min: 50, max: 60, label: "50-60 years" },
  "60-70": { min: 60, max: 70, label: "60-70 years" },
  "70-80": { min: 70, max: 80, label: "70-80 years" },
  "80-90": { min: 80, max: 90, label: "80-90 years" }
};

export const getAgeGroupLabel = (ageGroup) => {
  return AGE_GROUPS[ageGroup]?.label || ageGroup;
};

export const getAgeGroupMultipliers = (ageGroup) => {
  const multipliers = {
    "10-15": {
      memory: 0.75,
      attention: 0.70,
      reactionTime: 0.80,
      executive: 0.75,
      language: 0.80,
      orientation: 0.85
    },
    "15-20": {
      memory: 0.85,
      attention: 0.80,
      reactionTime: 0.90,
      executive: 0.85,
      language: 0.90,
      orientation: 0.90
    },
    "20-30": {
      memory: 1.0,
      attention: 1.0,
      reactionTime: 1.0,
      executive: 1.0,
      language: 1.0,
      orientation: 1.0
    },
    "30-40": {
      memory: 0.95,
      attention: 0.95,
      reactionTime: 0.95,
      executive: 0.95,
      language: 0.98,
      orientation: 0.98
    },
    "40-50": {
      memory: 0.90,
      attention: 0.90,
      reactionTime: 0.90,
      executive: 0.90,
      language: 0.95,
      orientation: 0.95
    },
    "50-60": {
      memory: 0.85,
      attention: 0.85,
      reactionTime: 0.85,
      executive: 0.85,
      language: 0.90,
      orientation: 0.90
    },
    "60-70": {
      memory: 0.75,
      attention: 0.75,
      reactionTime: 0.75,
      executive: 0.75,
      language: 0.85,
      orientation: 0.85
    },
    "70-80": {
      memory: 0.65,
      attention: 0.65,
      reactionTime: 0.65,
      executive: 0.65,
      language: 0.75,
      orientation: 0.75
    },
    "80-90": {
      memory: 0.55,
      attention: 0.55,
      reactionTime: 0.55,
      executive: 0.55,
      language: 0.65,
      orientation: 0.65
    }
  };
  
  return multipliers[ageGroup] || multipliers["20-30"];
};

export const normalizeScoreByAge = (rawScore, gameKey, ageGroup, difficulty = "easy") => {
  const multipliers = getAgeGroupMultipliers(ageGroup);
  
  const gameDomainMapping = {
    digit_span: { primary: "memory", secondary: "attention" },
    memory: { primary: "memory", secondary: "attention" },
    n_back: { primary: "memory", secondary: "attention" },
    reaction_time: { primary: "reactionTime", secondary: "attention" },
    stroop_test: { primary: "executive", secondary: "attention" },
    pattern_recall: { primary: "memory", secondary: "executive" },
    color_sequence: { primary: "memory", secondary: "attention" },
    clock_drawing: { primary: "executive", secondary: "orientation" }
  };
  
  const mapping = gameDomainMapping[gameKey];
  if (!mapping) return rawScore;
  
  const primaryMultiplier = multipliers[mapping.primary] || 1.0;
  const secondaryMultiplier = multipliers[mapping.secondary] || 1.0;
  const combinedMultiplier = (primaryMultiplier * 0.7) + (secondaryMultiplier * 0.3);
  
  const maxScores = {
    clock_drawing: { easy: 100, medium: 100, hard: 100 },
    digit_span: { easy: 150, medium: 350, hard: 700 },
    stroop_test: { easy: 50, medium: 70, hard: 100 },
    n_back: { easy: 300, medium: 350, hard: 400 },
    memory: { easy: 150, medium: 420, hard: 900 },
    reaction_time: { easy: 4250, medium: 5950, hard: 8500 },
    pattern_recall: { easy: 120, medium: 240, hard: 400 },
    color_sequence: { easy: 150, medium: 280, hard: 500 }
  };
  
  const maxScore = maxScores[gameKey]?.[difficulty] || 100;
  const normalizedScore = (rawScore / maxScore) * 100;
  
  const ageAdjustedScore = normalizedScore / combinedMultiplier;
  
  return Math.min(100, Math.max(0, ageAdjustedScore));
};

export const getExpectedReactionTime = (ageGroup) => {
  const expectedTimes = {
    "10-15": 350,
    "15-20": 300,
    "20-30": 250,
    "30-40": 280,
    "40-50": 320,
    "50-60": 380,
    "60-70": 450,
    "70-80": 550,
    "80-90": 650
  };
  
  return expectedTimes[ageGroup] || 300;
};

export const getExpectedMemorySpan = (ageGroup) => {
  const expectedSpans = {
    "10-15": 5,
    "15-20": 6,
    "20-30": 7,
    "30-40": 7,
    "40-50": 6,
    "50-60": 5,
    "60-70": 4,
    "70-80": 3,
    "80-90": 3
  };
  
  return expectedSpans[ageGroup] || 6;
};

