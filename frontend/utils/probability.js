/**
 * Utility helpers to compute probability and trend for dementia risk.
 * This is intentionally simple and transparent: it uses the latest value
 * and a linear slope over the series to estimate direction.
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

export function computeDementiaProbability({ riskScores = [], metrics = {} } = {}) {
  const scores = toNumberArray(riskScores).map((s) => (s <= 1 ? s * 100 : s)); // normalize to 0-100 scale
  const latest = scores.length ? scores[scores.length - 1] : null;
  const slope = linearSlope(scores);

  // Confidence grows with more data points, capped
  const confidence = clamp(scores.length / 10, 0, 1);

  // Probability combines latest score and slope signal
  const slopeSignal = clamp(slope / 25, -0.25, 0.25); // slope influence bounded
  const baseProb = latest != null ? latest / 100 : 0.5;
  const probability = clamp(baseProb + slopeSignal, 0, 1);

  const trend =
    slope > 0.2 ? "deteriorating" :
    slope < -0.2 ? "improving" : "stable";

  const riskLabel =
    probability > 0.7 ? "High" :
    probability > 0.4 ? "Moderate" : "Low";

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

