import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import "../css/Todo.css";

export default function Todo({ tasks: initialTasks = [], onUpdate, loading }) {
  const { t } = useTranslation();

  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [allCompleted, setAllCompleted] = useState(false);
  const [error, setError] = useState("");

  // Initialize tasks from props
  useEffect(() => setTasks(initialTasks), [initialTasks]);

  // Check if all tasks are completed
  useEffect(() => {
    setAllCompleted(tasks.length > 0 && tasks.every(t => t.completed));
  }, [tasks]);

  // Local + server update
  const updateTasks = async (updatedTasks) => {
    setTasks(updatedTasks); // optimistic update
    try {
      if (onUpdate) await onUpdate(updatedTasks);
      setError("");
    } catch (err) {
      console.error("Failed to sync tasks:", err);
      setError(t("todo.updateError", "Failed to update tasks on server."));
    }
  };

  // Add task
  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (tasks.length >= 10) {
      setError(t("todo.maxTasks", "Maximum 10 tasks allowed!"));
      return;
    }
    const newTask = { _id: uuidv4(), title: trimmed, completed: false };
    updateTasks([...tasks, newTask]);
    setInput("");
  };

  // Toggle task completion
  const toggleDone = (id) =>
    updateTasks(tasks.map(t => t._id === id ? { ...t, completed: !t.completed } : t));

  // Delete task
  const handleDelete = (id) => updateTasks(tasks.filter(t => t._id !== id));

  const handleKeyPress = (e) => e.key === "Enter" && handleAdd();

  if (loading) return <p className="todo-loading">{t("todo.loading", "Loading tasks...")}</p>;

  return (
    <div className="todo-container">
      <h2 className="todo-title">{t("todo.title", "My Tasks")}</h2>

      <div className="todo-input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t("todo.placeholder", "Add a new task...")}
          className="todo-input"
        />
        <button onClick={handleAdd} className="todo-add-btn">{t("todo.add", "Add")}</button>
      </div>

      {error && <p className="todo-error">{error}</p>}

      {tasks.length === 0 ? (
        <p className="todo-empty">{t("todo.empty", "No tasks yet.")}</p>
      ) : (
        <ul className="todo-list">
          <AnimatePresence>
            {tasks.map(task => (
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
                  aria-label={t("todo.deleteTask", { title: task.title })}
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
          {t("todo.completedAll", "🎉 All tasks completed! Amazing! 🎉")}
        </motion.div>
      )}
    </div>
  );
}
