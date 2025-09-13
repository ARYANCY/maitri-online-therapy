import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import API from "../utils/axiosClient";
import "../css/Todo.css";

export default function Todo({ initialTasks = [] }) {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [allCompleted, setAllCompleted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch tasks from server
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/api/dashboard/tasks");
        const fetchedTasks = res.data.tasks.map((t) => ({ ...t, _id: t._id || uuidv4() }));
        setTasks(fetchedTasks.length ? fetchedTasks : initialTasks);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setTasks(initialTasks);
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [initialTasks]);

  // Check if all tasks are completed
  useEffect(() => {
    setAllCompleted(tasks.length > 0 && tasks.every((t) => t.completed));
  }, [tasks]);

  // Update tasks on server
  const updateServerTasks = async (updatedTasks) => {
    try {
      await API.dashboard.updateTasks(updatedTasks);
    } catch (err) {
      console.error("Failed to update tasks:", err);
      setError("Failed to update tasks. Try again.");
    }
  };

  // Add new task
  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (tasks.length >= 10) {
      setError("Maximum 10 tasks allowed!");
      return;
    }

    const newTask = { _id: uuidv4(), title: trimmed, completed: false };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setInput("");
    setError("");
    updateServerTasks(updatedTasks);
  };

  // Toggle task completion
  const toggleDone = (id) => {
    const updatedTasks = tasks.map((task) =>
      task._id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    updateServerTasks(updatedTasks);
  };

  // Delete task
  const handleDelete = (id) => {
    const updatedTasks = tasks.filter((task) => task._id !== id);
    setTasks(updatedTasks);
    updateServerTasks(updatedTasks);
  };

  // Add task on Enter key
  const handleKeyPress = (e) => e.key === "Enter" && handleAdd();

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className="todo-container">
      <h2 className="todo-title">My Tasks</h2>

      <div className="todo-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button onClick={handleAdd} className="todo-add-btn">Add</button>
      </div>
      {error && <p className="todo-error">{error}</p>}

      {tasks.length === 0 ? (
        <p className="todo-empty">No tasks yet.</p>
      ) : (
        <ul className="todo-list">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.li
                key={task._id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className={`todo-item ${task.completed ? "completed" : ""}`}
              >
                <div className="todo-left">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleDone(task._id)}
                    className="todo-checkbox"
                  />
                  <span onClick={() => toggleDone(task._id)} className="todo-text">
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="todo-delete"
                  aria-label={`Delete ${task.title}`}
                >
                  ✕
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {allCompleted && tasks.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.6, type: "spring", stiffness: 250 }}
          className="todo-celebration"
        >
          🎉 All tasks completed! Amazing! 🎉
        </motion.div>
      )}
    </div>
  );
}
