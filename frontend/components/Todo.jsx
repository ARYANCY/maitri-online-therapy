import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import "../css/components/Todo.css";

const STORAGE_KEY = "maitri_tasks";
const STORAGE_VERSION = "1.1";

export default function Todo({
  tasks: initialTasks = [],
  onUpdate,
  onFetch, 
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

  
  
  
  const handleRefresh = useCallback(async () => {
  if (!onFetch) return;
  try {
    setLoading(true);
    const data = await onFetch();
    console.log("Todo refresh data:", data); 
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

  
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, completionRate };
  }, [tasks]);

  
  
  
  const TaskItem = useCallback(
    ({ task, index }) => (
      <Draggable
        key={task._id}
        draggableId={task._id}
        index={index}
        isDragDisabled={task.completed}
      >
            {(provided, snapshot) => (
              <li
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`todo-item list-group-item ${task.completed ? "completed" : ""} ${snapshot.isDragging ? "dragging" : ""}`}
              >
                <div className="todo-item-content d-flex align-items-center gap-3 w-100">
                  <label htmlFor={`task-${task._id}`} className="todo-checkbox-label d-flex align-items-center gap-2 flex-grow-1 mb-0">
                    <input
                      id={`task-${task._id}`}
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleDone(task._id)}
                      className="todo-checkbox form-check-input"
                      style={{width: '20px', height: '20px', cursor: 'pointer'}}
                    />
                    <span className="todo-text flex-grow-1">{task.title}</span>
                  </label>
                  <div className="todo-item-meta d-flex align-items-center gap-2 flex-shrink-0">
                    {task.createdAt && (
                      <span className="todo-date badge bg-light text-dark d-flex align-items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        <small>{format(new Date(task.createdAt), "MMM d")}</small>
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="todo-delete btn btn-sm btn-link text-danger p-1"
                      aria-label={t("todo.delete", "Delete task")}
                      style={{minWidth: '32px', minHeight: '32px'}}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                {showChatContext && task.chatMessage && (
                  <div className="todo-chat-context mt-2 p-2 bg-light rounded small text-muted">
                    <span className="d-block"><strong>{t("todo.chatContext", "From chat")}:</strong> "{task.chatMessage}"</span>
                    {task.chatTimestamp && (
                      <span className="d-block mt-1">
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

  
  
  
  return (
    <div className="todo-container card animate-fade-in border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
      <div className="todo-header card-header d-flex justify-content-between align-items-start flex-wrap gap-3 pb-3 border-bottom" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        borderRadius: '16px 16px 0 0'
      }}>
        <div className="todo-header-main d-flex align-items-center gap-3 flex-grow-1">
          <div className="todo-header-icon" style={{ fontSize: '2rem' }}>✅</div>
          <div>
            <h2 className="h4 mb-1 fw-bold" style={{ color: '#1e293b' }}>{t("todo.title", "My Tasks")}</h2>
            <p className="text-muted mb-0 small" style={{ fontSize: '0.875rem' }}>{t("todo.subtitle", "Stay organized and productive")}</p>
          </div>
        </div>
        <div className="todo-header-buttons d-flex gap-2 flex-wrap">
          {onFetch && (
            <button 
              onClick={handleRefresh} 
              disabled={loading} 
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              aria-label={t("todo.refresh", "Refresh")}
              style={{
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className={loading ? 'spinning' : ''}
                viewBox="0 0 16 16"
              >
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"></path>
                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"></path>
              </svg>
              <span>{loading ? t("todo.refreshing", "Refreshing...") : t("todo.refresh", "Refresh")}</span>
            </button>
          )}
          <button 
            onClick={handleDeleteAll} 
            disabled={loading || tasks.length === 0} 
            className="btn btn-outline-danger d-flex align-items-center gap-2"
            aria-label={t("todo.deleteAll", "Delete All")}
            style={{
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
            <span>{t("todo.deleteAll", "Delete All")}</span>
          </button>
        </div>
      </div>

      <div className="card-body">
        
        {tasks.length > 0 && (
          <div className="row g-2 g-md-3 mb-3 mb-md-4">
            <div className="col-6 col-md-3">
              <div className="card text-center todo-stat-card animate-scale-in border-0 shadow-sm" style={{
                animationDelay: '0.1s',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: '12px'
              }}>
                <div className="card-body p-2 p-md-2">
                  <div className="fs-5 mb-1">📊</div>
                  <div className="h5 mb-0 fw-bold" style={{ fontSize: '1.25rem' }}>{stats.total}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t("todo.total", "Total")}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center todo-stat-card border-0 shadow-sm animate-scale-in" style={{
                animationDelay: '0.2s',
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                borderRadius: '12px'
              }}>
                <div className="card-body p-2 p-md-2">
                  <div className="fs-5 mb-1">✅</div>
                  <div className="h5 mb-0 text-success fw-bold" style={{ fontSize: '1.25rem' }}>{stats.completed}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t("todo.completed", "Completed")}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center todo-stat-card border-0 shadow-sm animate-scale-in" style={{
                animationDelay: '0.3s',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '12px'
              }}>
                <div className="card-body p-2 p-md-2">
                  <div className="fs-5 mb-1">⏳</div>
                  <div className="h5 mb-0 text-warning fw-bold" style={{ fontSize: '1.25rem' }}>{stats.pending}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t("todo.pending", "Pending")}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center todo-stat-card border-0 shadow-sm animate-scale-in" style={{
                animationDelay: '0.4s',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                borderRadius: '12px'
              }}>
                <div className="card-body p-2 p-md-2">
                  <div className="fs-5 mb-1">📈</div>
                  <div className="h5 mb-0 text-info fw-bold" style={{ fontSize: '1.25rem' }}>{stats.completionRate}%</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t("todo.completion", "Progress")}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="todo-input-area input-group mb-3">
          <input
            ref={inputRef}
            type="text"
            id="todo-input"
            name="todo-input"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t("todo.placeholder", "Add a new task...")}
            maxLength={200}
            autoComplete="off"
            style={{
              borderRadius: '8px 0 0 8px',
              border: '2px solid #e2e8f0',
              padding: '0.75rem 1rem',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button 
            className="btn btn-primary d-flex align-items-center gap-2" 
            onClick={handleAdd} 
            disabled={!input.trim() || loading}
            style={{
              borderRadius: '0 8px 8px 0',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              background: !input.trim() || loading 
                ? 'linear-gradient(135deg, #cbd5e1, #94a3b8)' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              transition: 'all 0.3s ease',
              boxShadow: !input.trim() || loading ? 'none' : '0 2px 8px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = !input.trim() || loading ? 'none' : '0 2px 8px rgba(102, 126, 234, 0.3)';
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm"></span>
                <span>{t("todo.saving", "Saving...")}</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                <span>{t("todo.add", "Add")}</span>
              </>
            )}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {!isOnline && (
          <div className="alert alert-warning">
            {t("todo.offlineMode", "You're offline. Sync will resume automatically.")}
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="text-center py-5 animate-fade-in">
            <div className="display-1 mb-3 animate-float">📝</div>
            <h3 className="h4">{loading ? t("todo.loading", "Loading tasks...") : t("todo.emptyTitle", "No tasks yet")}</h3>
            <p className="text-muted">{loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : t("todo.emptyDescription", "Add your first task above to get started!")}</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="todo-list">
              {(provided) => (
                <ul ref={provided.innerRef} {...provided.droppableProps} className="list-group">
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
          <div className="alert alert-success text-center d-flex align-items-center justify-content-center gap-2 animate-scale-in">
            <span className="fs-4">🎉</span>
            <span className="fw-bold">{t("todo.allCompleted", "All tasks completed!")}</span>
            <span className="fs-4">🎉</span>
          </div>
        )}

        {pendingSync && (
          <div className="alert alert-info">
            {t("todo.pendingSync", "Pending sync with server")}
          </div>
        )}
      </div>
    </div>
  );
}
