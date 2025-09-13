import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000", // default fallback
  withCredentials: true, // important for sessions/cookies
});

// Optional: helper methods for /auth routes
API.auth = {
  login: (data) => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  register: (data) => API.post("/auth/register", data),
  checkSession: () => API.get("/auth/session-check"),
};

// Optional: helper for dashboard endpoints
API.dashboard = {
  get: (type = "entries") => API.get(`/dashboard?type=${type}`),
  getTasks: () => API.get("/dashboard/tasks"),
  updateTasks: (tasks) => API.put("/dashboard/tasks", { tasks }),
};

export default API;
