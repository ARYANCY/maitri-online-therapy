import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.response.use(
  response => response.data,
  error => {
    const { response, config } = error;
    if (response?.status === 401 && config?.url?.includes("/admin")) {
      ["isAdmin", "adminEmail", "userId", "userName"].forEach(key =>
        localStorage.removeItem(key)
      );
      console.warn("Admin session expired or unauthorized. Cleared admin localStorage.");
    }

    const message =
      response?.data?.error ||
      response?.data?.message ||
      error.message ||
      "Unknown error occurred";

    console.error(`[API Error] ${config?.method?.toUpperCase()} ${config?.url}:`, message);

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
    try {
      await ensureAdminSession();
      const response = await API.get("/api/admin/therapists");
      return response.data;
    } catch (err) {
      console.error("Failed to fetch therapists:", err);
      throw new Error(err.response?.data?.message || "Failed to fetch therapists");
    }
  },

  updateStatus: async (id, status) => {
    if (!id || !status) throw new Error("ID and status are required");
    if (!["pending", "accepted", "rejected"].includes(status)) {
      throw new Error("Invalid status value");
    }

    try {
      await ensureAdminSession();
      const response = await API.patch(`/api/admin/therapists/${id}/status`, { status });
      return response.data;
    } catch (err) {
      console.error(`Failed to update therapist status [${id}]:`, err);
      throw new Error(err.response?.data?.message || "Failed to update therapist status");
    }
  },

  delete: async (id) => {
    if (!id) throw new Error("ID is required");

    try {
      await ensureAdminSession();
      const response = await API.delete(`/api/admin/therapists/${id}`);
      return response.data;
    } catch (err) {
      console.error(`Failed to delete therapist [${id}]:`, err);
      throw new Error(err.response?.data?.message || "Failed to delete therapist");
    }
  },

  // Optional: bulk update
  updateBulkStatus: async (ids = [], status) => {
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      throw new Error("IDs array and status are required");
    }
    if (!["pending", "accepted", "rejected"].includes(status)) {
      throw new Error("Invalid status value");
    }

    try {
      await ensureAdminSession();
      const response = await API.patch(`/api/admin/therapists/bulk/status`, { ids, status });
      return response.data;
    } catch (err) {
      console.error("Failed to bulk update therapist statuses:", err);
      throw new Error(err.response?.data?.message || "Failed to bulk update statuses");
    }
  }
};

API.reminder = {
  create: (data) => API.post("/api/reminders", data),
  list: () => API.get("/api/reminders"),
  cancel: (id) => {
    if (!id) return Promise.reject(new Error("Reminder ID is required"));
    return API.delete(`/api/reminders/${id}`);
  },
};

API.report = {
  download: async (format = 'json') => {
    const url = `/api/reports/download?format=${format}`;
    const isFile = format === 'csv' || format === 'pdf';
    const response = await API.get(url, {
      responseType: isFile ? 'blob' : 'json'
    });
    return response;
  },
  fetch: async (format = 'json') => {
    // For fetching report data as JSON (no download)
    if (format !== 'json') throw new Error("fetch only supports JSON format");
    return API.get(`/api/reports?format=json`);
  }
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
