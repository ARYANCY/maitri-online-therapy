import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && error.config?.url?.includes("/admin")) {
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
    }
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    return Promise.reject(new Error(message));
  }
);

API.auth = {
  login: (data) => API.post("/auth/login", data),
  logout: async () => {
    const res = await API.get("/auth/logout");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    return res;
  },
  register: (data) => API.post("/auth/register", data),
  checkSession: () => API.get("/auth/session-check"),
  adminLogin: (data) => API.post("/auth/admin-login", data),
  googleLogin: () => API.get("/auth/google"),
  googleCallback: () => API.get("/auth/google/callback"),
};

API.dashboard = {
  get: (type = "entries") => API.get(`/api/dashboard?type=${type}`),
  getTasks: () => API.get("/api/dashboard/tasks"),
  updateTasks: (tasks) => {
    if (!Array.isArray(tasks)) return Promise.reject(new Error("Tasks must be an array"));
    return API.put("/api/dashboard/tasks", { tasks });
  },
};

API.therapist = {
  apply: (data) => API.post("/api/therapists/apply", data),
  getAccepted: () => API.get("/api/therapists/accepted"),
};

API.adminTherapist = {
  getAll: async () => {
    await ensureAdminSession();
    return API.get("/api/admin/therapists");
  },
  updateStatus: async (id, status) => {
    if (!id || !status) return Promise.reject(new Error("ID and status are required"));
    await ensureAdminSession();
    return API.patch(`/api/admin/therapists/${id}/status`, { status });
  },
  delete: async (id) => {
    if (!id) return Promise.reject(new Error("ID is required"));
    await ensureAdminSession();
    return API.delete(`/api/admin/therapists/${id}`);
  },
};

API.reminder = {
  create: (data) => API.post("/api/reminders", data),
  list: () => API.get("/api/reminders"),
  cancel: (id) => {
    if (!id) return Promise.reject(new Error("Reminder ID is required"));
    return API.delete(`/api/reminders/${id}`);
  },
};

async function ensureAdminSession() {
  const localIsAdmin = localStorage.getItem("isAdmin") === "true";
  if (localIsAdmin) return;
  try {
    const session = await API.auth.checkSession();
    if (!session?.user?.isAdmin) {
      ["isAdmin", "adminEmail", "userId", "userName"].forEach((k) => localStorage.removeItem(k));
      return Promise.reject(new Error("Admin session invalid or expired."));
    }
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("adminEmail", session.user.email || "");
    localStorage.setItem("userId", session.user._id || "");
    localStorage.setItem("userName", session.user.name || "");
  } catch {
    ["isAdmin", "adminEmail", "userId", "userName"].forEach((k) => localStorage.removeItem(k));
    return Promise.reject(new Error("Admin session invalid or expired."));
  }
}

export default API;
