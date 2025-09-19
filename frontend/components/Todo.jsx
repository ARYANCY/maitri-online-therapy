import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import "../css/Todo.css";

export default function Todo({
  tasks: initialTasks = [],
  onUpdate,
  loading,
  maxTasks = 10, // ✅ configurable max limit
}) {
  const { t } = useTranslation();

  // ✅ Local state for tasks
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("tasks");
    const local = stored ? JSON.parse(stored) : [];
    const combined = [...local, ...initialTasks];
    const uniqueById = Array.from(new Map(combined.map(t => [t._id, t])).values());
    return uniqueById;
  });

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [lastGoodState, setLastGoodState] = useState(tasks); // ✅ rollback on server fail

  // ✅ Sync with parent updates (from Chatbot via Dashboard)
  useEffect(() => {
    if (initialTasks && Array.isArray(initialTasks)) {
      setTasks(prev => {
        const combined = [...initialTasks];
        const uniqueById = Array.from(new Map(combined.map(t => [t._id, t])).values());
        return uniqueById;
      });
    }
  }, [initialTasks]);

  // ✅ Save tasks to localStorage
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } else {
      localStorage.removeItem("tasks");
    }
  }, [tasks]);

  // ✅ Update tasks both locally & server with rollback
  const updateTasks = useCallback(
    async (updatedTasks) => {
      setLastGoodState(tasks); // keep old state for rollback
      setTasks(updatedTasks); // optimistic update
      try {
        if (onUpdate) await onUpdate(updatedTasks);
        setError("");
      } catch (err) {
        console.error("Failed to update tasks:", err);
        setTasks(lastGoodState); // rollback
        setError(t("todo.updateError", "Failed to update tasks on server."));
      }
    },
    [tasks, onUpdate, t, lastGoodState]
  );

  // ✅ Add task
  const handleAdd = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError(t("todo.emptyInput", "Task cannot be empty."));
      return;
    }
    if (tasks.length >= maxTasks) {
      setError(t("todo.maxTasks", `Maximum ${maxTasks} tasks allowed!`));
      return;
    }
    const newTask = { _id: uuidv4(), title: trimmed, completed: false };
    updateTasks([...tasks, newTask]);
    setInput("");
    setError("");
  }, [input, tasks, updateTasks, t, maxTasks]);

  // ✅ Toggle completion
  const toggleDone = useCallback(
    (id) => {
      updateTasks(
        tasks.map((t) =>
          t._id === id ? { ...t, completed: !t.completed } : t
        )
      );
    },
    [tasks, updateTasks]
  );

  // ✅ Delete
  const handleDelete = useCallback(
    (id) => {
      updateTasks(tasks.filter((t) => t._id !== id));
    },
    [tasks, updateTasks]
  );

  // ✅ Enter key add
  const handleKeyPress = (e) => e.key === "Enter" && handleAdd();

  // ✅ Memoize allCompleted
  const allCompleted = useMemo(
    () => tasks.length > 0 && tasks.every((t) => t.completed),
    [tasks]
  );

  if (loading)
    return (
      <p className="todo-loading">
        {t("todo.loading", "Loading tasks...")}
      </p>
    );

  return (
    <div className="todo-container">
      <h2 className="todo-title">{t("todo.title", "My Tasks")}</h2>

      {/* Input Area */}
      <div className="todo-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t("todo.placeholder", "Add a new task...")}
          className="todo-input"
          aria-label={t("todo.inputLabel", "New task input")}
        />
        <button onClick={handleAdd} className="todo-add-btn">
          {t("todo.add", "Add")}
        </button>
      </div>

      {/* Error */}
      {error && <p className="todo-error" role="alert">{error}</p>}

      {/* Task List */}
      {tasks.length === 0 ? (
        <p className="todo-empty">{t("todo.empty", "No tasks yet.")}</p>
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
                <label className="todo-left">
                  {/* ✅ Accessible checkbox */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleDone(task._id)}
                    className="todo-checkbox"
                    aria-checked={task.completed}
                    aria-label={t("todo.toggleTask", { title: task.title })}
                  />
                  <span className="todo-text">{task.title}</span>
                </label>

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

      {/* Celebration */}
      {allCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.6, type: "spring", stiffness: 250 }}
          className="todo-celebration"
          role="status"
          aria-live="polite"
        >
          {t("todo.completedAll", "🎉 All tasks completed! Amazing! 🎉")}
        </motion.div>
      )}
    </div>
  );
}
