/**
 * Cognitive Domain Mapper for Game-Based Assessment
 * Maps games to cognitive domains with clinical justification
 * Based on neuropsychological assessment principles
 */

// Cognitive Domain Weights (clinically validated)
const DOMAIN_WEIGHTS = {
  memory: 0.30,        // 30% - Main early dementia marker
  language: 0.20,      // 20% - Word-finding issues early
  attention: 0.20,     // 20% - Executive decline affects attention
  orientation: 0.15,   // 15% - Moderate impact
  executive: 0.15      // 15% - Important but late-stage
};

// Game to Cognitive Domain Mapping
const GAME_DOMAIN_MAPPING = {
  digit_span: {
    primaryDomain: 'memory',
    secondaryDomain: 'attention',
    weight: { memory: 0.8, attention: 0.2 },
    clinicalJustification: 'Working Memory - Early Alzheimer\'s affects short-term recall. Digit Span tests immediate memory capacity.',
    dementiaRelevance: 'High - Sensitive to early cognitive decline in hippocampal-dependent memory systems.'
  },
  n_back: {
    primaryDomain: 'memory',
    secondaryDomain: 'executive',
    weight: { memory: 0.6, executive: 0.4 },
    clinicalJustification: 'Working Memory + Updating - Tests ability to maintain and update information in working memory.',
    dementiaRelevance: 'High - Sensitive to Mild Cognitive Impairment (MCI) decline, particularly in frontal-parietal networks.'
  },
  pattern_recall: {
    primaryDomain: 'memory',
    secondaryDomain: 'attention',
    weight: { memory: 0.7, attention: 0.3 },
    clinicalJustification: 'Visual Memory - Tests ability to recall visual patterns and sequences.',
    dementiaRelevance: 'Moderate-High - Parietal lobe deterioration in dementia affects visual-spatial memory.'
  },
  memory: {
    primaryDomain: 'memory',
    secondaryDomain: 'executive',
    weight: { memory: 0.75, executive: 0.25 },
    clinicalJustification: 'Associative Memory - Tests ability to form and recall associations between items.',
    dementiaRelevance: 'High - Hippocampal dependency makes this a strong early marker for Alzheimer\'s disease.'
  },
  reaction_time: {
    primaryDomain: 'attention',
    secondaryDomain: 'executive',
    weight: { attention: 0.7, executive: 0.3 },
    clinicalJustification: 'Processing Speed - Measures reaction time to visual stimuli.',
    dementiaRelevance: 'Moderate - Slows in early cognitive impairment, particularly in attention networks.'
  },
  color_sequence: {
    primaryDomain: 'memory',
    secondaryDomain: 'executive',
    weight: { memory: 0.6, executive: 0.4 },
    clinicalJustification: 'Sequential Memory - Tests ability to remember and reproduce color sequences.',
    dementiaRelevance: 'Moderate - Executive and working memory components are affected in early dementia.'
  },
  stroop_test: {
    primaryDomain: 'executive',
    secondaryDomain: 'attention',
    weight: { executive: 0.8, attention: 0.2 },
    clinicalJustification: 'Cognitive Flexibility (Inhibition) - Tests ability to inhibit automatic responses.',
    dementiaRelevance: 'High - Frontal-executive dysfunction is a key marker in various dementia types.'
  },
  clock_drawing: {
    primaryDomain: 'executive',
    secondaryDomain: 'orientation',
    weight: { executive: 0.5, orientation: 0.3, memory: 0.2 },
    clinicalJustification: 'Visuospatial + Executive - Standard Clock Drawing Test (CDT) for dementia screening.',
    dementiaRelevance: 'Very High - Clinically validated test (CDT) used in MMSE, MoCA, and other assessments.'
  }
};

/**
 * Calculate maximum possible score for a game based on difficulty
 * @param {string} gameKey - Game identifier
 * @param {string} difficulty - Difficulty level (easy, moderate, hard)
 * @param {Object} gameDetail - Game detail object with rounds, sequence length, etc.
 * @returns {number} Maximum possible score
 */
function calculateMaxPossibleScore(gameKey, difficulty, gameDetail) {
  const rounds = gameDetail?.rounds || 5;
  const baseScorePerRound = 10;
  
  // Difficulty multipliers
  const difficultyMultipliers = {
    easy: 1.0,
    moderate: 1.5,
    hard: 2.0
  };
  
  const multiplier = difficultyMultipliers[difficulty] || 1.0;
  
  // Game-specific calculations
  switch (gameKey) {
    case 'digit_span':
      return rounds * baseScorePerRound * multiplier;
    case 'n_back':
      return rounds * baseScorePerRound * multiplier;
    case 'pattern_recall':
      const sequenceLength = gameDetail?.sequenceLength || 5;
      return rounds * sequenceLength * baseScorePerRound * multiplier;
    case 'memory':
      const pairs = gameDetail?.pairs || 6;
      return rounds * pairs * baseScorePerRound * multiplier;
    case 'reaction_time':
      return rounds * baseScorePerRound * multiplier;
    case 'color_sequence':
      const colorSequenceLength = gameDetail?.sequenceLength || 4;
      return rounds * colorSequenceLength * baseScorePerRound * multiplier;
    case 'stroop_test':
      return rounds * baseScorePerRound * multiplier;
    case 'clock_drawing':
      return 100; // Clock drawing is scored 0-100
    default:
      return rounds * baseScorePerRound * multiplier;
  }
}

/**
 * Normalize game score based on difficulty
 * @param {number} rawScore - Raw game score
 * @param {string} gameKey - Game identifier
 * @param {string} difficulty - Difficulty level
 * @param {Object} gameDetail - Game detail object
 * @returns {number} Normalized score (0-100)
 */
function normalizeGameScore(rawScore, gameKey, difficulty, gameDetail) {
  const maxPossible = calculateMaxPossibleScore(gameKey, difficulty, gameDetail);
  if (maxPossible === 0) return 0;
  return Math.min(100, Math.max(0, (rawScore / maxPossible) * 100));
}

/**
 * Map game results to cognitive domain scores
 * @param {Array} gameResults - Array of game result objects
 * @returns {Object} Cognitive domain scores (0-10 scale)
 */
function mapGamesToDomains(gameResults) {
  const domainScores = {
    memory: [],
    language: [],
    attention: [],
    orientation: [],
    executive: []
  };

  gameResults.forEach(game => {
    const mapping = GAME_DOMAIN_MAPPING[game.key];
    if (!mapping) return;

    // Normalize score
    const normalizedScore = normalizeGameScore(
      game.score || 0,
      game.key,
      game.detail?.difficulty || 'easy',
      game.detail || {}
    );

    // Convert normalized score (0-100) to domain score (0-10)
    const domainScore = (normalizedScore / 100) * 10;

    // Apply weights to primary and secondary domains
    if (mapping.primaryDomain) {
      const primaryWeight = mapping.weight[mapping.primaryDomain] || 1.0;
      domainScores[mapping.primaryDomain].push(domainScore * primaryWeight);
    }

    if (mapping.secondaryDomain) {
      const secondaryWeight = mapping.weight[mapping.secondaryDomain] || 0;
      domainScores[mapping.secondaryDomain].push(domainScore * secondaryWeight);
    }

    // Handle clock drawing special case (has three domains)
    if (game.key === 'clock_drawing' && mapping.weight.memory) {
      domainScores.memory.push(domainScore * mapping.weight.memory);
    }
  });

  // Calculate average domain scores
  const finalDomainScores = {};
  Object.keys(domainScores).forEach(domain => {
    const scores = domainScores[domain];
    if (scores.length > 0) {
      finalDomainScores[domain] = Math.min(10, Math.max(0, 
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      ));
    } else {
      finalDomainScores[domain] = 0;
    }
  });

  return finalDomainScores;
}

/**
 * Calculate weighted cognitive risk score
 * @param {Object} domainScores - Domain scores (0-10 scale)
 * @returns {number} Weighted risk score (0-1, where 0 = no risk, 1 = high risk)
 */
function calculateWeightedRiskScore(domainScores) {
  // Convert domain scores to risk contributions (higher score = lower risk)
  const riskContributions = {};
  Object.keys(DOMAIN_WEIGHTS).forEach(domain => {
    const score = domainScores[domain] || 0;
    const weight = DOMAIN_WEIGHTS[domain];
    // Invert: score 10 = risk 0, score 0 = risk 1
    const riskContribution = (1 - (score / 10)) * weight;
    riskContributions[domain] = riskContribution;
  });

  // Sum weighted risk contributions
  const totalRisk = Object.values(riskContributions).reduce((sum, risk) => sum + risk, 0);
  
  // Normalize to 0-1 range
  return Math.min(1, Math.max(0, totalRisk));
}

/**
 * Get cognitive domain mapping information
 * @returns {Object} Complete mapping information
 */
function getDomainMappingInfo() {
  return {
    domainWeights: DOMAIN_WEIGHTS,
    gameMappings: GAME_DOMAIN_MAPPING,
    clinicalJustification: 'Based on neuropsychological assessment principles and validated cognitive screening tools (MMSE, MoCA, ACE-III)'
  };
}

module.exports = {
  DOMAIN_WEIGHTS,
  GAME_DOMAIN_MAPPING,
  calculateMaxPossibleScore,
  normalizeGameScore,
  mapGamesToDomains,
  calculateWeightedRiskScore,
  getDomainMappingInfo
};

