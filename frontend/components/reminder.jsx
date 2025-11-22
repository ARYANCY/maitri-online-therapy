import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../utils/axiosClient";
import "../css/reminder.css";

// Local error boundary to prevent a full blank screen if DatePicker crashes
class RemountBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("Reminder UI crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// REMINDER_UI_CONFIG will be created inside component to use translations

// Helper function to format date for datetime-local input
const formatDateForInput = (date) => {
  if (!date || !(date instanceof Date)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to format date for date input
const formatDateOnlyForInput = (date) => {
  if (!date || !(date instanceof Date)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

// Helper function to parse datetime-local input
const parseDateTimeInput = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

// Helper function to format date for display
const formatDateForDisplay = (date) => {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function Reminder() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [message, setMessage] = useState(localStorage.getItem("reminderMessage") || "");
  const [email, setEmail] = useState(localStorage.getItem("reminderEmail") || "");
  
  const REMINDER_UI_CONFIG = {
    quickAdd: {
      enabled: true,
      placeholder: t("reminder.quickAddPlaceholder"),
      defaultRepeat: "daily",
      predefinedMessages: [
        t("reminder.predefinedMessages.takeMedicine"),
        t("reminder.predefinedMessages.doctorAppointment"),
        t("reminder.predefinedMessages.exercise"),
        t("reminder.predefinedMessages.drinkWater")
      ],
    },
    stats: {
      enabled: true,
      display: [
        { type: "totalReminders", label: t("reminder.totalReminders") },
        { type: "dailyCount", label: t("reminder.dailyReminders") },
        { type: "weeklyCount", label: t("reminder.weeklyReminders") },
        { type: "monthlyCount", label: t("reminder.monthlyReminders") },
        { type: "nextReminder", label: t("reminder.nextReminder"), limit: 1 },
      ],
    },
    filterSearch: {
      enabled: true,
      filters: [
        { type: "repeat", label: "Repeat Type", options: ["daily", "weekly", "monthly"] },
        { type: "email", label: t("reminder.byEmail") },
        { type: "message", label: t("reminder.byMessage") },
      ],
      searchPlaceholder: t("reminder.searchPlaceholder"),
    },
  };
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    // Round to nearest 5 minutes
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
  });
  const [repeat, setRepeat] = useState("none");
  const [customInterval, setCustomInterval] = useState(1);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState("");
  const [useNativeInput, setUseNativeInput] = useState(false);
  const [datePickerError, setDatePickerError] = useState(false);
  
  // Quick Add
  const [quickAddMessage, setQuickAddMessage] = useState("");
  const [quickAddRepeat, setQuickAddRepeat] = useState(REMINDER_UI_CONFIG.quickAdd.defaultRepeat);
  
  // Filters & search
  const [filterRepeat, setFilterRepeat] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterMessage, setFilterMessage] = useState("");

  // Refs for date inputs
  const dateTimeInputRef = useRef(null);
  const endDateInputRef = useRef(null);

  // Detect if we should use native input (mobile or if DatePicker fails)
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const prefersNative = window.matchMedia("(max-width: 768px)").matches;
    setUseNativeInput(isMobile || prefersNative || datePickerError);
  }, [datePickerError]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const items = await API.reminder.getAll();
      setReminders(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    setSelectedPreview(formatDateForDisplay(dateTime));
  }, [dateTime]);

  const handleDateTimeChange = (value) => {
    try {
      if (value instanceof Date) {
        setDateTime(value);
        setDatePickerError(false);
      } else if (typeof value === "string") {
        const parsed = parseDateTimeInput(value);
        if (parsed) {
          setDateTime(parsed);
          setDatePickerError(false);
        }
      } else if (value === null || value === undefined) {
        // Keep current date if cleared
        return;
      }
    } catch (error) {
      console.error("Error parsing date:", error);
      setDatePickerError(true);
    }
  };

  const handleEndDateChange = (value) => {
    try {
      if (value instanceof Date) {
        setEndDate(value);
      } else if (typeof value === "string") {
        if (value) {
          const parsed = new Date(value);
          setEndDate(isNaN(parsed.getTime()) ? null : parsed);
        } else {
          setEndDate(null);
        }
      } else if (value === null) {
        setEndDate(null);
      }
    } catch (error) {
      console.error("Error parsing end date:", error);
      setEndDate(null);
    }
  };

  const addReminder = async () => {
    if (!message.trim() || !email.trim() || !dateTime) {
      alert(t("reminder.allFieldsRequired"));
      return;
    }
    
    if (!(dateTime instanceof Date) || isNaN(dateTime.getTime())) {
      alert(t("reminder.validDateTimeRequired"));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        message: message.trim(),
        email: email.trim(),
        dateTime,
        repeat,
        customInterval: repeat === "custom" ? Number(customInterval) || 1 : null,
        endDate,
      };

      const created = await API.reminder.add(payload);
      setReminders(prev => [...prev, created]);

      localStorage.setItem("reminderMessage", message);
      localStorage.setItem("reminderEmail", email);

      setMessage("");
      setEmail("");
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
      now.setSeconds(0);
      now.setMilliseconds(0);
      setDateTime(now);
      setRepeat("none");
      setCustomInterval(1);
      setEndDate(null);
      setSelectedPreview("");
    } catch (err) {
      console.error(err);
      alert(err.message || t("reminder.failedToAdd"));
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm(t("reminder.confirmDelete"))) return;
    try {
      await API.reminder.delete(id);
      setReminders(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
      alert(t("reminder.failedToDelete"));
    }
  };

  const handleQuickAdd = async () => {
    const msg = quickAddMessage.trim();
    if (!msg || !email.trim()) {
      alert(t("reminder.quickAddRequired"));
      return;
    }
    
    const now = new Date();
    const payload = {
      message: msg,
      email: email.trim(),
      dateTime: now,
      repeat: quickAddRepeat,
      customInterval: quickAddRepeat === "custom" ? Number(customInterval) || 1 : null,
      endDate,
    };
    
    try {
      const created = await API.reminder.add(payload);
      setReminders((prev) => [...prev, created]);
      setQuickAddMessage("");
    } catch (err) {
      console.error(err);
      alert(err.message || t("reminder.failedQuickAdd"));
    }
  };

  const filteredReminders = reminders.filter((r) => {
    let ok = true;
    if (filterRepeat) ok = ok && r.repeat === filterRepeat;
    if (filterEmail) ok = ok && r.email.toLowerCase().includes(filterEmail.toLowerCase());
    if (filterMessage) ok = ok && r.message.toLowerCase().includes(filterMessage.toLowerCase());
    return ok;
  });

  const stats = (() => {
    const total = reminders.length;
    const daily = reminders.filter((r) => r.repeat === "daily").length;
    const weekly = reminders.filter((r) => r.repeat === "weekly").length;
    const monthly = reminders.filter((r) => r.repeat === "monthly").length;
    const next = reminders
      .filter((r) => new Date(r.nextRunAt || r.dateTime) > new Date())
      .sort((a, b) => new Date(a.nextRunAt || a.dateTime) - new Date(b.nextRunAt || b.dateTime))[0] || null;
    return { total, daily, weekly, monthly, next };
  })();

  return (
    <div className="reminder-wrapper">
      {/* Quick Add */}
      {REMINDER_UI_CONFIG.quickAdd.enabled && (
        <div className="reminder-form" style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder={REMINDER_UI_CONFIG.quickAdd.placeholder}
            value={quickAddMessage}
            onChange={(e) => setQuickAddMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleQuickAdd()}
          />
          <select 
            value={quickAddRepeat} 
            onChange={(e) => setQuickAddRepeat(e.target.value)}
            style={{ flex: "0 0 auto", minWidth: "150px" }}
          >
            <option value="daily">{t("reminder.repeat.daily")}</option>
            <option value="weekly">{t("reminder.repeat.weekly")}</option>
            <option value="monthly">{t("reminder.repeat.monthly")}</option>
            <option value="none">{t("reminder.repeat.none")}</option>
            <option value="custom">{t("reminder.repeat.custom")}</option>
          </select>
          <button className="btn-add" onClick={handleQuickAdd} disabled={loading}>
            {t("reminder.addQuickReminder")}
          </button>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", width: "100%" }}>
            {REMINDER_UI_CONFIG.quickAdd.predefinedMessages.map((m) => (
              <button
                key={m}
                type="button"
                className="btn-add"
                onClick={() => setQuickAddMessage(m)}
                style={{ background: "#eee", color: "#333", flex: "0 0 auto" }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Add Form */}
      <div className="reminder-form">
        <input
          type="text"
          placeholder={localStorage.getItem("reminderMessage") || t("reminder.reminderMessagePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addReminder()}
        />
        <input
          type="email"
          placeholder={localStorage.getItem("reminderEmail") || t("reminder.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addReminder()}
        />
        
        {/* Date & Time Picker */}
        <div className="date-time-wrapper">
          {useNativeInput ? (
            <input
              ref={dateTimeInputRef}
              type="datetime-local"
              value={formatDateForInput(dateTime)}
              onChange={(e) => handleDateTimeChange(e.target.value)}
              className="datepicker-input"
              min={formatDateForInput(new Date())}
            />
          ) : (
            <RemountBoundary
              fallback={
                <input
                  ref={dateTimeInputRef}
                  type="datetime-local"
                  value={formatDateForInput(dateTime)}
                  onChange={(e) => handleDateTimeChange(e.target.value)}
                  className="datepicker-input"
                  min={formatDateForInput(new Date())}
                />
              }
            >
              <DatePicker
                selected={dateTime}
                onChange={handleDateTimeChange}
                showTimeSelect
                timeIntervals={5}
                timeCaption={t("reminder.time")}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText={t("reminder.selectDateTime")}
                className="datepicker-input"
                minDate={new Date()}
                popperClassName="datepicker-popper"
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [0, 8],
                    },
                  },
                ]}
                popperPlacement="bottom-start"
              />
            </RemountBoundary>
          )}
        </div>

        <select 
          value={repeat} 
          onChange={(e) => setRepeat(e.target.value)}
          style={{ flex: "0 0 auto", minWidth: "150px" }}
        >
          <option value="none">{t("reminder.repeat.none")}</option>
          <option value="daily">{t("reminder.repeat.daily")}</option>
          <option value="weekly">{t("reminder.repeat.weekly")}</option>
          <option value="monthly">{t("reminder.repeat.monthly")}</option>
          <option value="custom">{t("reminder.repeat.custom")}</option>
        </select>
        
        {repeat === "custom" && (
          <input
            type="number"
            min={1}
            placeholder={t("reminder.repeat.custom")}
            value={customInterval}
            onChange={(e) => setCustomInterval(e.target.value)}
            style={{ flex: "0 0 auto", minWidth: "120px" }}
          />
        )}
        
        {/* End Date Picker */}
        <div className="date-time-wrapper">
          {useNativeInput ? (
            <input
              ref={endDateInputRef}
              type="date"
              value={endDate ? formatDateOnlyForInput(endDate) : ""}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="datepicker-input"
              min={formatDateOnlyForInput(new Date())}
            />
          ) : (
            <RemountBoundary
              fallback={
                <input
                  ref={endDateInputRef}
                  type="date"
                  value={endDate ? formatDateOnlyForInput(endDate) : ""}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="datepicker-input"
                  min={formatDateOnlyForInput(new Date())}
                />
              }
            >
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                placeholderText={t("reminder.optionalEndDate")}
                dateFormat="yyyy-MM-dd"
                className="datepicker-input"
                isClearable
                minDate={new Date()}
                popperClassName="datepicker-popper"
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [0, 8],
                    },
                  },
                ]}
                popperPlacement="bottom-start"
              />
            </RemountBoundary>
          )}
        </div>
        
        <div className="selected-preview">{t("reminder.selected")} {selectedPreview || "—"}</div>
        <button className="btn-add" onClick={addReminder} disabled={loading}>
          {loading ? t("reminder.processing") : t("reminder.addReminder")}
        </button>
      </div>

      {/* Stats */}
      {REMINDER_UI_CONFIG.stats.enabled && (
        <section className="reminder-benefits" style={{ marginTop: "1rem" }}>
          <h2>{t("reminder.stats")}</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {REMINDER_UI_CONFIG.stats.display.map((item) => {
              let value = "";
              if (item.type === "totalReminders") value = String(stats.total);
              if (item.type === "dailyCount") value = String(stats.daily);
              if (item.type === "weeklyCount") value = String(stats.weekly);
              if (item.type === "monthlyCount") value = String(stats.monthly);
              if (item.type === "nextReminder")
                value = stats.next
                  ? `${new Date(stats.next.nextRunAt || stats.next.dateTime).toLocaleString()} - ${stats.next.message}`
                  : t("reminder.none");
              return (
                <div key={item.type} className="reminder-card" style={{ flex: "1 1 200px" }}>
                  <h2>{item.label}</h2>
                  <p>{value}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter & Search */}
      {REMINDER_UI_CONFIG.filterSearch.enabled && (
        <div className="reminder-form" style={{ marginTop: "1rem" }}>
          <select 
            value={filterRepeat} 
            onChange={(e) => setFilterRepeat(e.target.value)}
            style={{ flex: "0 0 auto", minWidth: "150px" }}
          >
            <option value="">{t("reminder.allRepeats")}</option>
            {REMINDER_UI_CONFIG.filterSearch.filters[0].options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder={REMINDER_UI_CONFIG.filterSearch.filters[1].label}
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder={REMINDER_UI_CONFIG.filterSearch.searchPlaceholder}
            value={filterMessage}
            onChange={(e) => setFilterMessage(e.target.value)}
          />
        </div>
      )}

      {/* Reminder List */}
      <section className="reminder-list">
        {filteredReminders.length ? filteredReminders.map((r) => (
          <article key={r._id} className="reminder-card">
            <h2>{r.message}</h2>
            <p><strong>{t("reminder.emailLabel")}</strong> {r.email}</p>
            <p><strong>{t("reminder.dateTimeLabel")}</strong> {new Date(r.nextRunAt || r.dateTime).toLocaleString()}</p>
            <p><strong>{t("reminder.repeatLabel")}</strong> {r.repeat}</p>
            {r.customInterval ? <p><strong>{t("reminder.intervalLabel")}</strong> {r.customInterval} day(s)</p> : null}
            {r.endDate ? <p><strong>{t("reminder.endsLabel")}</strong> {new Date(r.endDate).toLocaleDateString()}</p> : null}
            <p><strong>{t("reminder.statusLabel")}</strong> {r.status}</p>
            <button className="btn-delete" onClick={() => deleteReminder(r._id)}>{t("reminder.delete")}</button>
          </article>
        )) : (
          <p className="no-reminders">{loading ? t("reminder.loadingReminders") : t("reminder.noReminders")}</p>
        )}
      </section>

      {/* Benefits section */}
      <section className="reminder-benefits">
        <h2>{t("reminder.benefitsTitle")}</h2>
        <p>{t("reminder.benefitsText1")}</p>
        <p>{t("reminder.benefitsText2")}</p>
      </section>
    </div>
  );
}
