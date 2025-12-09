/**
 * Chart Utilities for Trend Analysis and Risk Prediction
 * Provides linear regression, threshold detection, and future date prediction
 */

/**
 * Calculate linear regression (least squares method)
 * @param {Array<number>} values - Array of numeric values
 * @returns {Object} { slope, intercept, rSquared, equation }
 */
export function calculateLinearTrend(values) {
  const nums = values.map(Number).filter(n => Number.isFinite(n));
  const n = nums.length;
  
  if (n < 2) {
    return {
      slope: 0,
      intercept: nums[0] || 0,
      rSquared: 0,
      equation: `y = ${nums[0] || 0}`,
      isValid: false
    };
  }

  // Calculate means
  const xMean = (n - 1) / 2; // x values are 0, 1, 2, ..., n-1
  const yMean = nums.reduce((sum, val) => sum + val, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  let sumSquaredErrors = 0;
  let sumSquaredTotal = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = nums[i];
    const xDiff = x - xMean;
    const yDiff = y - yMean;
    
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
    
    sumSquaredTotal += yDiff * yDiff;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Calculate R-squared (coefficient of determination)
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    const error = nums[i] - predicted;
    sumSquaredErrors += error * error;
  }

  const rSquared = sumSquaredTotal !== 0 ? 1 - (sumSquaredErrors / sumSquaredTotal) : 0;

  return {
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(4)),
    rSquared: Number(Math.max(0, Math.min(1, rSquared)).toFixed(4)),
    equation: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`,
    isValid: true,
    trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'
  };
}

/**
 * Calculate trend line data points for charting
 * @param {Array<number>} values - Original values
 * @param {Object} trend - Trend object from calculateLinearTrend
 * @param {number} extendPoints - Number of future points to predict
 * @returns {Object} { trendLine, futureProjection }
 */
export function calculateTrendLine(values, trend, extendPoints = 5) {
  const n = values.length;
  const trendLine = [];
  const futureProjection = [];

  // Calculate trend line for existing data
  for (let i = 0; i < n; i++) {
    const y = trend.slope * i + trend.intercept;
    trendLine.push(Number(y.toFixed(2)));
  }

  // Project future values
  for (let i = 0; i < extendPoints; i++) {
    const x = n + i;
    const y = trend.slope * x + trend.intercept;
    futureProjection.push(Number(y.toFixed(2)));
  }

  return {
    trendLine,
    futureProjection,
    lastValue: values.length > 0 ? values[values.length - 1] : 0,
    projectedNextValue: futureProjection.length > 0 ? futureProjection[0] : 0
  };
}

/**
 * Detect threshold crossings for risk prediction
 * @param {Array<number>} values - Array of values
 * @param {Object} thresholds - Object with threshold values
 * @param {boolean} higherIsWorse - Whether higher values indicate worse condition
 * @returns {Object} Threshold analysis results
 */
export function detectThresholdCrossing(values, thresholds, higherIsWorse = true) {
  const nums = values.map(Number).filter(n => Number.isFinite(n));
  if (nums.length < 2) {
    return {
      hasCrossed: false,
      currentRisk: 'low',
      projectedCrossing: null,
      daysToCrossing: null,
      riskLevel: 'low'
    };
  }

  const latest = nums[nums.length - 1];
  const trend = calculateLinearTrend(nums);
  
  // Define risk thresholds
  const riskThresholds = thresholds || {
    low: higherIsWorse ? 30 : 70,
    moderate: higherIsWorse ? 50 : 50,
    high: higherIsWorse ? 70 : 30
  };

  // Determine current risk level
  let currentRisk = 'low';
  if (higherIsWorse) {
    if (latest >= riskThresholds.high) currentRisk = 'high';
    else if (latest >= riskThresholds.moderate) currentRisk = 'moderate';
  } else {
    if (latest <= riskThresholds.high) currentRisk = 'high';
    else if (latest <= riskThresholds.moderate) currentRisk = 'moderate';
  }

  // Check if threshold has been crossed
  let hasCrossed = false;
  let crossedAt = null;
  
  for (let i = 1; i < nums.length; i++) {
    const prev = nums[i - 1];
    const curr = nums[i];
    
    if (higherIsWorse) {
      if (prev < riskThresholds.moderate && curr >= riskThresholds.moderate) {
        hasCrossed = true;
        crossedAt = i;
        break;
      }
    } else {
      if (prev > riskThresholds.moderate && curr <= riskThresholds.moderate) {
        hasCrossed = true;
        crossedAt = i;
        break;
      }
    }
  }

  // Project future threshold crossing
  let projectedCrossing = null;
  let daysToCrossing = null;
  
  if (trend.isValid && Math.abs(trend.slope) > 0.01) {
    const targetThreshold = riskThresholds.moderate;
    const currentX = nums.length - 1;
    const currentY = latest;
    
    // Calculate when trend line will cross threshold
    if (higherIsWorse && trend.slope > 0 && currentY < targetThreshold) {
      // Projecting upward crossing
      const xAtCrossing = (targetThreshold - trend.intercept) / trend.slope;
      if (xAtCrossing > currentX) {
        projectedCrossing = Math.ceil(xAtCrossing);
        daysToCrossing = Math.ceil(xAtCrossing - currentX);
      }
    } else if (!higherIsWorse && trend.slope < 0 && currentY > targetThreshold) {
      // Projecting downward crossing
      const xAtCrossing = (targetThreshold - trend.intercept) / trend.slope;
      if (xAtCrossing > currentX) {
        projectedCrossing = Math.ceil(xAtCrossing);
        daysToCrossing = Math.ceil(xAtCrossing - currentX);
      }
    }
  }

  return {
    hasCrossed,
    crossedAt,
    currentRisk,
    projectedCrossing,
    daysToCrossing,
    riskLevel: currentRisk,
    trend: trend.trend,
    currentValue: latest,
    threshold: riskThresholds.moderate
  };
}

/**
 * Predict future date when threshold will be crossed
 * @param {Array<number>} values - Historical values
 * @param {number} threshold - Threshold value to predict crossing
 * @param {boolean} higherIsWorse - Whether higher values indicate worse condition
 * @param {Date} startDate - Starting date for the data
 * @param {number} daysPerPoint - Average days between data points
 * @returns {Object} Prediction results with date
 */
export function predictFutureDate(values, threshold, higherIsWorse, startDate = new Date(), daysPerPoint = 1) {
  const nums = values.map(Number).filter(n => Number.isFinite(n));
  if (nums.length < 2) {
    return {
      predictedDate: null,
      daysFromNow: null,
      confidence: 0,
      isValid: false
    };
  }

  const trend = calculateLinearTrend(nums);
  if (!trend.isValid || Math.abs(trend.slope) < 0.01) {
    return {
      predictedDate: null,
      daysFromNow: null,
      confidence: 0,
      isValid: false,
      reason: 'Insufficient trend'
    };
  }

  const currentX = nums.length - 1;
  const currentY = nums[currentX];
  
  // Calculate when trend line will cross threshold
  let xAtCrossing = null;
  
  if (higherIsWorse && trend.slope > 0 && currentY < threshold) {
    xAtCrossing = (threshold - trend.intercept) / trend.slope;
  } else if (!higherIsWorse && trend.slope < 0 && currentY > threshold) {
    xAtCrossing = (threshold - trend.intercept) / trend.slope;
  }

  if (xAtCrossing === null || xAtCrossing <= currentX) {
    return {
      predictedDate: null,
      daysFromNow: null,
      confidence: 0,
      isValid: false,
      reason: 'Threshold already crossed or trend not moving toward threshold'
    };
  }

  // Calculate days from now
  const pointsFromNow = xAtCrossing - currentX;
  const daysFromNow = Math.ceil(pointsFromNow * daysPerPoint);
  
  // Calculate predicted date
  const predictedDate = new Date(startDate);
  predictedDate.setDate(predictedDate.getDate() + Math.round(pointsFromNow * daysPerPoint));

  // Confidence based on R-squared and data points
  const confidence = Math.min(0.95, trend.rSquared * (nums.length / 10));

  return {
    predictedDate,
    daysFromNow,
    confidence: Number(confidence.toFixed(2)),
    isValid: true,
    trendSlope: trend.slope,
    rSquared: trend.rSquared,
    currentValue: currentY,
    threshold,
    pointsFromNow: Number(pointsFromNow.toFixed(1))
  };
}

/**
 * Calculate early risk indicators based on trend and thresholds
 * @param {Array<number>} values - Historical values
 * @param {Object} config - Configuration object
 * @returns {Object} Early risk analysis
 */
export function calculateEarlyRisk(values, config = {}) {
  const {
    thresholds = { low: 30, moderate: 50, high: 70 },
    higherIsWorse = true,
    startDate = new Date(),
    daysPerPoint = 1,
    riskMetric = 'dementia_risk_score'
  } = config;

  const nums = values.map(Number).filter(n => Number.isFinite(n));
  if (nums.length < 3) {
    return {
      riskLevel: 'insufficient_data',
      trend: 'unknown',
      earlyWarning: false,
      projectedRisk: null,
      daysToRisk: null,
      confidence: 0
    };
  }

  const trend = calculateLinearTrend(nums);
  const thresholdAnalysis = detectThresholdCrossing(nums, thresholds, higherIsWorse);
  const futurePrediction = predictFutureDate(
    nums,
    thresholds.moderate,
    higherIsWorse,
    startDate,
    daysPerPoint
  );

  // Determine early warning
  const latest = nums[nums.length - 1];
  const earlyWarning = 
    (higherIsWorse && trend.slope > 0.5 && latest < thresholds.moderate) ||
    (!higherIsWorse && trend.slope < -0.5 && latest > thresholds.moderate);

  // Calculate projected risk at future date
  let projectedRisk = null;
  if (futurePrediction.isValid && futurePrediction.pointsFromNow <= 30) {
    const futureX = nums.length - 1 + futurePrediction.pointsFromNow;
    projectedRisk = trend.slope * futureX + trend.intercept;
  }

  return {
    riskLevel: thresholdAnalysis.riskLevel,
    trend: trend.trend,
    trendSlope: trend.slope,
    rSquared: trend.rSquared,
    earlyWarning,
    currentValue: latest,
    projectedRisk: projectedRisk ? Number(projectedRisk.toFixed(1)) : null,
    daysToRisk: futurePrediction.daysFromNow,
    predictedDate: futurePrediction.predictedDate,
    confidence: futurePrediction.confidence,
    thresholdCrossed: thresholdAnalysis.hasCrossed,
    thresholdCrossedAt: thresholdAnalysis.crossedAt,
    equation: trend.equation
  };
}

/**
 * Predict dementia timeline based on risk score trends
 * Estimates when dementia risk may reach critical thresholds
 * @param {Array<number>} riskScores - Historical risk scores (0-100 scale)
 * @param {Object} config - Configuration object
 * @returns {Object} Timeline prediction with years to dementia
 */
export function predictDementiaTimeline(riskScores = [], config = {}) {
  const {
    startDate = new Date(),
    daysPerPoint = 7,
    criticalThreshold = 70, // High risk threshold
    moderateThreshold = 50,  // Moderate risk threshold
    highRiskThreshold = 80   // Very high risk threshold
  } = config;

  const nums = riskScores.map(Number).filter(n => Number.isFinite(n) && n >= 0 && n <= 100);
  const n = nums.length;

  // Require at least 3 points for a reasonable projection
  if (n < 3) {
    return {
      isValid: false,
      reason: 'Insufficient data points',
      yearsToModerate: null,
      yearsToCritical: null,
      yearsToHighRisk: null,
      currentRisk: 'unknown',
      confidence: 0
    };
  }

  const latest = nums[n - 1];
  const trend = calculateLinearTrend(nums);
  const slope = trend.slope;
  const r2 = trend.rSquared || 0;

  // If trend is flat or improving, and latest below moderate, consider low risk
  if (slope <= 0 && latest < moderateThreshold) {
    return {
      isValid: true,
      isLowRisk: true,
      currentRisk: 'low',
      yearsToModerate: null,
      yearsToCritical: null,
      yearsToHighRisk: null,
      monthsToModerate: null,
      monthsToCritical: null,
      monthsToHighRisk: null,
      predictedDateModerate: null,
      predictedDateCritical: null,
      predictedDateHighRisk: null,
      message: 'Risk trend is stable or improving; no projected threshold crossing',
      confidence: Math.min(0.4 + r2 * 0.4, 0.85),
      trend: trend.trend,
      trendSlope: slope,
      rSquared: r2,
      latestScore: latest,
      equation: trend.equation
    };
  }
  
  // Determine current risk level
  let currentRisk = 'low';
  if (latest >= highRiskThreshold) {
    currentRisk = 'very_high';
  } else if (latest >= criticalThreshold) {
    currentRisk = 'high';
  } else if (latest >= moderateThreshold) {
    currentRisk = 'moderate';
  }

  // If already at very high risk AND slope is increasing, flag immediate
  if ((currentRisk === 'very_high' || currentRisk === 'high') && slope > 0.05) {
    return {
      isValid: true,
      currentRisk,
      yearsToModerate: 0,
      yearsToCritical: 0,
      yearsToHighRisk: 0,
      message: 'High risk detected - immediate attention recommended',
      confidence: Math.min(0.95, 0.6 + r2 * 0.4),
      trend: trend.trend,
      trendSlope: slope,
      rSquared: r2,
      latestScore: latest,
      isLowRisk: false
    };
  }

  // If high but slope not increasing, treat as monitored but not immediate
  if ((currentRisk === 'very_high' || currentRisk === 'high') && slope <= 0.05) {
    return {
      isValid: true,
      currentRisk,
      yearsToModerate: 0,
      yearsToCritical: 0,
      yearsToHighRisk: 0,
      message: 'High risk present but stable; close monitoring advised',
      confidence: Math.min(0.8, 0.5 + r2 * 0.3),
      trend: trend.trend,
      trendSlope: slope,
      rSquared: r2,
      latestScore: latest,
      isLowRisk: false
    };
  }

  // Calculate predictions for different thresholds
  const predictions = {};
  const thresholds = [
    { name: 'moderate', value: moderateThreshold },
    { name: 'critical', value: criticalThreshold },
    { name: 'highRisk', value: highRiskThreshold }
  ];

  thresholds.forEach(({ name, value }) => {
    if (latest >= value) {
      predictions[name] = { years: 0, days: 0, isValid: true };
    } else if (slope > 0.05) {
      // Calculate when trend line will cross threshold
      const currentX = nums.length - 1;
      const xAtCrossing = (value - trend.intercept) / slope;
      
      if (xAtCrossing > currentX) {
        const pointsFromNow = xAtCrossing - currentX;
        const daysFromNow = pointsFromNow * daysPerPoint;
        const yearsFromNow = daysFromNow / 365.25;
        
        predictions[name] = {
          years: Math.max(0, Number(yearsFromNow.toFixed(1))),
          days: Math.ceil(daysFromNow),
          months: Math.ceil(daysFromNow / 30),
          isValid: true,
          predictedDate: new Date(startDate.getTime() + daysFromNow * 24 * 60 * 60 * 1000)
        };
      } else {
        predictions[name] = { years: null, days: null, isValid: false, reason: 'Threshold already crossed' };
      }
    } else {
      predictions[name] = { years: null, days: null, isValid: false, reason: 'Trend not increasing enough for projection' };
    }
  });

  // Calculate confidence based on R-squared, data points, and slope strength
  const slopeStrength = Math.min(Math.abs(slope) / 1.5, 1); // normalize slope influence
  const confidence = Math.min(
    0.95,
    (r2 * 0.6) + (Math.min(n / 12, 1) * 0.25) + (slopeStrength * 0.15)
  );
  
  // Generate human-readable message
  let message = '';
  if (predictions.critical?.isValid && predictions.critical.years !== null) {
    const years = predictions.critical.years;
    if (years < 1) {
      message = `High risk may occur within ${predictions.critical.months} months`;
    } else if (years < 5) {
      message = `High risk may occur within ${years} years`;
    } else if (years < 10) {
      message = `High risk may occur in approximately ${years} years`;
    } else {
      message = `High risk may occur in ${years} years (long-term projection)`;
    }
  } else if (predictions.moderate?.isValid && predictions.moderate.years !== null) {
    const years = predictions.moderate.years;
    if (years < 1) {
      message = `Moderate risk may occur within ${predictions.moderate.months} months`;
    } else {
      message = `Moderate risk may occur in approximately ${years} years`;
    }
  } else {
    message = 'Risk trend is stable or improving';
  }

  return {
    isValid: true,
    currentRisk,
    yearsToModerate: predictions.moderate?.years ?? null,
    yearsToCritical: predictions.critical?.years ?? null,
    yearsToHighRisk: predictions.highRisk?.years ?? null,
    daysToModerate: predictions.moderate?.days ?? null,
    daysToCritical: predictions.critical?.days ?? null,
    daysToHighRisk: predictions.highRisk?.days ?? null,
    monthsToModerate: predictions.moderate?.months ?? null,
    monthsToCritical: predictions.critical?.months ?? null,
    monthsToHighRisk: predictions.highRisk?.months ?? null,
    predictedDateModerate: predictions.moderate?.predictedDate ?? null,
    predictedDateCritical: predictions.critical?.predictedDate ?? null,
    predictedDateHighRisk: predictions.highRisk?.predictedDate ?? null,
    message,
    confidence: Number(confidence.toFixed(2)),
    trend: trend.trend,
    trendSlope: trend.slope,
    rSquared: trend.rSquared,
    latestScore: latest,
    equation: trend.equation
  };
}

export default {
  calculateLinearTrend,
  calculateTrendLine,
  detectThresholdCrossing,
  predictFutureDate,
  calculateEarlyRisk,
  predictDementiaTimeline
};

