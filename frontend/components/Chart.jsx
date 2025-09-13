import React, { useEffect, useState } from "react";
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

export default function Chart({ chartData }) {
  const [chartType, setChartType] = useState("bar");
  const [metricsType, setMetricsType] = useState("emotional"); // emotional or screening
  const [mode, setMode] = useState("entries"); // entries or daily
  const [preparedData, setPreparedData] = useState({ labels: [], datasets: [] });

  // Prepare datasets for ChartJS
  useEffect(() => {
    if (!chartData) return;

    const { chartLabels, chartData: data } = chartData;

    let datasets = [];
    if (metricsType === "emotional") {
      datasets = [
        { label: "Stress", data: data.stress_level, borderColor: "#FF6384", backgroundColor: "rgba(255,99,132,0.6)" },
        { label: "Happiness", data: data.happiness_level, borderColor: "#4BC0C0", backgroundColor: "rgba(75,192,192,0.6)" },
        { label: "Anxiety", data: data.anxiety_level, borderColor: "#FFCE56", backgroundColor: "rgba(255,206,86,0.6)" },
        { label: "Overall Mood", data: data.overall_mood_level, borderColor: "#36A2EB", backgroundColor: "rgba(54,162,235,0.6)" },
      ];
    } else {
      // Screening metrics
      datasets = [
        { label: "PHQ-9", data: data.phq9_score, borderColor: "#FF6384", backgroundColor: "rgba(255,99,132,0.6)" },
        { label: "GAD-7", data: data.gad7_score, borderColor: "#36A2EB", backgroundColor: "rgba(54,162,235,0.6)" },
        { label: "GHQ", data: data.ghq_score, borderColor: "#FFCE56", backgroundColor: "rgba(255,206,86,0.6)" },
      ];
    }

    // Set fill for line chart
    const updatedDatasets = datasets.map(ds => ({
      ...ds,
      fill: chartType === "line",
      spanGaps: true,
    }));

    setPreparedData({
      labels: chartLabels,
      datasets: updatedDatasets,
    });

    // Save preferences to localStorage
    localStorage.setItem("chartType", chartType);
    localStorage.setItem("chartMetricsType", metricsType);
    localStorage.setItem("chartMode", mode);
  }, [chartData, chartType, metricsType, mode]);

  if (!chartData || !chartData.chartLabels || chartData.chartLabels.length === 0) {
    return <p className="chart-message chart-no-data">📉 No metrics yet</p>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `User Metrics Chart (${mode} - ${metricsType})` },
    },
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 } },
      y: { beginAtZero: true, max: metricsType === "emotional" ? 50 : 36 },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="chart-select">
          <option value="entries">Latest Entries</option>
          <option value="daily">Daily Averages</option>
        </select>

        <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="chart-select">
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>

        <select value={metricsType} onChange={(e) => setMetricsType(e.target.value)} className="chart-select">
          <option value="emotional">Emotional Metrics</option>
          <option value="screening">Screening Metrics</option>
        </select>
      </div>

      <div className="chart-wrapper" style={{ height: "400px" }}>
        {chartType === "bar" ? <Bar data={preparedData} options={options} /> : <Line data={preparedData} options={options} />}
      </div>
    </div>
  );
}
