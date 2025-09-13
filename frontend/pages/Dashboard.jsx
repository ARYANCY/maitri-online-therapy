import React, { useState, useEffect } from "react";
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
  const [todos, setTodos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await API.get("/api/session-check");
        if (res.data.user) setUser(res.data.user);
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/api/dashboard");
        setChartData(res.data.chartData || null);
        setTodos(res.data.todos || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoadingTodos(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleTodosUpdate = async (updatedTodos) => {
    setTodos(updatedTodos);
    try {
      await API.put("/api/dashboard/tasks", { tasks: updatedTodos });
    } catch (err) {
      console.error("Failed to update tasks:", err);
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

        <div className="dashboard-content">
          {activeTab === "chatbot" && <Chatbot onTodosUpdate={handleTodosUpdate} />}
          {activeTab === "chart" && <Chart chartData={chartData} />}
          {activeTab === "todo" && (
            <Todo
              tasks={todos}
              onUpdate={handleTodosUpdate}
              loading={loadingTodos}
            />
          )}
        </div>
      </div>
    </div>
  );
}
