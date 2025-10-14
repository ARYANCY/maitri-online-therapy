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
    } else {
      datasets = [
        { label: t("chart.phq9", "PHQ-9"), data: normalizeArray(chartData.phq9_score, len), color: "255,99,132" },
        { label: t("chart.gad7", "GAD-7"), data: normalizeArray(chartData.gad7_score, len), color: "54,162,235" },
        { label: t("chart.ghq", "GHQ"), data: normalizeArray(chartData.ghq_score, len), color: "255,206,86" },
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
        text: `${t("chart.title", "User Metrics")} (${t(
          metricsType === "emotional"
            ? "chart.emotionalMetrics"
            : "chart.screeningMetrics",
          metricsType
        )})`,
      },
    },
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 } },
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...data.datasets.flatMap(ds => ds.data), 10),
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
        </select>

        {onRefresh && (
          <button className="button" onClick={onRefresh}>

            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-repeat"
                viewBox="0 0 16 16"
              >
                <path
                  d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
                ></path>
                <path
                  fill-rule="evenodd"
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
    </div>
  );
}
