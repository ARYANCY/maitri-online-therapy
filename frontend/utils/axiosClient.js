import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // important for sessions/cookies
  headers: { "Content-Type": "application/json" },
});

// Interceptor for response errors
API.interceptors.response.use(
  (response) => response.data, // automatically return `data`
  (error) => {
    const message = error.response?.data?.error || error.message || "Unknown error";
    return Promise.reject(new Error(message));
  }
);

// Auth helpers
API.auth = {
  login: (data) => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  register: (data) => API.post("/auth/register", data),
  checkSession: () => API.get("/auth/session-check"),
};

// Dashboard helpers
API.dashboard = {
  get: (type = "entries") => API.get(`/api/dashboard?type=${type}`),
  getTasks: () => API.get("/api/dashboard/tasks"),
  updateTasks: (tasks) => API.put("/api/dashboard/tasks", { tasks }),
};

export default API;
