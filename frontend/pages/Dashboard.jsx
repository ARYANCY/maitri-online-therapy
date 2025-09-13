import React, { useState, useEffect, useCallback } from "react";
import Chatbot from "../components/Chatbot";
import Chart from "../components/Chart";
import Todo from "../components/Todo";
import Navbar from "../components/Navbar";
import API from "../utils/axiosClient";
import "../css/Dashboard.css";

export default function Dashboard() {
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
      setUser(data.user || null);
    } catch (err) {
      console.error("Session check failed:", err);
      setError(prev => ({ ...prev, user: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, []);

  // Fetch dashboard data including todos
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      const data = await API.dashboard.get();
      setChartData(data.chartData || null);
      setChartLabels(data.chartLabels || []);
      setTodos(data.todos || []);
      setError(prev => ({ ...prev, dashboard: null }));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(prev => ({ ...prev, dashboard: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false, todos: false }));
    }
  }, []);

  // Update todos locally and on server
  const handleTodosUpdate = async (updatedTodos) => {
    setTodos(updatedTodos); // Optimistic UI
    setLoading(prev => ({ ...prev, todos: true }));
    try {
      await API.dashboard.updateTasks(updatedTodos);
      setError(prev => ({ ...prev, todos: null }));
    } catch (err) {
      console.error("Failed to update tasks:", err);
      setError(prev => ({ ...prev, todos: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, todos: false }));
    }
  };

  // Init
  useEffect(() => {
    fetchUser();
    fetchDashboardData();
  }, [fetchUser, fetchDashboardData]);

  // Make chart update globally available
  useEffect(() => {
    window.updateDashboardChart = async () => {
      await fetchDashboardData();
    };
    return () => { window.updateDashboardChart = null; };
  }, [fetchDashboardData]);

  // Render content
  const renderContent = () => {
    if (loading.user || loading.dashboard) return <p className="dashboard-loading">Loading...</p>;
    if (error.dashboard) return <p className="dashboard-error">{error.dashboard}</p>;

    switch (activeTab) {
      case "chatbot":
        return <Chatbot onTodosUpdate={handleTodosUpdate} />;
      case "chart":
        return <Chart chartData={chartData} chartLabels={chartLabels} />;
      case "todo":
        return <Todo tasks={todos} onUpdate={handleTodosUpdate} loading={loading.todos} />;
      default:
        return null;
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
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>
        <div className="dashboard-content">{renderContent()}</div>
      </div>
    </div>
  );
}
