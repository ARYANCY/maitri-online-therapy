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

// Existing auth endpoints
API.auth = {
  login: data => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  register: data => API.post("/auth/register", data),
  checkSession: () => API.get("/api/session-check"),
};

// Existing dashboard endpoints
API.dashboard = {
  get: (type = "entries") => API.get(`/api/dashboard?type=${type}`),
  getTasks: () => API.get("/api/dashboard/tasks"),
  updateTasks: tasks => {
    if (!Array.isArray(tasks)) return Promise.reject(new Error("Tasks must be an array"));
    return API.put("/api/dashboard/tasks", { tasks });
  },
};

API.therapist = {
  apply: data => API.post("/therapists/apply", data),          // public
  getAll: () => API.get("/therapists"),                       // admin only
  getAccepted: () => API.get("/therapists/accepted"),         // public
  updateStatus: (id, status) => API.patch(`/therapists/${id}/status`, { status }), // admin only
  delete: id => API.delete(`/therapists/${id}`),             // admin only
};


export default API;
