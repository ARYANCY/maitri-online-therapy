import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- Axios Response Interceptor ---
API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const { response, config } = err;
    if (!response) {
      console.error(`[API Network Error] ${err.message}`);
      return Promise.reject(err);
    }

    // Admin session expired handling
    if (response.status === 401 && config?.url?.includes("/admin")) {
      ["isAdmin", "adminEmail", "userId", "userName"].forEach((k) =>
        localStorage.removeItem(k)
      );
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

    // Save localStorage
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("adminEmail", session.user.email || "");
    localStorage.setItem("userId", session.user._id || "");
    localStorage.setItem("userName", session.user.name || "");

    return session.user;
  } catch {
    ["isAdmin", "adminEmail", "userId", "userName"].forEach((k) =>
      localStorage.removeItem(k)
    );
    return null;
  }
}

// --- Auth API ---
API.auth = {
  login: (data) => API.post("/auth/login", data),
  logout: async () => {
    await API.get("/auth/logout");
    ["isAdmin", "adminEmail", "userId", "userName"].forEach((k) =>
      localStorage.removeItem(k)
    );
  },
  register: (data) => API.post("/auth/register", data),
  checkSession: () => API.get("/auth/session-check"),

  // Admin login with session-first logic
  adminLogin: async (data) => {
    const response = await API.post("/auth/admin-login", data);
    if (!response?.user?.isAdmin) throw new Error("Not an admin");

    // Save localStorage
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("adminEmail", response.user.email || "");
    localStorage.setItem("userId", response.user._id || "");
    localStorage.setItem("userName", response.user.name || "");

    // Ensure backend session cookie is properly registered
    await ensureAdminSession();

    return response;
  },

  ensureAdminSession,
};

// --- Helper: sanitize input ---
function sanitizeString(str) { return str?.trim() || ""; }

// --- Therapist validation ---
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
    if (params.type) queryParams.append('type', params.type);
    if (params.includeChat !== undefined) queryParams.append('includeChat', params.includeChat);
    return API.get(`/api/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },
  getTasks: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.includeChat !== undefined) queryParams.append('includeChat', params.includeChat);
    return API.get(`/api/dashboard/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },
  updateTasks: (tasks, params = {}) => {
    if (!Array.isArray(tasks)) throw new Error("Tasks must be an array");
    const queryParams = new URLSearchParams();
    if (params.preserveChat !== undefined) queryParams.append('preserveChat', params.preserveChat);
    return API.put(`/api/dashboard/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, { tasks });
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
