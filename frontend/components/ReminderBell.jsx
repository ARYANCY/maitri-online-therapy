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
  const [message, setMessage] = useState(t("reminder.defaultMessage", "Quick reminder from Maitri"));
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [reminders, setReminders] = useState([]);

  const fetchReminders = async () => {
    try {
      const res = await API.get("/api/reminders");
      setReminders(res.data.reminders ?? []);
    } catch (err) {
      console.error("Fetch reminders error:", err);
      setInfo(t("reminder.fetchError", "Failed to load reminders"));
    }
  };

  useEffect(() => {
    if (open) fetchReminders();
  }, [open]);

  const computeSendAt = () => {
    const now = Date.now();
    let ms = 0;
    switch (preset) {
      case "1day": ms = 1 * 24 * 60 * 60 * 1000; break;
      case "2day": ms = 2 * 24 * 60 * 60 * 1000; break;
      case "3day": ms = 3 * 24 * 60 * 60 * 1000; break;
      case "1week": ms = 7 * 24 * 60 * 60 * 1000; break;
      case "custom":
        if (!customISO) return null;
        return new Date(customISO).toISOString();
      default: ms = 0;
    }
    return new Date(now + ms).toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sendAt = computeSendAt();
    if (!sendAt) {
      setInfo(t("reminder.invalidDate", "Please choose a valid date/time for custom option."));
      return;
    }

    setLoading(true);
    setInfo("");
    try {
      const res = await API.post("/api/reminders", { message, sendAt });
      setInfo(t("reminder.scheduled", "Reminder scheduled!"));
      if (onCreated) onCreated(res.data.reminder);
      await fetchReminders();
      setOpen(false);
    } catch (err) {
      console.error("Error creating reminder:", err);
      setInfo(err.response?.data?.error || t("reminder.scheduleError", "Failed to schedule reminder"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await API.delete(`/api/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r._id !== id));
      setInfo(t("reminder.cancelled", "Reminder cancelled"));
    } catch (err) {
      console.error("Error cancelling reminder:", err);
      setInfo(err.response?.data?.error || t("reminder.cancelError", "Failed to cancel reminder"));
    }
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="reminder-modal-overlay"
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
              <button className="reminder-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <form className="reminder-form" onSubmit={handleSubmit}>
              <label>{t("reminder.message", "Message")}</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <label>{t("reminder.when", "When")}</label>
              <div className="reminder-options">
                {["1day", "2day", "3day", "1week", "custom"].map((p) => (
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

              {preset === "custom" && (
                <input
                  type="datetime-local"
                  value={customISO}
                  onChange={(e) => setCustomISO(e.target.value)}
                />
              )}

              <button type="submit" className="reminder-submit" disabled={loading}>
                {loading ? t("reminder.scheduling", "Scheduling...") : t("reminder.schedule", "Schedule")}
              </button>
            </form>

            {info && <div className="reminder-info">{info}</div>}

            <hr className="reminder-divider" />

            <ul className="reminder-list">
              {reminders.length === 0 && <li className="reminder-empty">{t("reminder.empty", "No reminders yet.")}</li>}
              {reminders.map((r) => (
                <li className="reminder-item" key={r._id}>
                  <span>{r.message} — <small>{new Date(r.sendAt).toLocaleString()}</small></span>
                  <button className="reminder-cancel" onClick={() => handleCancel(r._id)}>
                    {t("reminder.cancel", "Cancel")}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;

  return (
    <>
      <button
        className="reminder-bell-btn"
        onClick={() => setOpen(true)}
        title={t("reminder.manage", "Manage reminders")}
      >
        🔔
      </button>

      {ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
}
