import React, { useState, useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import "../css/Chart.css";
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

  const normalizeArray = (arr, length) => {
    if (!arr) return Array(length).fill(0);
    if (!Array.isArray(arr)) arr = [arr];
    return Array.from({ length }, (_, i) => (arr[i] != null ? arr[i] : 0));
  };

  const data = useMemo(() => {
    if (!chartLabels.length) return { labels: [], datasets: [] };

    const len = chartLabels.length;
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
      // Convert dementia risk scores to percentages (0-1 to 0-100)
      const dementiaData = normalizeArray(chartData.dementia_risk_score, len).map(score => {
        // If score is between 0-1, convert to percentage; if already 0-100, use as is
        return score <= 1 ? Math.round(score * 100) : Math.round(score);
      });
      datasets = [
        { label: t("chart.dementiaRisk", "Dementia Risk") + " (%)", data: dementiaData, color: "153,102,255" },
      ];
    }

    return {
      labels: chartLabels,
      datasets: datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: `rgba(${ds.color},1)`,
        backgroundColor: `rgba(${ds.color},0.6)`,
        fill: chartType === "line",
        spanGaps: true,
      })),
    };
  }, [chartData, chartLabels, metricsType, chartType, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `${t("chart.title", "User Metrics")} (${metricsType === "emotional" ? t("chart.emotionalMetrics", "Emotional Metrics") : metricsType === "screening" ? t("chart.screeningMetrics", "Screening Metrics") : t("chart.dementiaMetrics", "Dementia Progress")})`,
      },
    },
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 } },
      y: {
        beginAtZero: true,
        suggestedMax: metricsType === "dementia" 
          ? 100 // Dementia risk scores are typically 0-100%
          : Math.max(...data.datasets.flatMap(ds => ds.data), 10),
        ticks: metricsType === "dementia" 
          ? {
              callback: function(value) {
                return value + '%';
              }
            }
          : {},
      },
    },
  };

  if (!data.datasets.length) {
    return (
      <p className="chart-message chart-no-data">
        📉 {t("chart.noData", "No metrics available yet.")}
      </p>
    );
  }

  return (
    <div className="chart-card">

      <div className="chart-controls">
        <select
          value={chartType}
          onChange={e => setChartType(e.target.value)}
          className="chart-select"
        >
          <option value="bar">{t("chart.barChart", "Bar Chart")}</option>
          <option value="line">{t("chart.lineChart", "Line Chart")}</option>
        </select>

        <select
          value={metricsType}
          onChange={e => setMetricsType(e.target.value)}
          className="chart-select"
        >
          <option value="emotional">{t("chart.emotionalMetrics", "Emotional Metrics")}</option>
          <option value="screening">{t("chart.screeningMetrics", "Screening Metrics")}</option>
          <option value="dementia">{t("chart.dementiaMetrics", "Dementia Progress")}</option>
        </select>

        {onRefresh && (
          <button className="button" onClick={onRefresh}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-arrow-repeat"
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
            {t("chart.refresh", "Refresh")}
          </button>
        )}
      </div>

      <div className="chart-wrapper" style={{ height: "550px" }}>
        {chartType === "bar" ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
      </div>

      {/* ----------------------------- */}
      {/* EXTRA INFO SECTIONS */}
      {/* ----------------------------- */}
      <div className="chart-info-section">
        <div className="section fade-slide">
          <h2>{t("chart.infoTitle", "Metrics Overview")}</h2>
          <p>
            {t(
              "chart.infoDescription",
              "This chart visualizes your selected metrics over time. You can toggle between emotional or screening metrics and choose your preferred chart type."
            )}
          </p>
        </div>

        <div className="section fade-slide">
          <h3>{t("chart.benefits", "Benefits")}</h3>
          <ul>
            <li>{t("chart.benefit1", "Monitor emotional wellbeing trends.")}</li>
            <li>{t("chart.benefit2", "Track screening scores for mental health.")}</li>
            <li>{t("chart.benefit3", "Visualize progress and patterns easily.")}</li>
          </ul>
        </div>

        <div className="section fade-slide">
          <h3>{t("chart.usage", "How to Use")}</h3>
          <p>
            {t(
              "chart.usageDescription",
              "Switch between chart types and metrics using the controls above. Refresh the data to get the latest results."
            )}
          </p>
        </div>

        <div className="section fade-slide">
          <h3>{t("chart.languageNote", "Language Support")}</h3>
          <p>
            {t(
              "chart.languageDescription",
              "All chart labels and descriptions automatically adapt to your selected language for a consistent user experience."
            )}
          </p>
        </div>

        <div className="section fade-slide">
          <h3>{t("chart.insight", "Insight")}</h3>
          <p>
            {t(
              "chart.insightDescription",
              "Analyzing these metrics can help identify patterns, manage stress, and make data-driven decisions for better wellbeing."
            )}
          </p>
        </div>
      </div>
    </div>
  );

}
