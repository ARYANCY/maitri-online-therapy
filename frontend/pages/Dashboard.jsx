import React, { useState, useEffect, useCallback } from "react";
import Chatbot from "../components/Chatbot";
import Chart from "../components/Chart";
import Todo from "../components/Todo";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("chatbot");
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartLabels, setChartLabels] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState({ dashboard: true, todos: true, user: true });
  const [error, setError] = useState({ dashboard: null, todos: null, user: null });

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/api/session-check");
        if (res.data.user) setUser(res.data.user);
      } catch (err) {
        console.error("Session check failed:", err);
        setError(prev => ({ ...prev, user: "Failed to fetch user." }));
      } finally {
        setLoading(prev => ({ ...prev, user: false }));
      }
    };
    fetchUser();
  }, []);

  // Fetch dashboard data (chart + todos)
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      const res = await API.dashboard.get(); // Use helper method
      setChartData(res.data.chartData || null);
      setChartLabels(res.data.chartLabels || []);
      setTodos(res.data.todos || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(prev => ({ ...prev, dashboard: "Failed to load dashboard data." }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false, todos: false }));
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Handle todo updates
  const handleTodosUpdate = async (updatedTodos) => {
    setTodos(updatedTodos); // optimistic update
    try {
      await API.dashboard.updateTasks(updatedTodos);
    } catch (err) {
      console.error("Failed to update tasks:", err);
      setError(prev => ({ ...prev, todos: "Failed to update tasks." }));
    }
  };

  // Handle chart update after chatbot message
  useEffect(() => {
    window.updateDashboardChart = async () => {
      try {
        const res = await API.dashboard.get();
        setChartData(res.data.chartData || null);
        setChartLabels(res.data.chartLabels || []);
        setTodos(res.data.todos || []);
      } catch (err) {
        console.error("Failed to update chart after chat:", err);
      }
    };
    return () => {
      window.updateDashboardChart = null; // cleanup
    };
  }, []);

  // Loading or error display helper
  const renderContent = () => {
    if (loading.dashboard || loading.user) {
      return <p className="dashboard-loading">Loading...</p>;
    }
    if (error.dashboard) {
      return <p className="dashboard-error">{error.dashboard}</p>;
    }

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
          {["chatbot", "chart", "todo"].map((tab) => (
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
