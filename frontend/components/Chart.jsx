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
  Legend,//
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

export default function Chart({ metricsRecords = [], metricsType = "emotional" }) {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState("bar");

  // ✅ Define metrics
  const emotionalMetrics = [
    { key: "stress_level", label: t("chart.stress", "Stress"), color: "255,99,132" },
    { key: "happiness_level", label: t("chart.happiness", "Happiness"), color: "75,192,192" },
    { key: "anxiety_level", label: t("chart.anxiety", "Anxiety"), color: "255,206,86" },
    { key: "overall_mood_level", label: t("chart.overallMood", "Overall Mood"), color: "54,162,235" },
  ];

  const screeningMetrics = [
    { key: "phq9_score", label: t("chart.phq9", "PHQ-9"), color: "255,99,132" },
    { key: "gad7_score", label: t("chart.gad7", "GAD-7"), color: "54,162,235" },
    { key: "ghq_score", label: t("chart.ghq", "GHQ"), color: "255,206,86" },
  ];

  const chartLabels = useMemo(() => {
    return metricsRecords.map(record => {
      const date = new Date(record.createdAt);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    });
  }, [metricsRecords]);

  const selectedMetrics = metricsType === "emotional" ? emotionalMetrics : screeningMetrics;

  const data = useMemo(() => {
    const datasets = selectedMetrics.map(m => {
      const values = metricsRecords.map(record => {
        const source = metricsType === "emotional" ? record.metrics : record.screening;
        return source?.[m.key] ?? 0;
      });

      return {
        label: m.label,
        data: values,
        borderColor: `rgba(${m.color},1)`,
        backgroundColor: `rgba(${m.color},0.5)`,
        fill: chartType === "line",
        tension: 0.3,
      };
    });

    return { labels: chartLabels, datasets };
  }, [metricsRecords, chartLabels, chartType, metricsType]);

  const allValues = data.datasets.flatMap(ds => ds.data);
  const maxY = allValues.length ? Math.max(...allValues, 10) : 10;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `${t("chart.title", "User Metrics")} (${metricsType === "emotional"
          ? t("chart.emotionalMetrics", "Emotional Metrics")
          : t("chart.screeningMetrics", "Screening Metrics")
        })`,
      },
    },
    scales: {
      x: {
        title: { display: true, text: t("chart.time", "Date & Time") },
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxY,
        title: { display: true, text: t("chart.value", "Value") },
      },
    },
  };

  if (!data.datasets.some(ds => ds.data.some(v => v > 0))) {
    return <p className="chart-message chart-no-data">📉 {t("chart.noData", "No metrics available yet.")}</p>;
  }

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <select value={chartType} onChange={e => setChartType(e.target.value)} className="chart-select">
          <option value="bar">{t("chart.barChart", "Bar Chart")}</option>
          <option value="line">{t("chart.lineChart", "Line Chart")}</option>
        </select>

        <select value={metricsType} onChange={e => setMetricsType(e.target.value)} className="chart-select">
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
