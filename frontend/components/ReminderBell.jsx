import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import API from "../utils/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../css/ReminderBell.css";

export default function ReminderBell({ onCreated }) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState("1day");
  const [customISO, setCustomISO] = useState("");
  const [message, setMessage] = useState(
    t("reminder.defaultMessage", "Quick reminder from Maitri")
  );
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, sent: 0, overdue: 0 });

  const fetchReminders = async () => {
    try {
      setInfo("Loading reminders...");
      const res = await API.get("/api/reminders");
      setReminders(res.reminders ?? []);
      setInfo(""); 
    } catch (err) {
      console.error("Fetch reminders error:", err);
      setInfo("Error fetching reminders: " + err.message);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/api/reminders/stats");
      setStats(res.stats || { total: 0, pending: 0, sent: 0, overdue: 0 });
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchReminders();
      fetchStats();
    }
  }, [open]);

  const computeSendAt = () => {
    const now = Date.now();
    let ms = 0;
    switch (preset) {
      case "1hour":
        ms = 1 * 60 * 60 * 1000;
        break;
      case "6hours":
        ms = 6 * 60 * 60 * 1000;
        break;
      case "1day":
        ms = 1 * 24 * 60 * 60 * 1000;
        break;
      case "2day":
        ms = 2 * 24 * 60 * 60 * 1000;
        break;
      case "3day":
        ms = 3 * 24 * 60 * 60 * 1000;
        break;
      case "1week":
        ms = 7 * 24 * 60 * 60 * 1000;
        break;
      case "custom":
        if (!customISO) return null;
        return new Date(customISO).toISOString();
      default:
        ms = 0;
    }
    return new Date(now + ms).toISOString();
  };

  const validateInput = () => {
    if (!message.trim()) {
      setInfo(t("reminder.messageRequired", "Please enter a message"));
      return false;
    }

    if (message.length > 500) {
      setInfo(t("reminder.messageTooLong", "Message must be 500 characters or less"));
      return false;
    }

    const sendAt = computeSendAt();
    if (!sendAt) {
      setInfo(t("reminder.invalidDate", "Please choose a valid date/time for custom option."));
      return false;
    }

    const sendDate = new Date(sendAt);
    if (sendDate <= new Date()) {
      setInfo(t("reminder.pastDate", "Please choose a future date/time"));
      return false;
    }

    // Check if too far in the future (1 year)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (sendDate > oneYearFromNow) {
      setInfo(t("reminder.tooFarFuture", "Date cannot be more than 1 year in the future"));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInput()) return;

    const sendAt = computeSendAt();
    setLoading(true);
    setInfo("");
    
    try {
      const res = await API.post("/api/reminders", { 
        message: message.trim(), 
        sendAt 
      });
      
      setInfo(t("reminder.scheduled", "Reminder scheduled!") + " ✅");
      if (onCreated) onCreated(res.reminder);
      
      await fetchReminders();
      await fetchStats();
      
      // Reset form
      setMessage(t("reminder.defaultMessage", "Quick reminder from Maitri"));
      setPreset("1day");
      setCustomISO("");
      
      // Auto-close after success
      setTimeout(() => setOpen(false), 1500);
      
    } catch (err) {
      console.error("Error creating reminder:", err);
      setInfo("Error: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm(t("reminder.confirmCancel", "Are you sure you want to cancel this reminder?"))) {
      return;
    }

    try {
      await API.delete(`/api/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r._id !== id));
      setInfo(t("reminder.cancelled", "Reminder cancelled"));
      await fetchStats();
    } catch (err) {
      console.error("Error cancelling reminder:", err);
      setInfo("Error: " + (err.message || "Unknown error"));
    }
  };

  const getStatusBadge = (reminder) => {
    if (reminder.sent) {
      return <span className="reminder-status-badge sent">✓ Sent</span>;
    } else if (reminder.isOverdue) {
      return <span className="reminder-status-badge overdue">⚠ Overdue</span>;
    } else {
      return <span className="reminder-status-badge pending">⏳ Pending</span>;
    }
  };

  const formatTimeUntil = (sendAt) => {
    const now = new Date();
    const sendDate = new Date(sendAt);
    const diffMs = sendDate - now;
    
    if (diffMs <= 0) return "Now";
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  if (typeof document === "undefined") return null;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="reminder-modal-overlay"
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            className="reminder-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="reminder-header">
              <h3>{t("reminder.title", "Reminders")}</h3>
              <div className="reminder-stats">
                <span className="stat-item">
                  <strong>{stats.total}</strong> total
                </span>
                <span className="stat-item">
                  <strong>{stats.pending}</strong> pending
                </span>
                <span className="stat-item">
                  <strong>{stats.overdue}</strong> overdue
                </span>
              </div>
              <button
                className="reminder-close"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <form className="reminder-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t("reminder.message", "Message")}</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("reminder.messagePlaceholder", "Enter your reminder message...")}
                  maxLength={500}
                  required
                />
                <div className="char-count">
                  {message.length}/500
                </div>
              </div>

              <div className="form-group">
                <label>{t("reminder.when", "When")}</label>
                <div className="reminder-options">
                  {["1hour", "6hours", "1day", "2day", "3day", "1week", "custom"].map((p) => (
                    <div className="reminder-radio" key={p}>
                      <input
                        type="radio"
                        name="preset"
                        id={p}
                        checked={preset === p}
                        onChange={() => setPreset(p)}
                      />
                      <label htmlFor={p}>
                        {p === "custom"
                          ? t("reminder.customOption", "Custom date/time")
                          : t(`reminder.${p}`, `In ${p}`)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {preset === "custom" && (
                <div className="form-group">
                  <input
                    type="datetime-local"
                    value={customISO}
                    onChange={(e) => setCustomISO(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="reminder-submit"
                disabled={loading || !message.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    {t("reminder.scheduling", "Scheduling...")}
                  </>
                ) : (
                  t("reminder.schedule", "Schedule Reminder")
                )}
              </button>
            </form>

            {info && (
              <div className={`reminder-info ${info.includes("✅") ? "success" : "error"}`}>
                {info}
              </div>
            )}

            <hr className="reminder-divider" />

            <div className="reminder-list-section">
              <h4>{t("reminder.yourReminders", "Your Reminders")}</h4>
              <div className="reminder-list">
                {reminders.length === 0 ? (
                  <div className="reminder-empty">
                    <p>{t("reminder.empty", "No reminders yet.")}</p>
                    <small>{t("reminder.emptyHint", "Create your first reminder above!")}</small>
                  </div>
                ) : (
                  reminders.map((r) => (
                    <div className="reminder-item" key={r._id}>
                      <div className="reminder-content">
                        <div className="reminder-message">{r.message}</div>
                        <div className="reminder-meta">
                          <span className="reminder-time">
                            {new Date(r.sendAt).toLocaleString()}
                          </span>
                          <span className="reminder-countdown">
                            {formatTimeUntil(r.sendAt)}
                          </span>
                        </div>
                      </div>
                      <div className="reminder-actions">
                        {getStatusBadge(r)}
                        {!r.sent && (
                          <button
                            className="reminder-cancel"
                            onClick={() => handleCancel(r._id)}
                            title={t("reminder.cancel", "Cancel")}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        className="reminder-bell-btn"
        onClick={() => setOpen(true)}
        title={t("reminder.manage", "Manage reminders")}
      >
        🔔
        {stats.overdue > 0 && <span className="reminder-badge">{stats.overdue}</span>}
      </button>

      {ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
}
