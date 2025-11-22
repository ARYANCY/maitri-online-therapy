import axios from "axios";

// --- Axios Instance ---
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Inject Accept-Language on every request from preferredLang
API.interceptors.request.use((config) => {
  const lang = localStorage.getItem("preferredLang") || "en";
  config.headers = config.headers || {};
  config.headers["Accept-Language"] = lang;
  return config;
});

// --- Helper: sanitize input ---
function sanitizeString(str) {
  return str?.trim() || "";
}

// --- Helper: Create next date for schedules ---
function createNextDate({ dayOfWeek, dayOfMonth, time }) {
  const date = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);

  if (dayOfWeek !== undefined) {
    date.setDate(date.getDate() + ((dayOfWeek + 7 - date.getDay()) % 7));
  } else if (dayOfMonth !== undefined) {
    date.setDate(dayOfMonth);
  }

  return date;
}

// --- Reminder Validation ---
function validateReminderData(data) {
  if (!data || typeof data !== "object") throw new Error("Reminder data must be an object");

  const message = (data.message || "").trim();
  const email = (data.email || "").trim();
  const dateTime = new Date(data.dateTime);
  const repeat = data.repeat || "none";
  const customInterval = Number(data.customInterval) || null;
  const endDate = data.endDate ? new Date(data.endDate) : null;

  if (!message) throw new Error("Reminder message is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email format");
  if (isNaN(dateTime.getTime())) throw new Error("Invalid date/time");

  return { message, email, dateTime, repeat, customInterval, endDate };
}

// --- Local time helpers ---
function toLocalISOString(d) {
  const dt = new Date(d);
  const ms = dt.getTime() - dt.getTimezoneOffset() * 60000;
  return new Date(ms).toISOString();
}

// --- Reminder API ---
API.reminder = {
  add: (data) => {
    const validData = validateReminderData(data);
    const payload = {
      message: validData.message,
      email: validData.email,
      dateTime: toLocalISOString(validData.dateTime),
      repeat: validData.repeat,
      customInterval: validData.customInterval,
      endDate: validData.endDate ? toLocalISOString(validData.endDate) : null,
    };
    return API.post("/api/reminders/add", payload).then((d) => d?.reminder ?? d);
  },
  getAll: async () => {
    const res = await API.get("/api/reminders");
    const items = res?.reminders || [];
    return items.sort((a, b) => {
      const aTime = new Date(a.nextRunAt || a.dateTime).getTime();
      const bTime = new Date(b.nextRunAt || b.dateTime).getTime();
      return aTime - bTime;
    });
  },
  update: (id, data) => {
    const validData = validateReminderData(data);
    const payload = {
      message: validData.message,
      email: validData.email,
      dateTime: toLocalISOString(validData.dateTime),
      repeat: validData.repeat,
      customInterval: validData.customInterval,
      endDate: validData.endDate ? toLocalISOString(validData.endDate) : null,
    };
    return API.put(`/api/reminders/${id}`, payload).then((d) => d?.reminder ?? d);
  },
  delete: (id) => API.delete(`/api/reminders/${id}`).then((d) => d?.message ?? d),
  deleteBulk: (ids = []) => {
    if (!Array.isArray(ids) || !ids.length) throw new Error("IDs array required");
    return API.delete("/api/reminders/bulk", { data: { ids } });
  },
  updateBulk: (reminders = []) => {
    if (!Array.isArray(reminders) || !reminders.length) throw new Error("Reminders array required");
    const validData = reminders.map(validateReminderData);
    return API.put("/api/reminders/bulk", validData);
  },
  scheduleDaily: (message, email, time) =>
    API.reminder.add({
      message,
      email,
      dateTime: createNextDate({ time }),
      repeat: "daily",
    }),
  scheduleWeekly: (message, email, dayOfWeek, time) =>
    API.reminder.add({
      message,
      email,
      dateTime: createNextDate({ dayOfWeek, time }),
      repeat: "weekly",
    }),
  scheduleMonthly: (message, email, dayOfMonth, time) =>
    API.reminder.add({
      message,
      email,
      dateTime: createNextDate({ dayOfMonth, time }),
      repeat: "monthly",
    }),
};

// --- Dementia Assessment API ---
API.dementia = {
  getQuestions: (difficulty = "easy") => {
    const d = ["easy","moderate","hard"].includes(String(difficulty).toLowerCase()) ? String(difficulty).toLowerCase() : "easy";
    return API.get(`/api/dementia/questions?difficulty=${encodeURIComponent(d)}`);
  },
  submit: (payload) => API.post("/api/dementia/submit", payload),
  submitGameResults: (payload) => API.post("/api/dementia/game-results", payload),
};

// --- Axios Response Interceptor ---
API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const { response, config } = err;
    if (!response) {
      console.error(`[API Network Error] ${err.message}`);
      return Promise.reject(err);
    }

    // Gracefully handle missing sessions for session-check without throwing
    if (response.status === 401 && config?.url?.includes("/auth/session-check")) {
      const body = response?.data ?? { success: false, user: null, message: "No active session" };
      console.warn("[Session] No active session");
      return body; // resolve with data so callers can branch on success
    }

    // Clear admin flags if admin routes return 401
    if (response.status === 401 && config?.url?.includes("/admin")) {
      ["isAdmin", "adminEmail", "userId", "userName"].forEach((k) => localStorage.removeItem(k));
      console.warn("Admin session expired. Cleared localStorage.");
    }

    const message =
      response?.data?.error || response?.data?.message || err.message || "Unknown API error";
    console.error(`[API Error] ${config?.method?.toUpperCase()} ${config?.url}:`, message);
    return Promise.reject(new Error(message));
  }
);

// --- Admin Session Management ---
export async function ensureAdminSession() {
  try {
    const session = await API.get("/auth/session-check");
    if (!session?.user?.isAdmin) throw new Error("Not an admin");

    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("adminEmail", session.user.email || "");
    localStorage.setItem("userId", session.user._id || "");
    localStorage.setItem("userName", session.user.name || "");

    const adminSession = {
      user: {
        _id: session.user._id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        isAdmin: true,
      },
      verifiedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      status: "active",
    };
    try { localStorage.setItem("admin_session", JSON.stringify(adminSession)); } catch {}

    return session.user;
  } catch {
    ["isAdmin", "adminEmail", "userId", "userName", "admin_session"].forEach((k) => localStorage.removeItem(k));
    return null;
  }
}

// --- Auth API ---
API.auth = {
  login: (data) => API.post("/auth/login", data),
  logout: async () => {
    await API.get("/auth/logout");
    ["isAdmin", "adminEmail", "userId", "userName", "admin_session"].forEach((k) => localStorage.removeItem(k));
  },
  register: (data) => API.post("/auth/register", data),
  checkSession: () => API.get("/auth/session-check"),
  adminLogin: async (data) => {
    const response = await API.post("/auth/admin-login", data);
    if (!response?.user?.isAdmin) throw new Error("Not an admin");

    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("adminEmail", response.user.email || "");
    localStorage.setItem("userId", response.user._id || "");
    localStorage.setItem("userName", response.user.name || "");

    const adminSession = {
      user: {
        _id: response.user._id || "",
        name: response.user.name || "",
        email: response.user.email || "",
        isAdmin: true,
      },
      verifiedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      status: "active",
    };
    try { localStorage.setItem("admin_session", JSON.stringify(adminSession)); } catch {}

    await ensureAdminSession();
    return response;
  },
  ensureAdminSession,
  updateLanguage: (language) => API.post("/auth/update-language", { language }),
};

// --- Therapist Validation ---
function validateTherapistData(data) {
  if (!data || typeof data !== "object") throw new Error("Therapist data must be an object");

  const name = sanitizeString(data.name);
  const email = sanitizeString(data.email).toLowerCase();
  const phone = (data.phone || "").replace(/\D/g, "");
  const specialization = sanitizeString(data.specialization);
  const experience = Number(data.experience);
  const qualifications = sanitizeString(data.qualifications);

  if (!name || name.length < 3) throw new Error("Name must be at least 3 characters");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email format");
  if (!phone || !/^\d{10}$/.test(phone)) throw new Error("Phone must be 10 digits");
  if (!specialization) throw new Error("Specialization is required");
  if (isNaN(experience) || experience < 0) throw new Error("Experience must be non-negative");

  return { name, email, phone, specialization, experience, qualifications };
}

// --- Therapist API ---
API.therapist = {
  apply: (data) => {
    const validData = validateTherapistData(data);
    return API.post("/api/therapists/apply", validData);
  },
  getAccepted: () => API.get("/api/therapists/accepted"),
};

// --- Admin Therapist API ---
API.adminTherapist = {
  getAll: async () => {
    await ensureAdminSession();
    return API.get("/api/admin/therapists");
  },
  getAccepted: async () => {
    await ensureAdminSession();
    return API.get("/api/therapists/accepted");
  },
  updateStatus: async (id, status) => {
    await ensureAdminSession();
    return API.patch(`/api/admin/therapists/${id}/status`, { status });
  },
  updateBulkStatus: async (ids = [], status) => {
    await ensureAdminSession();
    return API.patch(`/api/admin/therapists/bulk/status`, { ids, status });
  },
  delete: async (id) => {
    await ensureAdminSession();
    return API.delete(`/api/admin/therapists/${id}`);
  },
};

// --- Dashboard & Reports API ---
API.dashboard = {
  get: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append("type", params.type);
    if (params.includeChat !== undefined) queryParams.append("includeChat", params.includeChat);
    return API.get(`/api/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);
  },
  getTasks: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.includeChat !== undefined) queryParams.append("includeChat", params.includeChat);
    return API.get(`/api/dashboard/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);
  },
  updateTasks: (tasks, params = {}) => {
    if (!Array.isArray(tasks)) throw new Error("Tasks must be an array");
    const queryParams = new URLSearchParams();
    if (params.preserveChat !== undefined) queryParams.append("preserveChat", params.preserveChat);
    return API.put(`/api/dashboard/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, { tasks });
  },
};

API.report = {
  download: (format = "json") => {
    const isFile = format === "csv" || format === "pdf";
    return API.get(`/api/reports/download?format=${format}`, {
      responseType: isFile ? "blob" : "json",
    });
  },
  fetch: (format = "json") => {
    if (format !== "json") throw new Error("Only JSON format supported");
    return API.get("/api/reports?format=json");
  },
};

export default API;
