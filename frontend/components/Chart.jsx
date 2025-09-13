import React, { useCallback, useEffect, useMemo, useState } from "react";
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

  const ensureShape = useCallback((labels, data = {}) => {
    const keys = [
      "stress_level",
      "happiness_level",
      "anxiety_level",
      "overall_mood_level",
      "phq9_score",
      "gad7_score",
      "ghq_score",
    ];
    const shaped = {};
    for (const key of keys) {
      const src = Array.isArray(data[key]) ? data[key] : [];
      let arr = src.slice(0, labels.length);
      if (arr.length < labels.length) {
        arr = arr.concat(Array(labels.length - arr.length).fill(0));
      }
      shaped[key] = arr;
    }
    return shaped;
  }, []);

  const saveToCache = useCallback((labels, data) => {
    try {
      localStorage.setItem("chartLabels", JSON.stringify(labels));
      localStorage.setItem("chartData", JSON.stringify(data));
    } catch {}
  }, []);

  // Initial load from cache
  useEffect(() => {
    try {
      const savedDataRaw = localStorage.getItem("chartData");
      const savedLabelsRaw = localStorage.getItem("chartLabels");
      const savedType = localStorage.getItem("chartType");
      const savedMode = localStorage.getItem("chartMode");
      const savedMetricsType = localStorage.getItem("chartMetricsType");

      const labels = savedLabelsRaw ? JSON.parse(savedLabelsRaw) : [];
      const data = savedDataRaw ? JSON.parse(savedDataRaw) : null;

      if (labels.length) {
        setChartLabels(labels);
        setChartData(ensureShape(labels, data || {}));
      }

      if (savedType) setChartType(savedType);
      if (savedMode) setMode(savedMode);
      if (savedMetricsType) setMetricsType(savedMetricsType);
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false);
    }
  }, [ensureShape]);

  // Persist user selections
  useEffect(() => {
    try { localStorage.setItem("chartType", chartType); } catch {}
  }, [chartType]);
  useEffect(() => {
    try { localStorage.setItem("chartMode", mode); } catch {}
  }, [mode]);
  useEffect(() => {
    try { localStorage.setItem("chartMetricsType", metricsType); } catch {}
  }, [metricsType]);

  // Robust chart update function: pass { metrics, screening } from backend response.metrics
  const updateAfterChat = useCallback(({ metrics = {}, screening = {} } = {}) => {
    const noMetrics = !metrics || Object.keys(metrics).length === 0;
    const noScreening = !screening || Object.keys(screening).length === 0;
    if (noMetrics && noScreening) return;

    setChartLabels(prevLabels => {
      const nextLabels = [...prevLabels, `Chat ${prevLabels.length + 1}`];

      setChartData(prevData => {
        const current = ensureShape(prevLabels, prevData || {});
        const nextData = {
          ...current,
          stress_level: [...current.stress_level, Number(metrics.stress_level ?? 0)],
          happiness_level: [...current.happiness_level, Number(metrics.happiness_level ?? 0)],
          anxiety_level: [...current.anxiety_level, Number(metrics.anxiety_level ?? 0)],
          overall_mood_level: [...current.overall_mood_level, Number(metrics.overall_mood_level ?? 0)],
          phq9_score: [...current.phq9_score, Number(screening.phq9_score ?? 0)],
          gad7_score: [...current.gad7_score, Number(screening.gad7_score ?? 0)],
          ghq_score: [...current.ghq_score, Number(screening.ghq_score ?? 0)],
        };

        saveToCache(nextLabels, nextData);
        return nextData;
      });

      return nextLabels;
    });
  }, [ensureShape, saveToCache]);

  // Expose globally for chatbot integration
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.updateAfterChat = updateAfterChat;
      return () => { delete window.updateAfterChat; };
    }
  }, [updateAfterChat]);

  if (loading) return <p className="chart-message chart-loading">Loading chart...</p>;
  if (!chartData || chartLabels.length === 0)
    return <p className="chart-message chart-no-data">📉 No metrics yet</p>;

  const datasetsBase = useMemo(() => {
    if (metricsType === "emotional") {
      return [
        { label: "Stress", data: chartData.stress_level, borderColor: "rgba(255,99,132,1)", backgroundColor: "rgba(255,99,132,0.6)" },
        { label: "Happiness", data: chartData.happiness_level, borderColor: "rgba(75,192,192,1)", backgroundColor: "rgba(75,192,192,0.6)" },
        { label: "Anxiety", data: chartData.anxiety_level, borderColor: "rgba(255,206,86,1)", backgroundColor: "rgba(255,206,86,0.6)" },
        { label: "Overall Mood", data: chartData.overall_mood_level, borderColor: "rgba(54,162,235,1)", backgroundColor: "rgba(54,162,235,0.6)" },
      ];
    }
    return [
      { label: "PHQ-9", data: chartData.phq9_score, borderColor: "rgba(255,99,132,1)", backgroundColor: "rgba(255,99,132,0.6)" },
      { label: "GAD-7", data: chartData.gad7_score, borderColor: "rgba(54,162,235,1)", backgroundColor: "rgba(54,162,235,0.6)" },
      { label: "GHQ", data: chartData.ghq_score, borderColor: "rgba(255,206,86,1)", backgroundColor: "rgba(255,206,86,0.6)" },
    ];
  }, [metricsType, chartData]);

  const preparedDatasets = useMemo(
    () => datasetsBase.map(ds => ({ ...ds, fill: chartType === "line", spanGaps: false })),
    [datasetsBase, chartType]
  );

  const data = useMemo(
    () => ({ labels: chartLabels, datasets: preparedDatasets }),
    [chartLabels, preparedDatasets]
  );

  const maxScreen = useMemo(() => {
    if (!chartData) return 0;
    const vals = [
      ...(chartData.phq9_score || []),
      ...(chartData.gad7_score || []),
      ...(chartData.ghq_score || []),
    ].map(Number).filter(v => Number.isFinite(v));
    return vals.length ? Math.max(...vals) : 0;
  }, [chartData]);

  const options = useMemo(() => {
    const screeningSuggestedMax = Math.max(10, Math.min(36, Math.ceil((maxScreen || 0) * 1.2)));
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: `User Metrics Chart (${mode} - ${metricsType})` },
      },
      scales: {
        x: { ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 } },
        y: { beginAtZero: true, suggestedMax: metricsType === "emotional" ? 50 : screeningSuggestedMax },
      },
    };
  }, [mode, metricsType, maxScreen]);

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