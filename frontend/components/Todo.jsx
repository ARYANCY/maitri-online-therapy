import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import "../css/Todo.css";

export default function Todo({ tasks: initialTasks = [], onUpdate, loading = false, maxTasks = 10 }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const cancelRef = useRef(false);

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    const parsedStored = storedTasks ? JSON.parse(storedTasks) : [];
    const combined = [...parsedStored, ...(Array.isArray(initialTasks) ? initialTasks : [])];
    const uniqueTasks = Array.from(new Map(combined.map(t => [t._id, t])).values());
    setTasks(uniqueTasks);
  }, [initialTasks]);

  const persistTasks = useCallback(updated => {
    if (updated.length > 0) localStorage.setItem("tasks", JSON.stringify(updated));
    else localStorage.removeItem("tasks");
  }, []);

const updateTasks = useCallback(
  (updater) => {
    setTasks((prevTasks) => {
      const updatedTasks = typeof updater === "function" ? updater(prevTasks) : updater;
      persistTasks(updatedTasks);

      if (onUpdate && !cancelRef.current) {
        // Fire and forget, but handle errors
        Promise.resolve(onUpdate(updatedTasks)).catch((err) => {
          console.error("Failed to sync tasks:", err);
          setError(t("todo.updateError", "Failed to update tasks on server."));
        });
      }

      return updatedTasks;
    });
  },
  [onUpdate, persistTasks, t]
);



  const handleAdd = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError(t("todo.emptyInput", "Task cannot be empty."));
      return;
    }
    updateTasks(prev => {
      if (prev.length >= maxTasks) {
        setError(t("todo.maxTasks", `Maximum ${maxTasks} tasks allowed!`));
        return prev;
      }
      setInput("");
      setError("");
      return [...prev, { _id: uuidv4(), title: trimmed, completed: false }];
    });
  }, [input, updateTasks, maxTasks, t]);

  const toggleDone = useCallback(id => {
    updateTasks(prev => prev.map(t => (t._id === id ? { ...t, completed: !t.completed } : t)));
  }, [updateTasks]);

  const handleDelete = useCallback(id => {
    updateTasks(prev => prev.filter(t => t._id !== id));
  }, [updateTasks]);

  const handleDeleteAll = useCallback(() => {
    updateTasks([]);
  }, [updateTasks]);

  const handleKeyPress = e => e.key === "Enter" && handleAdd();

  const allCompleted = useMemo(() => tasks.length > 0 && tasks.every(t => t.completed), [tasks]);

  const onDragEnd = useCallback(
    result => {
      if (!result.destination) return;
      const reordered = Array.from(tasks);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);
      updateTasks(reordered);
    },
    [tasks, updateTasks]
  );

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

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
          aria-label={t("todo.inputLabel", "New task input")}
        />
        <button onClick={handleAdd} className="todo-add-btn">{t("todo.add", "Add")}</button>
        {tasks.length > 0 && (
          <button onClick={handleDeleteAll} className="todo-delete-all">{t("todo.deleteAll", "Delete All")}</button>
        )}
      </div>

      {error && <p className="todo-error" role="alert">{error}</p>}

      {tasks.length === 0 ? (
        <p className="todo-empty">{t("todo.empty", "No tasks yet.")}</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="todo-list">
            {provided => (
              <ul className="todo-list" {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {provided => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`todo-item ${task.completed ? "completed" : ""}`}
                      >
                        <label className="todo-left">
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
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {allCompleted && (
        <div className="todo-celebration" role="status" aria-live="polite">
          🎉 All tasks completed! Amazing! 🎉
        </div>
      )}
    </div>
  );
}
