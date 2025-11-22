import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import "../css/Todo.css";

const STORAGE_KEY = "maitri_tasks";
const STORAGE_VERSION = "1.1";

export default function Todo({
  tasks: initialTasks = [],
  onUpdate,
  onFetch, // prop to fetch tasks from backend
  maxTasks = 10,
  showChatContext = false,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const saveTimer = useRef(null);
  const syncTimer = useRef(null);
  const unmounted = useRef(false);

  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [pendingSync, setPendingSync] = useState(false);

  // ---------------------------
  // NETWORK STATUS HANDLING
  // ---------------------------
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingSync) {
        syncWithBackend(tasks);
        setPendingSync(false);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [tasks, pendingSync]);

  // ---------------------------
  // LOAD TASKS (LOCAL + INITIAL)
  // ---------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let localTasks = [];

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.tasks)) localTasks = parsed.tasks;
        else if (Array.isArray(parsed)) localTasks = parsed;
      }

      const merged = [...localTasks];
      (initialTasks || []).forEach((task) => {
        if (!merged.find((t) => t._id === task._id)) merged.push(task);
      });

      setTasks(merged);
    } catch (err) {
      console.error("Failed to load local tasks:", err);
      localStorage.removeItem(STORAGE_KEY);
      setTasks(initialTasks || []);
    }

    if (inputRef.current) inputRef.current.focus();
  }, [initialTasks]);

  // ---------------------------
  // SAVE TO LOCALSTORAGE
  // ---------------------------
  const persistTasks = useCallback((next) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const data = {
          version: STORAGE_VERSION,
          tasks: next,
          lastUpdated: new Date().toISOString(),
        };
        if (next.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        else localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error("Error persisting tasks:", err);
      }
    }, 300);
  }, []);

  // ---------------------------
  // BACKEND SYNC
  // ---------------------------
  const syncWithBackend = useCallback(
    async (nextTasks) => {
      if (!onUpdate || !isOnline) {
        if (!isOnline) setPendingSync(true);
        return;
      }
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(async () => {
        if (unmounted.current) return;
        try {
          setLoading(true);
          await onUpdate(nextTasks);
          setError("");
          setRetryCount(0);
        } catch (err) {
          console.error("Sync failed:", err);
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              syncWithBackend(nextTasks);
            }, delay);
          } else {
            setError(t("todo.updateError", "Failed to sync tasks with server."));
          }
        } finally {
          if (!unmounted.current) setLoading(false);
        }
      }, 400);
    },
    [onUpdate, isOnline, retryCount, t]
  );

  // ---------------------------
  // CENTRAL TASK UPDATE HANDLER
  // ---------------------------
  const updateTasks = useCallback(
    (updater) => {
      setTasks((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (!Array.isArray(next)) return prev;
        persistTasks(next);
        syncWithBackend(next);
        return next;
      });
    },
    [persistTasks, syncWithBackend]
  );

  // ---------------------------
  // TASK OPERATIONS
  // ---------------------------
  const handleAdd = useCallback(() => {
    const text = input.trim();
    if (!text) return setError(t("todo.emptyInput", "Task cannot be empty."));
    if (text.length > 200)
      return setError(t("todo.tooLong", "Task too long (max 200 chars)."));

    updateTasks((prev) => {
      if (prev.length >= maxTasks) {
        setError(t("todo.maxTasks", `Maximum ${maxTasks} tasks allowed.`));
        return prev;
      }
      setInput("");
      setError("");
      return [
        ...prev,
        {
          _id: uuidv4(),
          title: text,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  }, [input, maxTasks, updateTasks, t]);

  const toggleDone = useCallback(
    (id) =>
      updateTasks((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toISOString() : null,
              }
            : t
        )
      ),
    [updateTasks]
  );

  const handleDelete = useCallback(
    (id) => updateTasks((prev) => prev.filter((t) => t._id !== id)),
    [updateTasks]
  );

  const handleDeleteAll = useCallback(() => {
    if (window.confirm(t("todo.confirmDeleteAll", "Delete all tasks?")))
      updateTasks([]);
  }, [updateTasks, t]);

  const handleKeyPress = useCallback(
    (e) => e.key === "Enter" && handleAdd(),
    [handleAdd]
  );

  // ---------------------------
  // REFRESH BUTTON
  // ---------------------------
  const handleRefresh = useCallback(async () => {
  if (!onFetch) return;
  try {
    setLoading(true);
    const data = await onFetch();
    console.log("Todo refresh data:", data); // <-- debug
    if (Array.isArray(data)) updateTasks(data);
    else if (data?.todos && Array.isArray(data.todos)) updateTasks(data.todos);
    else console.warn("Invalid refresh response format:", data);
  } catch (err) {
    console.error("Todo generation failed:", err);
    setError(t("todo.refreshError", "Unable to refresh tasks from server."));
  } finally {
    setLoading(false);
  }
}, [onFetch, updateTasks, t]);

  // ---------------------------
  // DRAG & DROP
  // ---------------------------
  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const reordered = Array.from(tasks);
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, moved);
      updateTasks(reordered);
    },
    [tasks, updateTasks]
  );

  // ---------------------------
  // CLEANUP
  // ---------------------------
  useEffect(() => {
    return () => {
      unmounted.current = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, []);

  const allCompleted = useMemo(
    () => tasks.length > 0 && tasks.every((t) => t.completed),
    [tasks]
  );

  // ---------------------------
  // TASK ITEM COMPONENT
  // ---------------------------
  const TaskItem = useCallback(
    ({ task, index }) => (
      <Draggable
        key={task._id}
        draggableId={task._id}
        index={index}
        isDragDisabled={task.completed}
      >
        {(provided) => (
          <li
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`todo-item ${task.completed ? "completed" : ""}`}
          >
            <div className="todo-item-content">
              <label htmlFor={`task-${task._id}`}>
                <input
                  id={`task-${task._id}`}
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleDone(task._id)}
                />
                <span className="todo-text">{task.title}</span>
                {task.createdAt && (
                  <span className="todo-date">
                    {format(new Date(task.createdAt), "MMM d")}
                  </span>
                )}
              </label>
              <button
                onClick={() => handleDelete(task._id)}
                className="todo-delete"
              >
                ✕
              </button>
            </div>
            {showChatContext && task.chatMessage && (
              <div className="todo-chat-context">
                <span>{t("todo.chatContext", "From chat")}: "{task.chatMessage}"</span>
                {task.chatTimestamp && (
                  <span>
                    {format(new Date(task.chatTimestamp), "MMM d, yyyy h:mm a")}
                  </span>
                )}
              </div>
            )}
          </li>
        )}
      </Draggable>
    ),
    [toggleDone, handleDelete, showChatContext, t]
  );

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="todo-container">
      <div className="todo-header">
        <h2>{t("todo.title", "My Tasks")}</h2>
        <div className="todo-header-buttons">
          {onFetch && (
            <button onClick={handleRefresh} disabled={loading} className="todo-refresh-btn">
              {t("todo.refresh", "Refresh")}
            </button>
          )}
          <button onClick={handleDeleteAll} disabled={loading || tasks.length === 0} className="todo-delete-all">
            {t("todo.deleteAll", "Delete All")}
          </button>
        </div>
      </div>

      <div className="todo-input-area">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t("todo.placeholder", "Add a new task...")}
          maxLength={200}
        />
        <button onClick={handleAdd} disabled={!input.trim() || loading}>
          {loading ? t("todo.saving", "Saving...") : t("todo.add", "Add")}
        </button>
      </div>

      {error && <div className="todo-error">{error}</div>}
      {!isOnline && (
        <div className="todo-offline-notice">
          {t("todo.offlineMode", "You're offline. Sync will resume automatically.")}
        </div>
      )}

      {tasks.length === 0 ? (
        loading ? (
          <p className="todo-empty">{t("todo.loading", "Loading tasks...")}</p>
        ) : (
          <p className="todo-empty">{t("todo.empty", "No tasks yet.")}</p>
        )
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="todo-list">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} className="todo-list">
                {tasks.map((task, index) => (
                  <TaskItem key={task._id} task={task} index={index} />
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {allCompleted && tasks.length > 0 && (
        <div className="todo-celebration">
          🎉 {t("todo.allCompleted", "All tasks completed!")} 🎉
        </div>
      )}

      {pendingSync && (
        <div className="todo-sync-status">
          {t("todo.pendingSync", "Pending sync with server")}
        </div>
      )}
    </div>
  );
}
