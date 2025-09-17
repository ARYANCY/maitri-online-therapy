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

export default function Chart({ chartData = null, chartLabels = [] }) {
  const { t } = useTranslation();

  const [chartType, setChartType] = useState("bar");
  const [metricsType, setMetricsType] = useState("emotional");

  // Convert any number to array
  const toArray = (val) => (Array.isArray(val) ? val : val != null ? [val] : []);

  // Memoized chart datasets
  const data = useMemo(() => {
    if (!chartData || !chartLabels.length) return { datasets: [], labels: [] };

    let datasets = [];

    if (metricsType === "emotional") {
      datasets = [
        { label: t("chart.stress", "Stress"), data: toArray(chartData.stress_level), color: "255,99,132" },
        { label: t("chart.happiness", "Happiness"), data: toArray(chartData.happiness_level), color: "75,192,192" },
        { label: t("chart.anxiety", "Anxiety"), data: toArray(chartData.anxiety_level), color: "255,206,86" },
        { label: t("chart.overallMood", "Overall Mood"), data: toArray(chartData.overall_mood_level), color: "54,162,235" },
      ];
    } else {
      datasets = [
        { label: t("chart.phq9", "PHQ-9"), data: toArray(chartData.phq9_score), color: "255,99,132" },
        { label: t("chart.gad7", "GAD-7"), data: toArray(chartData.gad7_score), color: "54,162,235" },
        { label: t("chart.ghq", "GHQ"), data: toArray(chartData.ghq_score), color: "255,206,86" },
      ];
    }

    datasets = datasets
      .filter(ds => ds.data.length > 0)
      .map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: `rgba(${ds.color},1)`,
        backgroundColor: `rgba(${ds.color},0.6)`,
        fill: chartType === "line",
        spanGaps: true,
      }));

    return { labels: chartLabels, datasets };
  }, [chartData, chartLabels, chartType, metricsType, t]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: t("chart.title", "User Metrics") + ` (${metricsType})` },
    },
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 } },
      y: { beginAtZero: true, suggestedMax: Math.max(...data.datasets.flatMap(ds => ds.data), 10) },
    },
  };

  if (!data.datasets.length)
    return <p className="chart-message chart-no-data">📉 {t("chart.noData", "No metrics available yet.")}</p>;

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <select
          value={chartType}
          onChange={e => setChartType(e.target.value)}
          className="chart-select"
          disabled={!data.datasets.length}
        >
          <option value="bar">{t("chart.barChart", "Bar Chart")}</option>
          <option value="line">{t("chart.lineChart", "Line Chart")}</option>
        </select>
        <select
          value={metricsType}
          onChange={e => setMetricsType(e.target.value)}
          className="chart-select"
          disabled={!data.datasets.length}
        >
          <option value="emotional">{t("chart.emotionalMetrics", "Emotional Metrics")}</option>
          <option value="screening">{t("chart.screeningMetrics", "Screening Metrics")}</option>
        </select>
      </div>

      <div className="chart-wrapper" style={{ height: "400px" }}>
        {chartType === "bar" ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
      </div>
    </div>
  );
}
