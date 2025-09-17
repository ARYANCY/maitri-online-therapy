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
  Legend
);

export default function Chart({ chartData = {}, chartLabels = [] }) {
  const { t } = useTranslation();

  const [chartType, setChartType] = useState("bar");
  const [metricsType, setMetricsType] = useState("emotional");

  const EMOTIONAL_KEYS = [
    "stress_level", "happiness_level", "anxiety_level", "focus_level",
    "energy_level", "confidence_level", "motivation_level", "calmness_level",
    "sadness_level", "loneliness_level", "gratitude_level", "overall_mood_level"
  ];

  const SCREENING_KEYS = ["phq9_score", "gad7_score", "ghq_score"];

  const COLORS = [
    "255,99,132", "75,192,192", "255,206,86", "54,162,235",
    "153,102,255", "255,159,64", "199,199,199", "83,102,255",
    "255,102,178", "102,255,178", "255,153,51", "51,204,204"
  ];

  const data = useMemo(() => {
    if (!chartLabels.length && Object.keys(chartData).length === 0) return { datasets: [], labels: [] };

    let keys = metricsType === "emotional" ? EMOTIONAL_KEYS : SCREENING_KEYS;

    const datasets = keys.map((key, index) => {
      if (!(key in chartData)) return null;

      let metricData = chartData[key];

      // HYBRID: wrap single number into array if needed
      if (!Array.isArray(metricData)) metricData = [metricData];

      if (!metricData.length) return null;

      return {
        label: t(`chart.${key}`, key.replace("_", " ").toUpperCase()),
        data: metricData,
        borderColor: `rgba(${COLORS[index % COLORS.length]},1)`,
        backgroundColor: `rgba(${COLORS[index % COLORS.length]},0.6)`,
        fill: chartType === "line",
        spanGaps: true,
      };
    }).filter(Boolean);

    // fallback for labels if empty and metricData exists
    const labels = chartLabels.length
      ? chartLabels
      : (datasets[0]?.data.map((_, i) => `Point ${i + 1}`) || []);

    return { labels, datasets };
  }, [chartData, chartLabels, chartType, metricsType, t]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: t("chart.title", "User Metrics") + ` (${metricsType})`,
      },
    },
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 } },
      y: { beginAtZero: true, suggestedMax: Math.max(...data.datasets.flatMap(ds => ds.data), 10) },
    },
  }), [data, metricsType, t]);

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
