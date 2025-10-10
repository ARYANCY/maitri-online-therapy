import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Global response interceptor
API.interceptors.response.use(
  response => response.data,
  error => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Unknown error";
    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
API.auth = {
  login: data => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  register: data => API.post("/auth/register", data),
  checkSession: () => API.get("/api/session-check"),
};

// Dashboard endpoints
API.dashboard = {
  get: (type = "entries") => API.get(`/api/dashboard?type=${type}`),
  getTasks: () => API.get("/api/dashboard/tasks"),
  updateTasks: tasks => {
    if (!Array.isArray(tasks)) return Promise.reject(new Error("Tasks must be an array"));
    return API.put("/api/dashboard/tasks", { tasks });
  },
};

// Therapist endpoints
API.therapist = {
  apply: data => API.post("/api/therapists/apply", data),       // public
  getAll: () => API.get("/api/therapists"),                    // admin only
  getAccepted: () => API.get("/api/therapists/accepted"),      // public
  updateStatus: (id, status) => API.patch(`/api/therapists/${id}/status`, { status }), // admin only
  delete: id => API.delete(`/api/therapists/${id}`),          // admin only
};

// Reminder endpoints
API.reminder = {
  create: data => API.post("/api/reminders", data),
  list: () => API.get("/api/reminders"),
  cancel: id => API.delete(`/api/reminders/${id}`),
};

export default API;
