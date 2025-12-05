import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../utils/axiosClient";
import "bootstrap/dist/css/bootstrap.min.css";

const themeStyles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f7f4 0%, #abd1c6 50%, #f0f7f4 100%)',
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)',
    color: '#fffffe',
    borderRadius: '15px 15px 0 0',
  },
  card: {
    border: '2px solid #abd1c6',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0, 70, 67, 0.12)',
    background: '#fffffe',
  },
};

export default function MyAppointments() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState({ user: true, notifications: true });
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchUser = useCallback(async () => {
    try {
      const res = await API.auth.checkSession();
      if (!res?.success || !res?.user) {
        navigate("/");
        return;
      }
      setUser(res.user);
    } catch (err) {
      console.error("Session check failed:", err);
      navigate("/");
    } finally {
      setLoading((prev) => ({ ...prev, user: false }));
    }
  }, [navigate]);

  const fetchNotifications = useCallback(async () => {
    setLoading((prev) => ({ ...prev, notifications: true }));
    setError("");
    try {
      const res = await API.notifications.getAll();
      if (!res?.success) throw new Error(res?.message || "Failed to fetch notifications");
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err?.message || "Failed to load notifications");
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }));
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchUser();
      await fetchNotifications();
    })();
  }, [fetchUser, fetchNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await API.notifications.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await API.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, []);

  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      await API.notifications.delete(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment_accepted":
        return { icon: "bi-check-circle-fill", color: "text-success", bg: "bg-success" };
      case "appointment_rejected":
        return { icon: "bi-x-circle-fill", color: "text-danger", bg: "bg-danger" };
      case "appointment_cancelled":
        return { icon: "bi-exclamation-circle-fill", color: "text-warning", bg: "bg-warning" };
      default:
        return { icon: "bi-info-circle-fill", color: "text-info", bg: "bg-info" };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === "all") return true;
    if (activeFilter === "accepted") return n.type === "appointment_accepted";
    if (activeFilter === "rejected") return n.type === "appointment_rejected";
    if (activeFilter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading.user) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={themeStyles.page}>
      <Navbar user={user} />
      <div className="navbar-spacer" style={{ height: "160px" }}></div>
      <div className="container flex-grow-1 py-4">
        <div className="card" style={themeStyles.card}>
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2" style={themeStyles.cardHeader}>
            <h2 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              {t("appointments.title", "My Appointments & Notifications")}
            </h2>
            {unreadCount > 0 && (
              <button 
                className="btn btn-light btn-sm"
                onClick={handleMarkAllAsRead}
              >
                <i className="bi bi-check-all me-1"></i>
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                ></button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="mb-4">
              <div className="btn-group flex-wrap" role="group">
                <button 
                  className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveFilter('all')}
                >
                  <i className="bi bi-list me-1"></i>
                  All ({notifications.length})
                </button>
                <button 
                  className={`btn ${activeFilter === 'accepted' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setActiveFilter('accepted')}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Accepted
                </button>
                <button 
                  className={`btn ${activeFilter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setActiveFilter('rejected')}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Rejected
                </button>
                <button 
                  className={`btn ${activeFilter === 'unread' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setActiveFilter('unread')}
                >
                  <i className="bi bi-envelope me-1"></i>
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {loading.notifications ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-bell-slash display-1 text-muted"></i>
                <h4 className="mt-3 text-muted">
                  {activeFilter === 'all' 
                    ? t("appointments.noNotifications", "No notifications yet")
                    : `No ${activeFilter} notifications`}
                </h4>
                <p className="text-muted">
                  {t("appointments.noNotificationsDesc", "When you book appointments, updates will appear here.")}
                </p>
                <button 
                  className="btn btn-primary mt-2"
                  onClick={() => navigate("/talk-to-counselor")}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Book an Appointment
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {filteredNotifications.map((notif) => {
                  const { icon, color, bg } = getNotificationIcon(notif.type);
                  return (
                    <div key={notif._id} className="col-12">
                      <div 
                        className={`card ${!notif.isRead ? 'border-primary border-2' : ''}`}
                        style={{ transition: 'all 0.2s' }}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex flex-grow-1">
                              <div className={`rounded-circle ${bg} bg-opacity-10 p-3 me-3 d-flex align-items-center justify-content-center`} style={{ width: '50px', height: '50px' }}>
                                <i className={`bi ${icon} ${color} fs-4`}></i>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-1 flex-wrap gap-2">
                                  <h5 className="mb-0">{notif.title}</h5>
                                  {!notif.isRead && (
                                    <span className="badge bg-primary">NEW</span>
                                  )}
                                  <span className={`badge ${bg} bg-opacity-75`}>
                                    {notif.type === "appointment_accepted" ? "Accepted" :
                                     notif.type === "appointment_rejected" ? "Rejected" :
                                     notif.type === "appointment_cancelled" ? "Cancelled" : "Update"}
                                  </span>
                                </div>
                                <p className="mb-2 text-muted" style={{ whiteSpace: 'pre-line' }}>
                                  {notif.message}
                                </p>
                                <small className="text-muted">
                                  <i className="bi bi-clock me-1"></i>
                                  {new Date(notif.createdAt).toLocaleString()}
                                </small>
                              </div>
                            </div>
                            <div className="d-flex flex-column gap-2 ms-2">
                              {!notif.isRead && (
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleMarkAsRead(notif._id)}
                                  title="Mark as read"
                                >
                                  <i className="bi bi-check2"></i>
                                </button>
                              )}
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteNotification(notif._id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

