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

export default {
  calculateLinearTrend,
  calculateTrendLine,
  detectThresholdCrossing,
  predictFutureDate,
  calculateEarlyRisk
};

