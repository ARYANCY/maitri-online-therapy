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

export default function Chart({ chartData = null, chartLabels = [] }) {
  const [chartType, setChartType] = useState("bar");
  const [metricsType, setMetricsType] = useState("emotional");

  // Memoized chart datasets
  const data = useMemo(() => {
    if (!chartData || !chartLabels.length) return { datasets: [], labels: [] };

    let datasets = [];

    if (metricsType === "emotional") {
      datasets = [
        { label: "Stress", data: chartData.stress_level || [], color: "255,99,132" },
        { label: "Happiness", data: chartData.happiness_level || [], color: "75,192,192" },
        { label: "Anxiety", data: chartData.anxiety_level || [], color: "255,206,86" },
        { label: "Overall Mood", data: chartData.overall_mood_level || [], color: "54,162,235" },
      ];
    } else {
      datasets = [
        { label: "PHQ-9", data: chartData.phq9_score || [], color: "255,99,132" },
        { label: "GAD-7", data: chartData.gad7_score || [], color: "54,162,235" },
        { label: "GHQ", data: chartData.ghq_score || [], color: "255,206,86" },
      ];
    }

    datasets = datasets.filter(ds => ds.data.length > 0)
      .map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: `rgba(${ds.color},1)`,
        backgroundColor: `rgba(${ds.color},0.6)`,
        fill: chartType === "line",
        spanGaps: true,
      }));

    return { labels: chartLabels, datasets };
  }, [chartData, chartLabels, chartType, metricsType]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `User Metrics (${metricsType})` },
    },
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 } },
      y: { beginAtZero: true, suggestedMax: Math.max(...data.datasets.flatMap(ds => ds.data), 10) },
    },
  };

  if (!data.datasets.length) return <p className="chart-message chart-no-data">📉 No metrics available yet.</p>;

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <select
          value={chartType}
          onChange={e => setChartType(e.target.value)}
          className="chart-select"
          disabled={!data.datasets.length}
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>
        <select
          value={metricsType}
          onChange={e => setMetricsType(e.target.value)}
          className="chart-select"
          disabled={!data.datasets.length}
        >
          <option value="emotional">Emotional Metrics</option>
          <option value="screening">Screening Metrics</option>
        </select>
      </div>

      <div className="chart-wrapper" style={{ height: "400px" }}>
        {chartType === "bar" ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
      </div>
    </div>
  );
}
