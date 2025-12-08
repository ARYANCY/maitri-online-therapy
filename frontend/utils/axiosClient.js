import axios from "axios";

axios.defaults.withCredentials = true;

const pendingRequests = new Map();

const getRequestKey = (method, url, params) => {
  const methodUpper = method?.toUpperCase() || 'GET';
  const paramsStr = params ? '?' + new URLSearchParams(params).toString() : '';
  return `${methodUpper}:${url}${paramsStr}`;
};

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.error('[AxiosClient] VITE_API_URL is not configured. API requests will fail.');
  console.error('[AxiosClient] Current origin:', window.location.origin);
}

// Normalize API_URL - remove trailing /api if present to avoid double /api in routes
// Routes like /api/doch/apply will work correctly with baseURL as domain only
const normalizedBaseURL = API_URL 
  ? (API_URL.endsWith('/api') ? API_URL.slice(0, -4) : (API_URL.endsWith('/api/') ? API_URL.slice(0, -5) : API_URL))
  : '';

const API = axios.create({
  baseURL: normalizedBaseURL || '/api', 
  withCredentials: true, 
  headers: { "Content-Type": "application/json" },
  timeout: 30000, 
});

API.interceptors.request.use((config) => {
  const lang = localStorage.getItem("preferredLang") || "en";
  config.headers = config.headers || {};
  config.headers["Accept-Language"] = lang;
  return config;
});

function sanitizeString(str) {
  return str?.trim() || "";
}

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

API.dementia = {
  submitGameResults: (payload) => API.post("/api/dementia/game-results", payload, {
    timeout: 120000, 
  }),
};

API.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (err) => {
    const { response, config, code, message, request } = err;

    if (!response) {
      if (!API_URL && config?.url) {
        console.error('[AxiosClient] API URL not configured. Request URL:', config.url);
        return Promise.reject(new Error("API configuration error. Please contact support."));
      }

      console.error('[AxiosClient] Network error:', {
        code,
        message,
        url: config?.url,
        baseURL: config?.baseURL,
        fullURL: config?.baseURL ? `${config.baseURL}${config.url}` : config?.url,
        origin: window.location.origin,
        apiUrl: API_URL
      });

      if (code === "ECONNABORTED" || code === "ETIMEDOUT" || message?.includes("timeout")) {
        return Promise.reject(new Error("Request timeout. Please try again."));
      }

      const isLikelyCORS = (
        code === "ERR_CORS" || 
        message?.includes("CORS") || 
        message?.includes("cross-origin") ||
        message?.includes("Access-Control") ||
        (code === "ERR_NETWORK" && 
         (message?.includes("Failed to fetch") || 
          message === "Network Error")) ||
        (code === undefined && message?.includes("Failed to fetch"))
      );
      
      if (isLikelyCORS) {
        console.error('[AxiosClient] CORS error detected:', {
          origin: window.location.origin,
          apiUrl: API_URL,
          url: config?.url,
          message: 'Frontend origin may not be allowed by backend CORS configuration'
        });
        return Promise.reject(new Error(
          `CORS error: ${window.location.origin} is not allowed to access ${API_URL}. ` +
          "Please check backend CORS configuration."
        ));
      }

      if (code === "ERR_NETWORK" || 
          code === "ERR_INTERNET_DISCONNECTED" ||
          message?.includes("Network Error") ||
          message?.includes("Network request failed")) {
        return Promise.reject(new Error("Network error. Please check your internet connection."));
      }

      if (code === "ECONNREFUSED" || message?.includes("refused") || message?.includes("unreachable")) {
        return Promise.reject(new Error("Cannot connect to server. Please try again later."));
      }

      return Promise.reject(new Error(message || "Connection error. Please try again."));
    }

    if (config?.url?.includes("/auth/session-check")) {
      const body = response?.data ?? { success: false, user: null, message: "No active session" };
      return body;
    }

    if (response.status === 401 && config?.url?.includes("/admin")) {
      clearAdminSession();
    }

    if (response.status === 401) {
      clearUserSession(true);
    }

    const errorMessage = response?.data?.error || 
                        response?.data?.message || 
                        message || 
                        `Server error (${response.status})`;

    const enhancedError = new Error(errorMessage);
    enhancedError.status = response.status;
    enhancedError.statusText = response.statusText;
    enhancedError.data = response.data;
    enhancedError.url = config?.url;

    return Promise.reject(enhancedError);
  }
);

import { 
  storeUserSession, 
  clearUserSession, 
  storeAdminSession, 
  clearAdminSession 
} from './session';

export async function ensureAdminSession() {
  try {
    const session = await API.get("/auth/session-check");
    if (!session?.user?.isAdmin) throw new Error("Not an admin");

    storeUserSession(session.user, session.sessionInfo);

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
    storeAdminSession(adminSession);

    return session.user;
  } catch (error) {
    console.error('[AdminSession] Failed to ensure admin session:', error);
    clearUserSession(true); 
    return null;
  }
}

API.auth = {
  login: (data) => API.post("/auth/login", data),
  logout: async () => {
    try {
      await API.get("/auth/logout");
    } catch (error) {
      console.error('[Auth] Logout request failed:', error);
    } finally {
      clearUserSession(true);
    }
  },
  register: (data) => API.post("/auth/register", data),
  testCookie: () => API.get("/auth/cookie-test"),
  cookieDebug: () => API.get("/auth/cookie-debug"),
  checkSession: () => {
    const requestKey = getRequestKey('GET', '/auth/session-check');

    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }
    
    const requestPromise = API.get("/auth/session-check")
      .then(response => {
        pendingRequests.delete(requestKey);
        return response;
      })
      .catch(error => {
        pendingRequests.delete(requestKey);
        throw error;
      });
    
    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },
  adminLogin: async (data) => {
    const response = await API.post("/auth/admin-login", data);
    if (!response?.user?.isAdmin) throw new Error("Not an admin");

    storeUserSession(response.user, response.sessionInfo);

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
    storeAdminSession(adminSession);

    await ensureAdminSession();
    return response;
  },
  ensureAdminSession,
  updateLanguage: (language) => API.post("/auth/update-language", { language }),
};

function validateDOCTData(data) {
  if (!data || typeof data !== "object") throw new Error("DOCT data must be an object");

  const fullName = sanitizeString(data.fullName || data.name);
  const email = sanitizeString(data.email).toLowerCase();
  const yearsOfPractice = Number(data.yearsOfPractice || data.experience);
  const availability = Array.isArray(data.availability) ? data.availability : [];

  if (!fullName || fullName.length < 3) throw new Error("Name must be at least 3 characters");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email format");
  if (isNaN(yearsOfPractice) || yearsOfPractice < 0) throw new Error("Years of practice must be non-negative");

  return { 
    ...data,
    fullName, 
    email, 
    yearsOfPractice,
    availability,
    name: fullName,
    experience: yearsOfPractice,
    specialization: data.specializations?.[0] || data.specialization || ""
  };
}

API.doct = {
  apply: (data) => {
    const validData = validateDOCTData(data);
    return API.post("/api/doct/apply", validData);
  },
  getAccepted: () => API.get("/api/doct/accepted"),
  getMyProfile: () => API.get("/api/doct/my-profile"),
  createAppointment: (data) => API.post("/api/doct/appointments", data),
  getAppointments: () => API.get("/api/doct/appointments"),
  updateAppointmentStatus: (appointmentId, status, message = "") => API.patch(`/api/doct/appointments/${appointmentId}/status`, { status, message }),
};

API.adminDOCT = {
  getAll: async () => {
    await ensureAdminSession();
    return API.get("/api/admin/doct");
  },
  getAccepted: async () => {
    await ensureAdminSession();
    return API.get("/api/doct/accepted");
  },
  update: async (id, data) => {
    await ensureAdminSession();
    return API.put(`/api/admin/doct/${id}`, data);
  },
  updateStatus: async (id, status) => {
    await ensureAdminSession();
    return API.patch(`/api/admin/doct/${id}/status`, { status });
  },
  updateBulkStatus: async (ids = [], status) => {
    await ensureAdminSession();
    return API.patch(`/api/admin/doct/bulk/status`, { ids, status });
  },
  delete: async (id) => {
    await ensureAdminSession();
    return API.delete(`/api/admin/doct/${id}`);
  },
};

API.doch = {
  getAll: () => API.get("/api/doch"),
  apply: (data) => API.post("/api/doch/apply", data),
  getMyProfile: () => API.get("/api/doch/my-profile"),
  createAppointment: (data) => API.post("/api/doch/appointments", data),
  getAppointments: () => API.get("/api/doch/appointments"),
  updateAppointmentStatus: (appointmentId, status, message = "") => API.patch(`/api/doch/appointments/${appointmentId}/status`, { status, message }),
};

API.adminDOCH = {
  getAll: async () => {
    await ensureAdminSession();
    return API.get("/api/admin/doch");
  },
  getById: async (id) => {
    await ensureAdminSession();
    return API.get(`/api/admin/doch/${id}`);
  },
  update: async (id, data) => {
    await ensureAdminSession();
    return API.put(`/api/admin/doch/${id}`, data);
  },
  updateStatus: async (id, status) => {
    await ensureAdminSession();
    return API.patch(`/api/admin/doch/${id}/status`, { status });
  },
  delete: async (id) => {
    await ensureAdminSession();
    return API.delete(`/api/admin/doch/${id}`);
  },
};

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

API.upload = {
  profilePhoto: (formData) => API.post("/api/upload/profile-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  certificates: (formData) => API.post("/api/upload/certificates", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  deleteFile: (publicId, resourceType = "image") => API.delete(`/api/upload/file/${publicId}?resourceType=${resourceType}`),
};

API.notifications = {
  getAll: () => API.get("/api/notifications"),
  getUnreadCount: () => API.get("/api/notifications/unread-count"),
  markAsRead: (id) => API.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => API.patch("/api/notifications/mark-all-read"),
  delete: (id) => API.delete(`/api/notifications/${id}`),
};

API.chatbot = {
  get: () => API.get("/api/chatbot"),
  send: (message) => API.post("/api/chatbot", { message }, {
    timeout: 60000,
  }),
};

export default API;
