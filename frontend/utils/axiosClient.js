import axios from "axios";

// Create Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // important for sessions/cookies
  headers: { "Content-Type": "application/json" },
});

// ===== Interceptors =====
// Response interceptor: automatically return `data` or throw clear errors
API.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error 
                 || error.response?.data?.message 
                 || error.message 
                 || "Unknown error";
    return Promise.reject(new Error(message));
  }
);

// ===== Auth API helpers =====
API.auth = {
  login: data => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  register: data => API.post("/auth/register", data),
  checkSession: () => API.get("/api/session-check"),
};

// ===== Dashboard API helpers =====
API.dashboard = {
  // Get dashboard metrics: type can be 'entries' or 'daily'
  get: (type = "entries") => API.get(`/api/dashboard?type=${type}`),

  // Tasks CRUD
  getTasks: () => API.get("/api/dashboard/tasks"),
  updateTasks: tasks => {
    if (!Array.isArray(tasks)) {
      return Promise.reject(new Error("Tasks must be an array"));
    }
    return API.put("/api/dashboard/tasks", { tasks });
  },
};

// ===== Optional: utility to wrap API calls with error handling =====
API.call = async (fn, ...args) => {
  try {
    const result = await fn(...args);
    return result;
  } catch (err) {
    console.error("API call error:", err.message);
    throw err;
  }
};

export default API;
