/**
 * Utility helpers to compute probability and trend for dementia risk.
 * Now more robust: combines latest value, recent slope, and stability.
 */

const clamp = (val, min = 0, max = 1) => Math.min(max, Math.max(min, val));

const toNumberArray = (values = []) => {
  if (!Array.isArray(values)) values = [values];
  return values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
};

const linearSlope = (values) => {
  const y = toNumberArray(values);
  const n = y.length;
  if (n === 0) return 0;
  if (n === 1) return 0;

  // Simple least-squares slope with x = 0..n-1
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += y[i];
    sumXY += i * y[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
};

const rollingAvg = (values, k = 3) => {
  const y = toNumberArray(values);
  if (!y.length) return null;
  const start = Math.max(0, y.length - k);
  const slice = y.slice(start);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
};

const stdDev = (values) => {
  const y = toNumberArray(values);
  if (y.length < 2) return 0;
  const avg = y.reduce((a, b) => a + b, 0) / y.length;
  const variance = y.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / y.length;
  return Math.sqrt(variance);
};

export function computeDementiaProbability({ riskScores = [], metrics = {} } = {}) {
  // Normalize to 0-100 scale
  const scores = toNumberArray(riskScores).map((s) => (s <= 1 ? s * 100 : s));
  const latest = scores.length ? scores[scores.length - 1] : null;
  const avgRecent = rollingAvg(scores, 3);
  const slope = linearSlope(scores);
  const volatility = stdDev(scores);

  // Confidence: more points + lower volatility
  const confidence = clamp((scores.length / 12) * 0.6 + (1 / (1 + volatility / 25)) * 0.4, 0, 1);

  // Trend direction
  const trend =
    slope > 0.3 ? "deteriorating" :
    slope < -0.3 ? "improving" : "stable";

  // Probability: weighted combo of latest, recent average, and slope influence
  const latestProb = latest != null ? latest / 100 : 0.5;
  const avgProb = avgRecent != null ? avgRecent / 100 : latestProb;
  const slopeSignal = clamp(slope / 20, -0.3, 0.3);
  const stabilityPenalty = clamp(volatility / 120, 0, 0.15); // higher volatility reduces probability confidence

  let probability = latestProb * 0.6 + avgProb * 0.25 + slopeSignal * 0.15;
  probability = clamp(probability - stabilityPenalty, 0, 1);

  const riskLabel =
    probability >= 0.75 ? "High" :
    probability >= 0.45 ? "Moderate" : "Low";

  // Pull a few latest cognitive metrics to echo back
  const latestMetrics = Object.entries(metrics || {}).reduce((acc, [key, val]) => {
    const arr = Array.isArray(val) ? val : [val];
    if (arr.length === 0) return acc;
    const num = Number(arr[arr.length - 1]);
    if (Number.isFinite(num)) {
      acc[key] = num;
    }
    return acc;
  }, {});

  return {
    probability,         // 0..1
    probabilityPercent: Math.round(probability * 1000) / 10, // one decimal
    riskLabel,
    trend,
    slope,
    confidence,
    latestRisk: latest,
    dataPoints: scores.length,
    latestMetrics,
  };
}

export default {
  computeDementiaProbability,
};

