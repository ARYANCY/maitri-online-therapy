import React, { useState, useMemo, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import "../css/components/Chart.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTranslation } from "react-i18next";
import { computeDementiaProbability } from "../utils/probability";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Chart({ chartData = {}, chartLabels = [], onRefresh }) {
  const { t } = useTranslation();

  const [chartType, setChartType] = useState("bar");
  const [metricsType, setMetricsType] = useState("emotional");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasData, setHasData] = useState(false);

  const normalizeArray = (arr, length) => {
    const targetLength = Number.isFinite(length) && length > 0 ? length : (Array.isArray(arr) ? arr.length : 0) || 0;
    if (!arr) return Array(targetLength).fill(0);
    const base = Array.isArray(arr) ? arr : [arr];
    return Array.from({ length: targetLength }, (_, i) => {
      const value = base[i];
      const num = Number(value);
      if (Number.isFinite(num)) return num;
      return 0;
    });
  };

  // Derive an effective length based on labels or any available dataset so we don't drop values
  const maxDataLength = useMemo(() => {
    const lengths = [];
    if (Array.isArray(chartLabels)) lengths.push(chartLabels.length);
    if (chartData && typeof chartData === "object") {
      Object.values(chartData).forEach(v => {
        if (Array.isArray(v)) lengths.push(v.length);
        else if (v != null) lengths.push(1);
      });
    }
    return lengths.length ? Math.max(...lengths) : 0;
  }, [chartData, chartLabels]);

  // Build labels that match the longest dataset to keep charts aligned
  const effectiveLabels = useMemo(() => {
    const len = maxDataLength;
    if (len === 0) return [];
    if (chartLabels && chartLabels.length >= len) return chartLabels;
    return Array.from({ length: len }, (_, i) => chartLabels[i] || `${t("chart.entry", "Entry")} ${i + 1}`);
  }, [chartLabels, maxDataLength, t]);

  useEffect(() => {
    const hasValidData = maxDataLength > 0 && chartData && Object.keys(chartData).length > 0;
    setHasData(hasValidData);
  }, [chartData, maxDataLength]);

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  const data = useMemo(() => {
    if (!effectiveLabels.length) return { labels: [], datasets: [] };

    const len = effectiveLabels.length;
    let datasets = [];

    if (metricsType === "emotional") {
      datasets = [
        { label: t("chart.stress", "Stress"), data: normalizeArray(chartData.stress_level, len), color: "255,99,132" },
        { label: t("chart.happiness", "Happiness"), data: normalizeArray(chartData.happiness_level, len), color: "75,192,192" },
        { label: t("chart.anxiety", "Anxiety"), data: normalizeArray(chartData.anxiety_level, len), color: "255,206,86" },
        { label: t("chart.overallMood", "Overall Mood"), data: normalizeArray(chartData.overall_mood_level, len), color: "54,162,235" },
      ];
    } else if (metricsType === "screening") {
      datasets = [
        { label: t("chart.phq9", "PHQ-9"), data: normalizeArray(chartData.phq9_score, len), color: "255,99,132" },
        { label: t("chart.gad7", "GAD-7"), data: normalizeArray(chartData.gad7_score, len), color: "54,162,235" },
        { label: t("chart.ghq", "GHQ"), data: normalizeArray(chartData.ghq_score, len), color: "255,206,86" },
      ];
    } else if (metricsType === "dementia") {
      
      const metricColors = {
        reactionTime: "255,99,132",        
        accuracy: "75,192,192",            
        workingMemory: "54,162,235",      
        executiveFunction: "255,206,86",  
        visuospatial: "153,102,255",      
        attention: "255,159,64",           
        language: "201,203,207",           
        processingSpeed: "255,99,71",     
        learningCurve: "50,205,50",        
        errorRate: "220,20,60"             
      };
      
      datasets = [
        { 
          label: t("chart.reactionTime", "Reaction Time") + " (ms)", 
          data: normalizeArray(chartData.reactionTimeAverage, len).map(s => s !== null ? s : 0), 
          color: metricColors.reactionTime 
        },
        { 
          label: t("chart.accuracy", "Accuracy") + " (%)", 
          data: normalizeArray(chartData.accuracyPercentage, len).map(s => s !== null ? s : 0), 
          color: metricColors.accuracy 
        },
        { 
          label: t("chart.workingMemorySpan", "Working Memory Span"), 
          data: normalizeArray(chartData.workingMemorySpan, len).map(s => s !== null ? s : 0), 
          color: metricColors.workingMemory 
        },
        { 
          label: t("chart.executiveFunction", "Executive Function"), 
          data: normalizeArray(chartData.executiveFunction, len).map(s => s !== null ? s : 0), 
          color: metricColors.executiveFunction 
        },
        { 
          label: t("chart.visuospatialAccuracy", "Visuospatial Accuracy") + " (%)", 
          data: normalizeArray(chartData.visuospatialAccuracy, len).map(s => s !== null ? s : 0), 
          color: metricColors.visuospatial 
        },
        { 
          label: t("chart.attentionConsistency", "Attention Consistency") + " (%)", 
          data: normalizeArray(chartData.attentionConsistency, len).map(s => s !== null ? s : 0), 
          color: metricColors.attention 
        },
        { 
          label: t("chart.processingSpeed", "Processing Speed") + " (s)", 
          data: normalizeArray(chartData.processingSpeed, len).map(s => s !== null ? s : 0), 
          color: metricColors.processingSpeed 
        },
        { 
          label: t("chart.learningCurve", "Learning Curve"), 
          data: normalizeArray(chartData.learningCurve, len).map(s => s !== null ? s : 0), 
          color: metricColors.learningCurve 
        },
        { 
          label: t("chart.errorRate", "Error Rate") + " (%)", 
          data: normalizeArray(chartData.errorRate, len).map(s => s !== null ? s : 0), 
          color: metricColors.errorRate 
        },
        
        { 
          label: t("chart.cognitiveRisk", "Cognitive Impairment Risk") + " (%)", 
          data: normalizeArray(chartData.dementia_risk_score, len).map(score => {
            return score <= 1 ? Math.round(score * 100) : Math.round(score);
          }), 
          color: "153,102,255",
          borderDash: [5, 5] 
        }
      ];
    }

    return {
      labels: effectiveLabels,
      datasets: datasets.map((ds, index) => {
        const isDashed = ds.borderDash && ds.borderDash.length > 0;
        const baseColor = `rgba(${ds.color},1)`;
        const fillColor = `rgba(${ds.color},${chartType === "line" ? 0.15 : 0.7})`;
        
        return {
          label: ds.label,
          data: ds.data,
          borderColor: baseColor,
          backgroundColor: fillColor,
          borderWidth: chartType === "line" ? 3 : 2,
          borderRadius: chartType === "bar" ? 6 : 0,
          borderSkipped: false,
          fill: chartType === "line",
          spanGaps: true,
          tension: chartType === "line" ? 0.4 : 0,
          pointRadius: chartType === "line" ? 4 : 0,
          pointHoverRadius: chartType === "line" ? 6 : 0,
          pointBackgroundColor: baseColor,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: baseColor,
          pointHoverBorderColor: '#FFFFFF',
          pointHoverBorderWidth: 3,
          borderDash: isDashed ? ds.borderDash : [],
          animation: {
            delay: index * 50,
          },
        };
      }),
    };
  }, [chartData, effectiveLabels, metricsType, chartType, t]);

  const dementiaSummary = useMemo(() => {
    if (metricsType !== "dementia") return null;

    const riskScores = Array.isArray(chartData?.dementia_risk_score) ? chartData.dementia_risk_score : [];

    const metrics = {
      reactionTime: chartData?.reactionTimeAverage,
      accuracy: chartData?.accuracyPercentage,
      workingMemory: chartData?.workingMemorySpan,
      executiveFunction: chartData?.executiveFunction,
      visuospatial: chartData?.visuospatialAccuracy,
      attention: chartData?.attentionConsistency,
      processingSpeed: chartData?.processingSpeed,
      learningCurve: chartData?.learningCurve,
      errorRate: chartData?.errorRate,
    };

    return computeDementiaProbability({ riskScores, metrics });
  }, [chartData, metricsType]);

  const trendInfo = useMemo(() => {
    if (!dementiaSummary) return null;
    const map = {
      deteriorating: { label: t("chart.trendWorseShort", "Deteriorating"), icon: "⬆️", className: "bg-danger text-white" },
      improving: { label: t("chart.trendBetterShort", "Improving"), icon: "⬇️", className: "bg-success text-white" },
      stable: { label: t("chart.trendStableShort", "Stable"), icon: "⏸️", className: "bg-secondary text-white" },
    };
    return map[dementiaSummary.trend] || map.stable;
  }, [dementiaSummary, t]);

  const summaryItems = useMemo(() => {
    if (!hasData || !data || !data.datasets || !data.datasets.length) return [];

    if (metricsType === "dementia" && dementiaSummary) {
      return [
        {
          title: t("chart.summaryRisk", "Risk probability"),
          value: `${dementiaSummary.probabilityPercent.toFixed(1)}%`,
          note: dementiaSummary.riskLabel,
        },
        {
          title: t("chart.summaryTrend", "Trend"),
          value: trendInfo?.label || dementiaSummary.trend,
          note: dementiaSummary.trend === "deteriorating"
            ? t("chart.summaryTrendWorse", "Recent data shows increasing risk")
            : dementiaSummary.trend === "improving"
              ? t("chart.summaryTrendBetter", "Recent data shows improvement")
              : t("chart.summaryTrendStable", "Recent data is stable"),
        },
        {
          title: t("chart.summaryLatest", "Latest score"),
          value: dementiaSummary.latestRisk != null ? `${Math.round(dementiaSummary.latestRisk * 10) / 10}` : "—",
          note: t("chart.summaryPoints", "Data points") + `: ${dementiaSummary.dataPoints}`,
        },
      ];
    }

    if (statistics) {
      return [
        { title: t("chart.summaryAverage", "Average"), value: statistics.avg, note: t("chart.summaryAllSeries", "Across all visible data")) },
        { title: t("chart.summaryMax", "Maximum"), value: statistics.max, note: t("chart.summaryBest", "Highest recorded value") },
        { title: t("chart.summaryMin", "Minimum"), value: statistics.min, note: t("chart.summaryLowest", "Lowest recorded value") },
        { title: t("chart.summaryCount", "Data points"), value: statistics.count, note: t("chart.summarySamples", "Samples in this view") },
      ];
    }

    return [];
  }, [hasData, data, dementiaSummary, statistics, trendInfo, metricsType, t]);

  const lastDementiaValues = useMemo(() => {
    if (metricsType !== "dementia") return [];
    const getLast = (arr) => {
      if (!arr) return null;
      if (Array.isArray(arr) && arr.length > 0) return arr[arr.length - 1];
      return Array.isArray(arr) ? null : arr;
    };

    return [
      { label: t("chart.cognitiveRisk", "Cognitive Impairment Risk"), value: getLast(chartData?.dementia_risk_score), suffix: "%" },
      { label: t("chart.reactionTime", "Reaction Time"), value: getLast(chartData?.reactionTimeAverage), suffix: "ms" },
      { label: t("chart.accuracy", "Accuracy"), value: getLast(chartData?.accuracyPercentage), suffix: "%" },
      { label: t("chart.processingSpeed", "Processing Speed"), value: getLast(chartData?.processingSpeed), suffix: "s" },
      { label: t("chart.errorRate", "Error Rate"), value: getLast(chartData?.errorRate), suffix: "%" },
    ].filter(item => item.value != null);
  }, [chartData, metricsType, t]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 800,
      easing: 'easeInOutQuart',
      onComplete: () => {
        
      },
    },
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 13,
            weight: '600',
            family: 'Inter, sans-serif',
          },
          color: '#1C1C1C',
          boxWidth: 12,
          boxHeight: 12,
        },
        onClick: (e, legendItem) => {
          
        },
      },
      title: {
        display: true,
        text: `${t("chart.title", "User Metrics")} (${metricsType === "emotional" ? t("chart.emotionalMetrics", "Emotional Metrics") : metricsType === "screening" ? t("chart.screeningMetrics", "Screening Metrics") : t("chart.dementiaMetrics", "Dementia Progress")})`,
        font: {
          size: 18,
          weight: '700',
          family: 'Inter, sans-serif',
        },
        color: '#1C1C1C',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(28, 28, 28, 0.95)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: 'rgba(111, 174, 154, 0.5)',
        borderWidth: 2,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '700',
        },
        bodyFont: {
          size: 13,
          weight: '500',
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const value = context.parsed.y;
              if (metricsType === "dementia" && label.includes("Risk")) {
                label += value + '%';
              } else {
                label += value.toFixed(1);
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 11,
            weight: '500',
          },
          color: '#5A5A5A',
          padding: 8,
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
        },
        border: {
          display: true,
          color: 'rgba(111, 174, 154, 0.2)',
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: metricsType === "dementia" 
          ? 100
          : (data && data.datasets && data.datasets.length > 0 
              ? Math.max(...data.datasets.flatMap(ds => ds.data || []).filter(v => v != null), 10) * 1.1
              : 50),
        ticks: {
          font: {
            size: 11,
            weight: '500',
          },
          color: '#5A5A5A',
          padding: 8,
          callback: function(value) {
            if (metricsType === "dementia" && value <= 100) {
              return value;
            }
            return value.toFixed(0);
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
        },
        border: {
          display: true,
          color: 'rgba(111, 174, 154, 0.2)',
        },
      },
    },
  }), [data, metricsType, t]);

  
  const statistics = useMemo(() => {
    if (!data || !data.datasets || !data.datasets.length) return null;
    
    const allValues = data.datasets.flatMap(ds => ds.data || []).filter(v => v != null && v > 0);
    if (allValues.length === 0) return null;

    const sum = allValues.reduce((a, b) => a + b, 0);
    const avg = sum / allValues.length;
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);

    return { avg: avg.toFixed(1), max: max.toFixed(1), min: min.toFixed(1), count: allValues.length };
  }, [data]);

  if (!data || !data.datasets || !data.datasets.length || !hasData) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="fs-1 mb-3">📊</div>
          <h3 className="h4 mb-3">{t("chart.noDataTitle", "No Data Available")}</h3>
          <p className="text-muted mb-4">{t("chart.noData", "No metrics available yet. Start chatting with Vaidhya to generate your health metrics.")}</p>
          {onRefresh && (
            <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={handleRefresh} disabled={isRefreshing}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className={isRefreshing ? 'spinning' : ''}
                viewBox="0 0 16 16"
              >
                <path
                  d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
                ></path>
                <path
                  fillRule="evenodd"
                  d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                ></path>
              </svg>
              {isRefreshing ? t("chart.refreshing", "Refreshing...") : t("chart.refresh", "Refresh")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card card">
      
      <div className="card border-warning mb-3 mx-3 mt-3" style={{borderWidth: "2px"}}>
        <div className="card-header bg-warning text-dark d-flex align-items-center gap-2">
          <div className="fs-4 fs-md-3">⚠️</div>
          <h3 className="h6 h-md-5 mb-0">Important Disclaimer</h3>
        </div>
        <div className="card-body">
          <p className="mb-0">
            <strong>⚠️ Disclaimer:</strong> This content is AI-generated. No medical diagnosis is provided. These metrics are for calculating risk factors only. For more accurate results and proper medical evaluation, please consult a qualified healthcare professional.
          </p>
        </div>
      </div>

      <div className="chart-controls card-header d-flex justify-content-end align-items-center gap-3 flex-wrap pb-3">
        <div className="d-flex flex-column gap-2">
          <label htmlFor="chart-type-select" className="form-label d-flex align-items-center gap-2 mb-0">
            <span>📊</span>
            {t("chart.chartType", "Chart Type")}
          </label>
          <select
            id="chart-type-select"
            name="chart-type-select"
            value={chartType}
            onChange={e => setChartType(e.target.value)}
            className="form-select"
            aria-label={t("chart.chartType", "Chart Type")}
          >
            <option value="bar">{t("chart.barChart", "Bar Chart")}</option>
            <option value="line">{t("chart.lineChart", "Line Chart")}</option>
          </select>
        </div>

        <div className="d-flex flex-column gap-2">
          <label htmlFor="chart-metric-type-select" className="form-label d-flex align-items-center gap-2 mb-0">
            <span>📈</span>
            {t("chart.metricType", "Metric Type")}
          </label>
          <select
            id="chart-metric-type-select"
            name="chart-metric-type-select"
            value={metricsType}
            onChange={e => setMetricsType(e.target.value)}
            className="form-select"
            aria-label={t("chart.metricType", "Metric Type")}
          >
            <option value="emotional">{t("chart.emotionalMetrics", "Emotional Metrics")}</option>
            <option value="screening">{t("chart.screeningMetrics", "Screening Metrics")}</option>
            <option value="dementia">{t("chart.dementiaMetrics", "Cognitive Impairment")}</option>
          </select>
        </div>

        {onRefresh && (
          <button 
            className="btn btn-primary d-flex align-items-center gap-2" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label={t("chart.refresh", "Refresh")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className={isRefreshing ? 'spinning' : ''}
              viewBox="0 0 16 16"
            >
              <path
                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
              ></path>
              <path
                fillRule="evenodd"
                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
              ></path>
            </svg>
            {isRefreshing ? t("chart.refreshing", "Refreshing...") : t("chart.refresh", "Refresh")}
          </button>
        )}
      </div>

      <div className="card-body">
        
        {statistics && (
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="fs-3 mb-2">📊</div>
                  <div className="text-muted small">{t("chart.average", "Average")}</div>
                  <div className="h4 mb-0">{statistics.avg}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="fs-3 mb-2">⬆️</div>
                  <div className="text-muted small">{t("chart.maximum", "Maximum")}</div>
                  <div className="h4 mb-0">{statistics.max}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="fs-3 mb-2">⬇️</div>
                  <div className="text-muted small">{t("chart.minimum", "Minimum")}</div>
                  <div className="h4 mb-0">{statistics.min}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="fs-3 mb-2">📈</div>
                  <div className="text-muted small">{t("chart.dataPoints", "Data Points")}</div>
                  <div className="h4 mb-0">{statistics.count}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="chart-wrapper mb-4">
          {chartType === "bar" ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
        </div>

        {metricsType === "dementia" && dementiaSummary && (
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center gap-2">
              <div className="fs-3">🧠</div>
              <div>
                <h2 className="h5 mb-0">{t("chart.dementiaSummary", "Cognitive Risk Summary")}</h2>
                <small className="text-muted">
                  {t("chart.dementiaSummaryHint", "Latest data, trend, and probability of deterioration or improvement")}
                </small>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <div className="card bg-light h-100">
                    <div className="card-body">
                      <div className="text-muted small mb-1">{t("chart.probability", "Probability (deterioration)")}</div>
                      <div className="h3 mb-1">{dementiaSummary.probabilityPercent.toFixed(1)}%</div>
                      <span className="badge bg-secondary">{dementiaSummary.riskLabel}</span>
                      <div className="small text-muted mt-1">
                        {t("chart.summaryNoteProb", "Higher % suggests greater deterioration risk")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="text-muted small mb-1">{t("chart.trend", "Trend")}</div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className={`badge ${trendInfo?.className || "bg-secondary text-white"}`}>
                          {trendInfo?.icon} {trendInfo?.label || dementiaSummary.trend}
                        </span>
                      </div>
                      <small className="text-muted">
                        {dementiaSummary.trend === "deteriorating"
                          ? t("chart.trendWorse", "Higher risk over recent entries")
                          : dementiaSummary.trend === "improving"
                            ? t("chart.trendBetter", "Risk moving down")
                            : t("chart.trendStable", "Risk stable")}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="text-muted small mb-1">{t("chart.latestRisk", "Latest risk score")}</div>
                      <div className="h4 mb-1">{dementiaSummary.latestRisk != null ? Math.round(dementiaSummary.latestRisk * 10) / 10 : "—"}</div>
                      <small className="text-muted">
                        {t("chart.dataPoints", "Data Points")}: {dementiaSummary.dataPoints}
                      </small>
                      <div className="small text-muted mt-1">
                        {t("chart.summaryNoteLatest", "Most recent score in the series")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="text-muted small mb-1">{t("chart.confidence", "Confidence")}</div>
                      <div className="h5 mb-1">{Math.round(dementiaSummary.confidence * 100)}%</div>
                      <small className="text-muted">{t("chart.confidenceNote", "More data improves confidence")}</small>
                      <div className="progress mt-2" style={{height: "6px"}}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${Math.round(dementiaSummary.confidence * 100)}%` }}
                          aria-valuenow={Math.round(dementiaSummary.confidence * 100)}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {lastDementiaValues.length > 0 && (
                <div className="mt-3">
                  <div className="text-muted small mb-2">{t("chart.latestValues", "Latest data points")}</div>
                  <div className="row g-2">
                    {lastDementiaValues.map((item, idx) => (
                      <div className="col-6 col-md-4 col-lg-3" key={idx}>
                        <div className="card h-100">
                          <div className="card-body py-3">
                            <div className="text-muted small mb-1">{item.label}</div>
                            <div className="h5 mb-0">
                              {Number(item.value).toFixed(1)}
                              {item.suffix ? ` ${item.suffix}` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {summaryItems.length > 0 && (
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center gap-2">
              <div className="fs-3">📝</div>
              <h2 className="h5 mb-0">{t("chart.quickSummary", "Quick Summary")}</h2>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {summaryItems.map((item, idx) => (
                  <div className="col-6 col-md-3" key={`${item.title}-${idx}`}>
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="text-muted small mb-1">{item.title}</div>
                        <div className="h4 mb-1">{item.value}</div>
                        <small className="text-muted">{item.note}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="chart-info-section">
          
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center gap-3">
              <div className="fs-1">📊</div>
              <div>
                <h2 className="h4 mb-1">{t("chart.infoTitle", "Metrics Overview")}</h2>
                <p className="text-muted mb-0 small">
                  {t("chart.infoSubtitle", "Track your mental health and cognitive wellbeing")}
                </p>
              </div>
            </div>
            <div className="card-body">
              <p className="mb-4">
                {t(
                  "chart.infoDescription",
                  "This chart visualizes your selected metrics over time. You can toggle between emotional metrics, screening assessments, and cognitive impairment risk. Choose your preferred chart type (bar or line) to view trends."
                )}
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-3">
                    <div className="fs-3">📈</div>
                    <div>
                      <strong>{t("chart.feature1Title", "Real-time Tracking")}</strong>
                      <p className="text-muted mb-0 small">{t("chart.feature1Desc", "Monitor changes over time")}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-3">
                    <div className="fs-3">🎯</div>
                    <div>
                      <strong>{t("chart.feature2Title", "Multiple Metrics")}</strong>
                      <p className="text-muted mb-0 small">{t("chart.feature2Desc", "Emotional, screening & cognitive")}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-3">
                    <div className="fs-3">📊</div>
                    <div>
                      <strong>{t("chart.feature3Title", "Visual Insights")}</strong>
                      <p className="text-muted mb-0 small">{t("chart.feature3Desc", "Bar and line chart options")}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-3">
                    <div className="fs-3">🔄</div>
                    <div>
                      <strong>{t("chart.feature4Title", "Auto Refresh")}</strong>
                      <p className="text-muted mb-0 small">{t("chart.feature4Desc", "Stay updated with latest data")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        
        {metricsType === "emotional" && (
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="h5 mb-0">📊 {t("chart.howScoringWorks", "How Emotional Metrics Are Scored & Evaluated")}</h3>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5 className="mb-3">{t("chart.scoringMethodology", "Scoring Methodology")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("chart.emotionalScoringExplanation", "Emotional metrics are calculated using advanced Natural Language Processing (NLP) techniques that analyze your conversation patterns with the chatbot. The system uses psycholinguistic markers (LIWC features) including first-person pronoun usage frequency, negative emotion word density, cognitive processing word frequency, disfluency markers (hesitation words like 'um', 'uh'), and repetition patterns. Additionally, transformer-based embeddings (Sentence-BERT/DistilBERT models finetuned on mental-health datasets) are used to capture semantic similarity to clinical symptom descriptions. Scores range from 0-50, where higher values indicate stronger presence of that emotional state.")}
                </p>
                
                <h5 className="mb-3 mt-4">{t("chart.evaluationProcess", "Evaluation Process")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("chart.emotionalEvaluationProcess", "The AI analyzes your conversation history in batches, looking for patterns, repeated mentions, and cumulative emotional indicators. Each metric is calculated independently: Stress levels are identified through mentions of stressors, physical symptoms, and tension indicators. Happiness is measured through positive emotions, satisfaction expressions, and joy indicators. Anxiety is detected through worry patterns, nervousness markers, restlessness indicators, and panic-related language. Overall mood is a composite measure that can be an average of the above metrics or an independent assessment of general emotional state.")}
                </p>
              </div>
            </div>
          </div>
        )}

        
        {metricsType === "emotional" && (
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">{t("chart.emotionalMetrics", "Emotional Metrics")} - {t("chart.definitions", "Definitions")}</h3>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-3">
                  <strong>{t("chart.stress", "Stress")}:</strong> {t("chart.stressDefinition", "A measure of psychological and physical tension (0-50). Higher scores indicate increased stress levels, which may affect your overall wellbeing.")}
                </li>
                <li className="mb-3">
                  <strong>{t("chart.happiness", "Happiness")}:</strong> {t("chart.happinessDefinition", "A measure of positive emotions, satisfaction, and joy (0-50). Higher scores reflect greater happiness and life satisfaction.")}
                </li>
                <li className="mb-3">
                  <strong>{t("chart.anxiety", "Anxiety")}:</strong> {t("chart.anxietyDefinition", "A measure of worry, nervousness, and unease (0-50). Higher scores indicate increased anxiety levels that may require attention.")}
                </li>
                <li className="mb-3">
                  <strong>{t("chart.overallMood", "Overall Mood")}:</strong> {t("chart.overallMoodDefinition", "A composite measure of your general emotional state (0-50). This reflects your overall psychological wellbeing at a given time.")}
                </li>
              </ul>
            </div>
          </div>
        )}

        
        {metricsType === "emotional" && (
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h3 className="h5 mb-0">ℹ️ {t("chart.emotionalMetricsDisclaimer", "AI-Estimated Metrics")}</h3>
            </div>
            <div className="card-body">
              <p className="mb-0" style={{ fontSize: "0.875rem" }}>
                {t("chart.emotionalMetricsDisclaimerText", "Emotional metrics (stress, anxiety, happiness) are AI-estimated using psycholinguistic markers (LIWC features: first-person usage, negative emotion words, cognitive processing words) and transformer embeddings (Sentence-BERT/DistilBERT finetuned on mental-health datasets), NOT clinically validated diagnostic tools.")}
              </p>
            </div>
          </div>
        )}

        
        {metricsType === "screening" && (
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="h5 mb-0">📊 {t("chart.howScreeningScored", "How Screening Metrics Are Scored & Evaluated")}</h3>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5 className="mb-3">{t("chart.screeningMethodology", "Scoring Methodology")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("chart.screeningScoringExplanation", "PHQ-9, GAD-7, and GHQ scores are AI-ESTIMATED PROXY INDICATORS calculated by analyzing conversation patterns and linguistic features. The AI identifies symptoms and behaviors that correspond to standardized questionnaire items. For PHQ-9, the system looks for indicators of interest loss, mood changes, sleep disturbances, energy levels, appetite changes, concentration issues, self-worth concerns, movement problems, and suicidal thoughts. For GAD-7, it identifies excessive worry, restlessness, fatigue, concentration problems, irritability, muscle tension, and sleep issues. For GHQ, it assesses psychological distress, social functioning, and physical symptoms. These scores predict likelihood based on conversation patterns but are NOT actual questionnaire responses.")}
                </p>
                
                <h5 className="mb-3 mt-4">{t("chart.importantNote", "Important Note")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("chart.screeningImportantNote", "These AI-estimated scores are screening tools that help identify potential concerns. They are based on natural language analysis of your conversations and should be interpreted with caution. For verified clinical results and formal diagnosis, you must complete the actual standardized PHQ-9, GAD-7, or GHQ questionnaires administered by healthcare professionals. These proxy scores are designed to raise awareness and encourage professional consultation when indicated.")}
                </p>
              </div>
            </div>
          </div>
        )}

        
        {metricsType === "screening" && (
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">{t("chart.screeningMetrics", "Screening Metrics")} - {t("chart.definitions", "Definitions")}</h3>
            </div>
            <div className="card-body">
              
              <div className="alert alert-warning mb-3" role="alert" style={{ fontSize: "0.875rem" }}>
                <strong>⚠️ {t("chart.proxyDisclaimer", "AI-Estimated Proxy Scores")}:</strong>{" "}
                {t("chart.proxyDisclaimerText", "PHQ-9, GAD-7, and GHQ scores shown here are AI-ESTIMATED PROXY INDICATORS based on conversation patterns, NOT actual questionnaire responses. For verified clinical results, users must complete the standardized questionnaires.")}
              </div>
              
              <ul className="list-unstyled">
                <li className="mb-3">
                  <strong>{t("chart.phq9", "PHQ-9")}:</strong> {t("chart.phq9Definition", "Patient Health Questionnaire-9 (0-27). A validated 9-item depression screening tool. Scores: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-19 (moderately severe), 20-27 (severe).")}
                  <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "0.7rem" }}>
                    {t("chart.aiEstimated", "AI-Estimated")}
                  </span>
                </li>
                <li className="mb-3">
                  <strong>{t("chart.gad7", "GAD-7")}:</strong> {t("chart.gad7Definition", "Generalized Anxiety Disorder-7 (0-21). A 7-item anxiety screening scale. Scores: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-21 (severe anxiety).")}
                  <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "0.7rem" }}>
                    {t("chart.aiEstimated", "AI-Estimated")}
                  </span>
                </li>
                <li>
                  <strong>{t("chart.ghq", "GHQ")}:</strong> {t("chart.ghqDefinition", "General Health Questionnaire (0-36). A comprehensive psychological distress screening tool measuring mental health status. Higher scores indicate greater psychological distress.")}
                  <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "0.7rem" }}>
                    {t("chart.aiEstimated", "AI-Estimated")}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        
        {metricsType === "dementia" && (
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="h5 mb-0">📊 {t("chart.howCognitiveScored", "How Cognitive Metrics Are Scored & Evaluated")}</h3>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5 className="mb-3">{t("chart.gameBasedScoring", "Game-Based Assessment Scoring")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("chart.cognitiveScoringExplanation", "Cognitive metrics are calculated from your performance in various cognitive games. Each game is designed to assess specific cognitive domains based on validated neuropsychological testing paradigms. Your raw scores from each game are normalized by difficulty level (easy, moderate, hard) to ensure fair comparison. The formula used is: Normalized Score = (Raw Score / Maximum Possible Score for Difficulty) × 100. This normalization accounts for different difficulty multipliers (easy: 1.0x, moderate: 1.5x, hard: 2.0x) and ensures that scores are comparable across games and difficulty levels.")}
                </p>
                
                <h5 className="mb-3 mt-4">{t("chart.domainMapping", "Game-to-Domain Mapping")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("chart.domainMappingExplanation", "Each game maps to specific cognitive domains with clinical justification: Digit Span and N-Back primarily test Memory (working memory capacity). Pattern Recall and Memory Match assess Memory and Attention. Reaction Time measures Attention and Processing Speed. Stroop Test evaluates Executive Function (cognitive flexibility and inhibition). Clock Drawing tests Executive Function, Orientation, and Visuospatial abilities. Text Recall (Dementia Checker) assesses Memory and Language. Each game contributes to domain scores with weighted importance based on which cognitive function it primarily tests.")}
                </p>
                
                <h5 className="mb-3 mt-4">{t("chart.weightedRiskCalculation", "Weighted Risk Score Calculation")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("chart.weightedRiskExplanation", "The final cognitive risk score uses a weighted domain model based on clinical research: Memory (35% weight) - main early dementia marker, Language (20%) - word-finding issues appear early, Attention (20%) - executive decline affects attention, Orientation (12.5%) - moderate impact, Executive Function (12.5%) - important but typically late-stage. The formula calculates: Weighted Risk Score = Σ(Domain Risk × Domain Weight), where Domain Risk = 1 - (Domain Score / 10). Higher domain scores (0-10 scale) indicate better cognitive function, resulting in lower risk scores (0-1 scale). Risk levels are determined as: High (≥70%), Moderate (40-69%), Low (<40%).")}
                </p>
              </div>
            </div>
          </div>
        )}

        
        {metricsType === "dementia" && (
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h3 className="h5 mb-0">🎮 {t("chart.whatEachGameTests", "What Each Game Tests")}</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🔢 {t("chart.digitSpanGame", "Digit Span")}</h6>
                  <p className="small mb-2">{t("chart.digitSpanGameDesc", "Tests working memory capacity by requiring you to remember and recall sequences of digits. Measures immediate memory span, which is a key indicator of cognitive health. Early Alzheimer's disease affects short-term recall, making this test sensitive to early cognitive decline.")}</p>
                  <span className="badge bg-info text-dark">{t("chart.primaryDomain", "Primary Domain")}: Memory (80%)</span>
                  <span className="badge bg-secondary ms-2">{t("chart.secondaryDomain", "Secondary")}: Attention (20%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🔄 {t("chart.nBackGame", "N-Back")}</h6>
                  <p className="small mb-2">{t("chart.nBackGameDesc", "Evaluates working memory and executive function by requiring you to identify items that appeared N steps back in a sequence. Tests your ability to maintain and update information in working memory, which is sensitive to Mild Cognitive Impairment (MCI) decline.")}</p>
                  <span className="badge bg-info text-dark">{t("chart.primaryDomain", "Primary Domain")}: Memory (60%)</span>
                  <span className="badge bg-secondary ms-2">{t("chart.secondaryDomain", "Secondary")}: Executive (40%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🔁 {t("chart.patternRecallGame", "Pattern Recall")}</h6>
                  <p className="small mb-2">{t("chart.patternRecallGameDesc", "Tests visual memory and sequential processing by requiring you to remember and reproduce visual patterns. Evaluates memory encoding and retrieval deficits, which are critical cognitive functions that decline in early-stage dementia.")}</p>
                  <span className="badge bg-info text-dark">{t("chart.primaryDomain", "Primary Domain")}: Memory (70%)</span>
                  <span className="badge bg-secondary ms-2">{t("chart.secondaryDomain", "Secondary")}: Attention (30%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🧩 {t("chart.memoryMatchGame", "Memory Match")}</h6>
                  <p className="small mb-2">{t("chart.memoryMatchGameDesc", "Assesses associative memory by requiring you to match pairs of cards by remembering their positions. Tests hippocampal-dependent memory systems, which are strongly affected in early Alzheimer's disease. Identifies visual memory deficits and spatial processing issues.")}</p>
                  <span className="badge bg-info text-dark">{t("chart.primaryDomain", "Primary Domain")}: Memory (75%)</span>
                  <span className="badge bg-secondary ms-2">{t("chart.secondaryDomain", "Secondary")}: Executive (25%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">⚡ {t("chart.reactionTimeGame", "Reaction Time")}</h6>
                  <p className="small mb-2">{t("chart.reactionTimeGameDesc", "Measures processing speed and attention by requiring quick responses to visual stimuli. Detects slowed cognitive processing, which is an early indicator of cognitive decline. Tracks average reaction time, variability, and slowest 10% responses.")}</p>
                  <span className="badge bg-info text-dark">{t("chart.primaryDomain", "Primary Domain")}: Attention (70%)</span>
                  <span className="badge bg-secondary ms-2">{t("chart.secondaryDomain", "Secondary")}: Executive (30%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🎨 {t("chart.colorSequenceGame", "Color Sequence")}</h6>
                  <p className="small mb-2">{t("chart.colorSequenceGameDesc", "Tests sequential memory by requiring you to remember and repeat color sequences in order. Evaluates working memory and executive function components that are affected in early dementia. Measures ability to maintain sequences in memory.")}</p>
                  <span className="badge bg-info text-dark">{t("chart.primaryDomain", "Primary Domain")}: Memory (60%)</span>
                  <span className="badge bg-secondary ms-2">{t("chart.secondaryDomain", "Secondary")}: Executive (40%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🎯 {t("chart.stroopTestGame", "Stroop Test")}</h6>
                  <p className="small mb-2">{t("chart.stroopTestGameDesc", "Assesses cognitive flexibility and inhibition by requiring you to identify color names while ignoring conflicting text colors. Measures executive function and cognitive control, which are impaired in dementia patients. Tests ability to inhibit automatic responses.")}</p>
                  <span className="badge bg-info text-dark">{t("chart.primaryDomain", "Primary Domain")}: Executive (80%)</span>
                  <span className="badge bg-secondary ms-2">{t("chart.secondaryDomain", "Secondary")}: Attention (20%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🕐 {t("chart.clockDrawingGame", "Clock Drawing")}</h6>
                  <p className="small mb-2">{t("chart.clockDrawingGameDesc", "A widely used screening tool for dementia that assesses multiple cognitive domains including visuospatial skills, executive function, attention, and semantic memory. This is a clinically validated test (CDT) used in MMSE, MoCA, and other assessments. Impairments in clock drawing are strong indicators of cognitive decline.")}</p>
                  <span className="badge bg-info text-dark">{t("chart.primaryDomain", "Primary Domain")}: Executive (50%)</span>
                  <span className="badge bg-secondary ms-2">{t("chart.secondaryDomain", "Secondary")}: Orientation (30%) + Memory (20%)</span>
                </div>
                

              </div>
            </div>
          </div>
        )}

        
        {metricsType === "dementia" && (
          <div className="card mb-4 fade-slide">
            <div className="card-header">
              <h3 className="h5 mb-0">{t("chart.dementiaMetrics", "Cognitive Metrics")} - {t("chart.definitions", "Definitions")}</h3>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-3">
                  <strong>📊 {t("chart.reactionTime", "Reaction Time")}:</strong> {t("chart.reactionTimeDefinition", "Measures processing speed and attention. Average reaction time, variability, and slowest 10% are key indicators. Lower times indicate better cognitive function.")}
                </li>
                <li className="mb-3">
                  <strong>🧭 {t("chart.accuracy", "Accuracy")}:</strong> {t("chart.accuracyDefinition", "Overall cognitive efficiency measured as percentage correct. Tracks error types and accuracy under time pressure. Higher accuracy indicates better cognitive function.")}
                </li>
                <li className="mb-3">
                  <strong>🔄 {t("chart.workingMemorySpan", "Working Memory Span")}:</strong> {t("chart.workingMemoryDefinition", "Short-term memory capacity. Measures maximum sequence remembered, forwards vs backwards span, and intrusion errors. Higher span indicates better working memory.")}
                </li>
                <li className="mb-3">
                  <strong>🧩 {t("chart.executiveFunction", "Executive Function")}:</strong> {t("chart.executiveFunctionDefinition", "Decision-making, planning, and inhibition abilities. Tracks task-switching speed, rule violations, and perseveration. Lower times and fewer violations indicate better executive function.")}
                </li>
                <li className="mb-3">
                  <strong>🧭 {t("chart.visuospatialAccuracy", "Visuospatial Ability")}:</strong> {t("chart.visuospatialDefinition", "Spatial reasoning and visual processing. Measures accuracy in reconstructing shapes, navigation errors, and puzzle completion time. Higher accuracy indicates better visuospatial function.")}
                </li>
                <li className="mb-3">
                  <strong>🧠 {t("chart.attentionConsistency", "Attention & Focus")}:</strong> {t("chart.attentionDefinition", "Sustained attention and focus. Tracks time on task, distractor click rate, missed stimuli, and consistency score. Higher consistency indicates better attention.")}
                </li>
                <li className="mb-3">
                  <strong>🛎️ {t("chart.processingSpeed", "Processing Speed")}:</strong> {t("chart.processingSpeedDefinition", "Speed of cognitive processing. Measures average game completion time, fastest and slowest game times, and speed consistency. Lower times indicate faster processing.")}
                </li>
                <li className="mb-3">
                  <strong>🔁 {t("chart.learningCurve", "Learning Curve")}:</strong> {t("chart.learningCurveDefinition", "Ability to learn and improve over time. Measures improvement from first to last trial, forgetting curve, and retention rate. Positive improvement indicates better learning ability.")}
                </li>
                <li className="mb-3">
                  <strong>📉 {t("chart.errorRate", "Error Analytics")}:</strong> {t("chart.errorAnalyticsDefinition", "Error patterns and types. Tracks total errors, repeated error rate (perseveration), and error classification. Lower error rates indicate better cognitive function.")}
                </li>
                <li>
                  <strong>{t("chart.cognitiveRisk", "Cognitive Impairment Risk")} (%):</strong> {t("chart.dementiaRiskDefinition", "A percentage score (0-100%) indicating the risk level for cognitive impairment. Based on comprehensive game-based cognitive metrics with weighted domain scoring (Memory 35%, Language 20%, Attention 20%, Orientation 12.5%, Executive 12.5%). Lower scores indicate better cognitive function.")}
                </li>
              </ul>
              
              
              <div className="mt-3 p-3 bg-light rounded" style={{ fontSize: "0.875rem" }}>
                <strong>📊 {t("chart.domainWeights", "Domain Weights")}:</strong>
                <ul className="mb-0 mt-2" style={{ paddingLeft: "1.5rem" }}>
                  <li><strong>Memory (35%):</strong> {t("chart.memoryWeightReason", "Main early dementia marker - hippocampal-dependent")}</li>
                  <li><strong>Language (20%):</strong> {t("chart.languageWeightReason", "Word-finding issues appear early in Alzheimer's")}</li>
                  <li><strong>Attention (20%):</strong> {t("chart.attentionWeightReason", "Executive decline affects attention networks")}</li>
                  <li><strong>Orientation (12.5%):</strong> {t("chart.orientationWeightReason", "Moderate impact, more affected in later stages")}</li>
                  <li><strong>Executive (12.5%):</strong> {t("chart.executiveWeightReason", "Important but typically late-stage marker")}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        
        <div className="card mb-4 fade-slide">
          <div className="card-header d-flex align-items-center gap-3">
            <div className="fs-1">💡</div>
            <div>
              <h3 className="h5 mb-1">{t("chart.usage", "How to Use")}</h3>
              <p className="text-muted mb-0 small">
                {t("chart.usageSubtitle", "Get the most out of your metrics dashboard")}
              </p>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', minWidth: '32px'}}>1</div>
                  <div>
                    <strong>{t("chart.step1Title", "Select Chart Type")}</strong>
                    <p className="text-muted mb-0 small">{t("chart.step1Desc", "Choose between Bar Chart (for individual data points) or Line Chart (for trend visualization) using the first dropdown menu.")}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', minWidth: '32px'}}>2</div>
                  <div>
                    <strong>{t("chart.step2Title", "Choose Metric Category")}</strong>
                    <p className="text-muted mb-0 small">{t("chart.step2Desc", "Select from Emotional Metrics, Screening Metrics, or Cognitive Impairment using the second dropdown to view different assessment types.")}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', minWidth: '32px'}}>3</div>
                  <div>
                    <strong>{t("chart.step3Title", "Refresh Data")}</strong>
                    <p className="text-muted mb-0 small">{t("chart.step3Desc", "Click the 'Refresh' button to update the chart with your latest assessment data and ensure you're viewing the most current information.")}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', minWidth: '32px'}}>4</div>
                  <div>
                    <strong>{t("chart.step4Title", "Interpret Results")}</strong>
                    <p className="text-muted mb-0 small">{t("chart.step4Desc", "Review the definitions below to understand what each metric means. Lower scores in screening tools and higher scores in emotional metrics generally indicate better wellbeing.")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="alert alert-info mt-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span>💡</span>
                <strong>{t("chart.tipsTitle", "Pro Tips")}</strong>
              </div>
              <ul className="mb-0">
                <li>{t("chart.tip1", "Bar charts are best for comparing individual assessment results")}</li>
                <li>{t("chart.tip2", "Line charts help identify trends and patterns over time")}</li>
                <li>{t("chart.tip3", "Regular monitoring (every 3-6 months) provides the most valuable insights")}</li>
                <li>{t("chart.tip4", "Share your charts with healthcare professionals for better consultation")}</li>
              </ul>
            </div>
          </div>
        </div>

        
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="h5 mb-0">{t("chart.benefits", "Benefits")}</h3>
          </div>
          <div className="card-body">
            <ul className="list-unstyled mb-0">
              <li className="mb-2">✓ {t("chart.benefit1", "Monitor emotional wellbeing trends over time.")}</li>
              <li className="mb-2">✓ {t("chart.benefit2", "Track standardized screening scores (PHQ-9, GAD-7, GHQ) for mental health assessment.")}</li>
              <li className="mb-2">✓ {t("chart.benefit3", "Visualize cognitive impairment risk patterns and changes.")}</li>
              <li className="mb-2">✓ {t("chart.benefit4", "Identify patterns and make data-driven decisions for better wellbeing.")}</li>
              <li className="mb-2">✓ {t("chart.benefit5", "Share progress with healthcare professionals using visual data.")}</li>
            </ul>
          </div>
        </div>

        
        <div className="card mb-4 border-warning">
          <div className="card-header bg-warning text-dark">
            <h3 className="h5 mb-0">{t("chart.importantNotes", "Important Notes")}</h3>
          </div>
          <div className="card-body">
            <ul className="list-unstyled mb-0">
              <li className="mb-2">⚠️ {t("chart.note1", "These metrics are screening tools, not diagnostic tools. Always consult healthcare professionals for medical advice.")}</li>
              <li className="mb-2">⚠️ {t("chart.note2", "Scores should be interpreted in context with professional guidance.")}</li>
              <li className="mb-2">⚠️ {t("chart.note3", "Regular monitoring (every 3-6 months) helps track changes and patterns.")}</li>
              <li className="mb-2">⚠️ {t("chart.note4", "High risk scores should prompt consultation with qualified healthcare professionals.")}</li>
            </ul>
          </div>
        </div>
        </div>
      </div>
    </div>
  );

}
