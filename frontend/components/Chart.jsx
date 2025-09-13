import React, { useEffect, useState } from "react";
import API from "../utils/axiosClient";
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

export default function Chart() {
  const [chartData, setChartData] = useState(null);
  const [chartLabels, setChartLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("bar");
  const [mode, setMode] = useState("entries");
  const [metricsType, setMetricsType] = useState("emotional");

  // Save chart state to localStorage
  const saveToCache = (labels, data, mode, type, mType) => {
    localStorage.setItem("chartLabels", JSON.stringify(labels));
    localStorage.setItem("chartData", JSON.stringify(data));
    localStorage.setItem("chartMode", mode);
    localStorage.setItem("chartType", type);
    localStorage.setItem("chartMetricsType", mType);
  };

  // Fetch chart data from backend
  const fetchChartData = async () => {
    try {
      const res = await API.get(`/api/dashboard?type=${mode}`);
      if (res.data) {
        const labels = res.data.chartLabels || [];
        const data = res.data.chartData || {};

        if (data.screening) {
          data.screening.phq9_score = data.screening.phq9_score || [];
          data.screening.gad7_score = data.screening.gad7_score || [];
          data.screening.ghq_score = data.screening.ghq_score || [];
        }

        setChartLabels(labels);
        setChartData(data);
        saveToCache(labels, data, mode, chartType, metricsType);
      }
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load cached data on first render
  useEffect(() => {
    const savedData = localStorage.getItem("chartData");
    const savedLabels = localStorage.getItem("chartLabels");
    const savedMode = localStorage.getItem("chartMode");
    const savedType = localStorage.getItem("chartType");
    const savedMetricsType = localStorage.getItem("chartMetricsType");

    if (savedData && savedLabels) {
      setChartData(JSON.parse(savedData));
      setChartLabels(JSON.parse(savedLabels));
    } else {
      fetchChartData();
    }

    if (savedMode) setMode(savedMode);
    if (savedType) setChartType(savedType);
    if (savedMetricsType) setMetricsType(savedMetricsType);
  }, []);

  // Optional: periodic fetch (once every minute) to keep data fresh
  useEffect(() => {
    const interval = setInterval(fetchChartData, 60000); // 60s
    return () => clearInterval(interval);
  }, [mode]);

  // Update chart after new chat message
  const updateChartAfterChat = (newMetrics) => {
    if (!newMetrics) return;

    setChartData((prevData) => {
      const updatedData = {
        ...prevData,
        stress_level: [...(prevData?.stress_level || []), newMetrics.stress || 0],
        happiness_level: [...(prevData?.happiness_level || []), newMetrics.happiness || 0],
        anxiety_level: [...(prevData?.anxiety_level || []), newMetrics.anxiety || 0],
        overall_mood_level: [...(prevData?.overall_mood_level || []), newMetrics.mood || 0],
        screening: {
          phq9_score: [...(prevData?.screening?.phq9_score || []), newMetrics.phq9 || 0],
          gad7_score: [...(prevData?.screening?.gad7_score || []), newMetrics.gad7 || 0],
          ghq_score: [...(prevData?.screening?.ghq_score || []), newMetrics.ghq || 0],
        },
      };

      setChartLabels((prevLabels) => {
        const newLabels = [...prevLabels, `Chat ${prevLabels.length + 1}`];
        saveToCache(newLabels, updatedData, mode, chartType, metricsType);
        return newLabels;
      });

      return updatedData;
    });
  };

  // Expose function to chatbot globally
  useEffect(() => {
    window.updateChartAfterChat = updateChartAfterChat;
  }, [metricsType, mode, chartType]);

  if (loading) return <p className="chart-message chart-loading">Loading chart...</p>;
  if (!chartData || chartLabels.length === 0)
    return <p className="chart-message chart-no-data">📉 No metrics yet</p>;

  // Prepare datasets
  const datasets =
    metricsType === "emotional"
      ? [
          { label: "Stress Level", data: chartData.stress_level || [], borderColor: "rgba(255, 99, 132, 1)", backgroundColor: "rgba(255, 99, 132, 0.6)" },
          { label: "Happiness Level", data: chartData.happiness_level || [], borderColor: "rgba(75, 192, 192, 1)", backgroundColor: "rgba(75, 192, 192, 0.6)" },
          { label: "Anxiety Level", data: chartData.anxiety_level || [], borderColor: "rgba(255, 206, 86, 1)", backgroundColor: "rgba(255, 206, 86, 0.6)" },
          { label: "Overall Mood", data: chartData.overall_mood_level || [], borderColor: "rgba(54, 162, 235, 1)", backgroundColor: "rgba(54, 162, 235, 0.6)" },
        ]
      : [
          { label: "PHQ-9 Score", data: chartData.screening?.phq9_score || [], borderColor: "rgba(255, 99, 132, 1)", backgroundColor: "rgba(255, 99, 132, 0.6)" },
          { label: "GAD-7 Score", data: chartData.screening?.gad7_score || [], borderColor: "rgba(54, 162, 235, 1)", backgroundColor: "rgba(54, 162, 235, 0.6)" },
          { label: "GHQ Score", data: chartData.screening?.ghq_score || [], borderColor: "rgba(255, 206, 86, 1)", backgroundColor: "rgba(255, 206, 86, 0.6)" },
        ];

  const preparedDatasets = datasets.map((ds) => ({
    ...ds,
    fill: chartType === "line",
    spanGaps: false,
  }));

  const data = { labels: chartLabels, datasets: preparedDatasets };

  const options = {
    responsive: true,
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
        <select className="chart-select" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="entries">Latest Entries</option>
          <option value="daily">Daily Averages</option>
        </select>

        <select className="chart-select" value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>

        <select className="chart-select" value={metricsType} onChange={(e) => setMetricsType(e.target.value)}>
          <option value="emotional">Emotional Metrics</option>
          <option value="screening">Screening Metrics</option>
        </select>
      </div>

      <div className="chart-wrapper">
        {chartType === "bar" ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
      </div>
    </div>
  );
}
