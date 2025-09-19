import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import Chart from "../components/Chart";
import Todo from "../components/Todo";
import Navbar from "../components/Navbar";
import API from "../utils/axiosClient";
import "../css/Dashboard.css";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("chatbot");
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartLabels, setChartLabels] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState({ user: true, dashboard: true, todos: true });
  const [error, setError] = useState({ user: null, dashboard: null, todos: null });

  // Fetch user session
  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
    } catch (err) {
      console.error("Session check failed:", err);
      navigate("/login");
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, [navigate]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      const data = await API.dashboard.get();

      const normalizedChartData = {};
      Object.keys(data.chartData || {}).forEach(key => {
        normalizedChartData[key] = Array.isArray(data.chartData[key])
          ? data.chartData[key]
          : [data.chartData[key]];
      });

      setChartData(normalizedChartData);
      setChartLabels(data.chartLabels || []);
      setTodos(data.todos || []);
      setError(prev => ({ ...prev, dashboard: null }));
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      if (err.message.includes("401")) navigate("/login");
      else setError(prev => ({ ...prev, dashboard: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false, todos: false }));
    }
  }, [user, navigate]);

  const handleTodosUpdate = async (updatedTodos) => {
    const prevTodos = [...todos];
    setTodos(updatedTodos);
    setLoading(prev => ({ ...prev, todos: true }));

    try {
      await API.dashboard.updateTasks(updatedTodos);
      setError(prev => ({ ...prev, todos: null }));
    } catch (err) {
      console.error("Failed to update tasks:", err);
      setTodos(prevTodos);
      setError(prev => ({ ...prev, todos: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, todos: false }));
    }
  };

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { fetchDashboardData(); }, [user, fetchDashboardData]);
  useEffect(() => {
    window.updateDashboardChart = fetchDashboardData;
    return () => { window.updateDashboardChart = null; };
  }, [fetchDashboardData]);

  const renderContent = () => {
    if (loading.user || loading.dashboard)
      return <p className="dashboard-loading">{t("dashboard.loading", "Loading...")}</p>;
    if (error.dashboard)
      return <p className="dashboard-error">{t("dashboard.error", "An error occurred")}: {error.dashboard}</p>;

    switch (activeTab) {
      case "chatbot": return <Chatbot onTodosUpdate={handleTodosUpdate} />;
      case "chart": return <Chart chartData={chartData} chartLabels={chartLabels} />;
      case "todo": return <Todo tasks={todos} onUpdate={handleTodosUpdate} loading={loading.todos} />;
      default: return null;
    }
  };

  return (
    <div className="dashboard">
      <Navbar user={user} />
      <div className="dashboard-container">
        <ul className="dashboard-tabs">
          {["chatbot", "chart", "todo"].map(tab => (
            <li key={tab}>
              <button
                className={`dashboard-tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`dashboard.tab.${tab}`, tab.charAt(0).toUpperCase() + tab.slice(1))}
              </button>
            </li>
          ))}
        </ul>
        <div className="dashboard-content">{renderContent()}</div>
      </div>
    </div>
  );
}
