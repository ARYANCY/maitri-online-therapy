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

export default function Chart({ chartData: propsData = null, chartLabels: propsLabels = [] }) {
  const [chartType, setChartType] = useState("bar");
  const [metricsType, setMetricsType] = useState("emotional");
  const [data, setData] = useState({ datasets: [], labels: [] });

  // Prepare chart data whenever props or type change
  useEffect(() => {
    if (!propsData || !propsLabels.length) {
      setData({ datasets: [], labels: [] });
      return;
    }

    let datasets = [];

    if (metricsType === "emotional") {
      datasets = [
        { label: "Stress", data: propsData.stress_level || [], borderColor: "rgba(255,99,132,1)", backgroundColor: "rgba(255,99,132,0.6)" },
        { label: "Happiness", data: propsData.happiness_level || [], borderColor: "rgba(75,192,192,1)", backgroundColor: "rgba(75,192,192,0.6)" },
        { label: "Anxiety", data: propsData.anxiety_level || [], borderColor: "rgba(255,206,86,1)", backgroundColor: "rgba(255,206,86,0.6)" },
        { label: "Overall Mood", data: propsData.overall_mood_level || [], borderColor: "rgba(54,162,235,1)", backgroundColor: "rgba(54,162,235,0.6)" },
      ];
    } else {
      datasets = [
        { label: "PHQ-9", data: propsData.phq9_score || [], borderColor: "rgba(255,99,132,1)", backgroundColor: "rgba(255,99,132,0.6)" },
        { label: "GAD-7", data: propsData.gad7_score || [], borderColor: "rgba(54,162,235,1)", backgroundColor: "rgba(54,162,235,0.6)" },
        { label: "GHQ", data: propsData.ghq_score || [], borderColor: "rgba(255,206,86,1)", backgroundColor: "rgba(255,206,86,0.6)" },
      ];
    }

    // Filter out empty datasets
    datasets = datasets.filter(ds => ds.data && ds.data.length > 0);

    const preparedDatasets = datasets.map(ds => ({ ...ds, fill: chartType === "line", spanGaps: true }));

    setData({ labels: propsLabels, datasets: preparedDatasets });
  }, [propsData, propsLabels, chartType, metricsType]);

  // Handle empty state
  if (!propsData || propsLabels.length === 0 || data.datasets.length === 0) {
    return <p className="chart-message chart-no-data">📉 No metrics available yet.</p>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `User Metrics Chart (${metricsType})` },
    },
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 } },
      y: { beginAtZero: true, max: metricsType === "emotional" ? 50 : 36 },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-controls">
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
        {chartType === "bar" ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
      </div>
    </div>
  );
}
