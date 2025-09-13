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

export default function Chart() {
  const [chartData, setChartData] = useState({
    stress_level: [],
    happiness_level: [],
    anxiety_level: [],
    overall_mood_level: [],
    phq9_score: [],
    gad7_score: [],
    ghq_score: [],
  });
  const [chartLabels, setChartLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("bar");
  const [mode, setMode] = useState("entries");
  const [metricsType, setMetricsType] = useState("emotional");

  // Load cached chart data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("chartData");
      const savedLabels = localStorage.getItem("chartLabels");
      const savedType = localStorage.getItem("chartType");
      const savedMode = localStorage.getItem("chartMode");
      const savedMetricsType = localStorage.getItem("chartMetricsType");

      if (savedData && savedLabels) setChartData(JSON.parse(savedData));
      if (savedData && savedLabels) setChartLabels(JSON.parse(savedLabels));
      if (savedType) setChartType(savedType);
      if (savedMode) setMode(savedMode);
      if (savedMetricsType) setMetricsType(savedMetricsType);
    } catch (err) {
      console.error("Error loading cached chart data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToCache = (labels, data) => {
    localStorage.setItem("chartLabels", JSON.stringify(labels));
    localStorage.setItem("chartData", JSON.stringify(data));
  };

  // Update chart after a chatbot message
  const updateAfterChat = ({ metrics = {}, screening = {} }) => {
    setChartData((prevData) => {
      const updatedData = {
        stress_level: [...prevData.stress_level, metrics.stress_level ?? 0],
        happiness_level: [...prevData.happiness_level, metrics.happiness_level ?? 0],
        anxiety_level: [...prevData.anxiety_level, metrics.anxiety_level ?? 0],
        overall_mood_level: [...prevData.overall_mood_level, metrics.overall_mood_level ?? 0],
        phq9_score: [...prevData.phq9_score, screening.phq9_score ?? 0],
        gad7_score: [...prevData.gad7_score, screening.gad7_score ?? 0],
        ghq_score: [...prevData.ghq_score, screening.ghq_score ?? 0],
      };

      setChartLabels((prevLabels) => {
        // Dynamic label: use date if available or fallback to "Chat X"
        const newLabel = metrics.createdAt
          ? new Date(metrics.createdAt).toLocaleDateString()
          : `Chat ${prevLabels.length + 1}`;
        const newLabels = [...prevLabels, newLabel];
        saveToCache(newLabels, updatedData);
        return newLabels;
      });

      return updatedData;
    });
  };

  // Expose global function
  useEffect(() => {
    window.updateAfterChat = updateAfterChat;
  }, []);

  if (loading) return <p className="chart-message chart-loading">Loading chart...</p>;
  if (!chartData || chartLabels.length === 0)
    return <p className="chart-message chart-no-data">📉 No metrics yet</p>;

  const datasets =
    metricsType === "emotional"
      ? [
          { label: "Stress", data: chartData.stress_level, borderColor: "rgba(255,99,132,1)", backgroundColor: "rgba(255,99,132,0.6)" },
          { label: "Happiness", data: chartData.happiness_level, borderColor: "rgba(75,192,192,1)", backgroundColor: "rgba(75,192,192,0.6)" },
          { label: "Anxiety", data: chartData.anxiety_level, borderColor: "rgba(255,206,86,1)", backgroundColor: "rgba(255,206,86,0.6)" },
          { label: "Overall Mood", data: chartData.overall_mood_level, borderColor: "rgba(54,162,235,1)", backgroundColor: "rgba(54,162,235,0.6)" },
        ]
      : [
          { label: "PHQ-9", data: chartData.phq9_score, borderColor: "rgba(255,99,132,1)", backgroundColor: "rgba(255,99,132,0.6)" },
          { label: "GAD-7", data: chartData.gad7_score, borderColor: "rgba(54,162,235,1)", backgroundColor: "rgba(54,162,235,0.6)" },
          { label: "GHQ", data: chartData.ghq_score, borderColor: "rgba(255,206,86,1)", backgroundColor: "rgba(255,206,86,0.6)" },
        ];

  const preparedDatasets = datasets.map((ds) => ({ ...ds, fill: chartType === "line", spanGaps: true }));

  const data = { labels: chartLabels, datasets: preparedDatasets };

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
        {chartType === "bar" ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
      </div>
    </div>
  );
}
