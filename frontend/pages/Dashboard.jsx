import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import Chart from "../components/Chart";
import Todo from "../components/Todo";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../utils/axiosClient";
import Game from "./game";
import "../css/pages/Dashboard.css";
import { useTranslation } from "react-i18next";
import { downloadReport } from "../utils/downloadReport";
import bgImage from "@/images/bg.jpg";
import { storeUserSession, clearUserSession, storePreferredLang, getPreferredLang } from "../utils/session";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const reportRef = useRef();

  
  const validTabs = ["chatbot", "chart", "todo", "dementia"];
  
  
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = localStorage.getItem("dashboardActiveTab");
      
      if (savedTab && validTabs.includes(savedTab)) {
        return savedTab;
      }
    } catch (err) {
      console.warn("Failed to load saved tab:", err);
    }
    return "chatbot";
  });
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState({});
  const [chartLabels, setChartLabels] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState({ user: true, dashboard: true, todos: true });
  const [error, setError] = useState({ user: null, dashboard: null, todos: null });
  const [downloading, setDownloading] = useState(false);
  const [showFormatPopup, setShowFormatPopup] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isFetchingRef = useRef(false);
  const notificationRef = useRef(null);
  const lastFetchAtRef = useRef(0);
  const fetchDashboardDataRef = useRef(null);

  const fetchUser = useCallback(async () => {
    try {
      console.log("[SESSION DEBUG] Starting session verification (Dashboard.jsx)...");
      const data = await API.auth.checkSession();
      console.log("[SESSION DEBUG] Session check completed (Dashboard.jsx):", {
        success: data?.success,
        hasUser: !!data?.user,
        userId: data?.user?._id,
        message: data?.message
      });
      
      
      if (!data?.success || !data?.user) {
        
        
        if (data?.success === false) {
          
          if (import.meta.env.DEV) {
            console.log(`[SESSION] No active session (Dashboard.jsx) - expected when not logged in:`, {
              success: data?.success,
              message: data?.message
            });
          }
        } else {
          
          console.error(`[SESSION ERROR] Unexpected session state (Dashboard.jsx):`, {
            success: data?.success,
            hasUser: !!data?.user,
            message: data?.message,
            debug: data?.debug,
            fullResponse: data
          });
        }
        clearUserSession();
        navigate("/");
        return;
      }

      setUser(data.user);

      
      storeUserSession(data.user, data.sessionInfo);

      const prefLang = data.user.preferredLang || getPreferredLang() || "en";
      if (i18n.language !== prefLang) {
        i18n.changeLanguage(prefLang);
      }
      storePreferredLang(prefLang);

      setError(prev => ({ ...prev, user: null }));
    } catch (err) {
      console.error(`[SESSION ERROR] Session check failed (Dashboard.jsx):`, {
        message: err.message,
        name: err.name,
        stack: err.stack,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(prev => ({ ...prev, user: err.message }));
      
      clearUserSession(true);
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, [navigate, i18n]);

  const fetchDashboardData = useCallback(async () => {
    if (!user || isFetchingRef.current) return;

    const now = Date.now();
    if (now - lastFetchAtRef.current < 800) return;
    lastFetchAtRef.current = now;

    isFetchingRef.current = true;
    setLoading(prev => ({ ...prev, dashboard: true, todos: true }));

    try {
      const response = await API.dashboard.get({ includeChat: true });
      const data = response?.data || response; 

      const normalizedChartData = {};
      Object.entries(data.chartData || {}).forEach(([key, val]) => {
        normalizedChartData[key] = Array.isArray(val) ? val : [val];
      });

      setChartData(normalizedChartData);
      setChartLabels(Array.isArray(data.chartLabels) ? data.chartLabels : []);
      setTodos(Array.isArray(data.todos) ? data.todos : []);
      setError(prev => ({ ...prev, dashboard: null }));
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      if (err.message.includes("401")) navigate("/");
      else setError(prev => ({ ...prev, dashboard: err.message || "Failed to fetch dashboard" }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false, todos: false }));
      isFetchingRef.current = false;
    }
  }, [navigate, user]); // Removed 't' to prevent infinite re-renders

  
  useEffect(() => {
    fetchDashboardDataRef.current = fetchDashboardData;
  }, [fetchDashboardData]);

  const handleTodosUpdate = useCallback(async (updatedTodos) => {
    setLoading(prev => ({ ...prev, todos: true }));

    try {
      await API.dashboard.updateTasks(updatedTodos, { preserveChat: true });
      setTodos(updatedTodos);
      setError(prev => ({ ...prev, todos: null }));
    } catch (err) {
      console.error("Failed to update tasks:", err);
      setError(prev => ({ ...prev, todos: err.message || "Todo update failed" }));
    } finally {
      setLoading(prev => ({ ...prev, todos: false }));
    }
  }, []); // Stable callback - no dependencies needed

  const handleDownloadReport = useCallback(async (format = "pdf") => {
    if (!user) return;
    setDownloading(true);

    try {
      await downloadReport(format, user, API);
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setDownloading(false);
    }
  }, [user]);

  
  const handleTabChange = useCallback((tab) => {
    
    if (validTabs.includes(tab)) {
      setActiveTab(tab);
      try {
        localStorage.setItem("dashboardActiveTab", tab);
      } catch (err) {
        console.warn("Failed to save active tab:", err);
      }
    } else {
      console.warn("Invalid tab:", tab);
    }
  }, [validTabs]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        API.notifications.getAll(),
        API.notifications.getUnreadCount()
      ]);
      if (notifRes?.success) {
        setNotifications(notifRes.notifications || []);
      }
      if (countRes?.success) {
        setUnreadCount(countRes.count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await API.notifications.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await API.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
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

  useEffect(() => { 
    if (user && !isFetchingRef.current && fetchDashboardDataRef.current) {
      fetchDashboardDataRef.current();
      fetchNotifications();
    }
  }, [user, fetchNotifications]); 

  useEffect(() => {
    const handler = () => { 
      if (user && !isFetchingRef.current && fetchDashboardDataRef.current) {
        fetchDashboardDataRef.current(); 
      }
    };
    i18n.on("languageChanged", handler);
    return () => i18n.off("languageChanged", handler);
  }, [i18n, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]); 

  const renderContent = () => {
    if (loading.user || loading.dashboard)
      return <p className="text-center py-5">{t("dashboard.loading","Loading...")}</p>;
    if (error.dashboard)
      return <div className="alert alert-danger">{t("dashboard.error","An error occurred")}: {error.dashboard}</div>;

    switch (activeTab) {
      case "chatbot":
        return <Chatbot onTodosUpdate={handleTodosUpdate} onDataUpdate={fetchDashboardData} />;
      case "chart":
        return <Chart 
            chartData={chartData} 
            chartLabels={chartLabels} 
            onRefresh={fetchDashboardData} 
          />;
      case "todo":
        return <Todo
              tasks={todos}
              onUpdate={handleTodosUpdate}
              onFetch={fetchDashboardData}
              loading={loading.todos}
              showChatContext={true}
            />;
      case "dementia":
        return <Game onDataUpdate={fetchDashboardData} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="dashboard-page d-flex flex-column min-vh-100"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Navbar user={user} downloadReport={handleDownloadReport} />
      <div className="navbar-spacer" style={{height: '160px'}}></div>
      <div className="dashboard-container" ref={reportRef}>
        <div className="dashboard-header">
          <div className="d-flex gap-3 align-items-center justify-content-center flex-wrap w-100">
            <button 
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2" 
              onClick={()=>setShowFormatPopup(true)} 
              disabled={downloading}
              aria-label={t("dashboard.downloadReport","Download Report")}
            >
              {downloading ? (
                <>
                  <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                  <span>{t("dashboard.downloading","Generating Report...")}</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                  </svg>
                  <span>{t("dashboard.downloadReport","Download Report")}</span>
                </>
              )}
            </button>

            <div className="position-relative" ref={notificationRef}>
              <button
                className="btn btn-outline-primary d-flex align-items-center justify-content-center position-relative"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                style={{ width: '44px', height: '44px', borderRadius: '50%' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
                </svg>
                {unreadCount > 0 && (
                  <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: '0.65rem' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className="position-absolute end-0 mt-2 card shadow-lg"
                  style={{ 
                    width: '350px', 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    zIndex: 1050,
                    borderRadius: '12px'
                  }}
                >
                  <div className="card-header d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)', color: '#fff' }}>
                    <h6 className="mb-0">
                      <i className="bi bi-bell me-2"></i>
                      {t("notifications.title", "Notifications")}
                    </h6>
                    {unreadCount > 0 && (
                      <button 
                        className="btn btn-sm btn-light"
                        onClick={handleMarkAllAsRead}
                      >
                        {t("notifications.markAllRead", "Mark all read")}
                      </button>
                    )}
                  </div>
                  <div className="card-body p-0">
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-bell-slash display-6 mb-2"></i>
                        <p className="mb-0">{t("notifications.empty", "No notifications yet")}</p>
                      </div>
                    ) : (
                      <ul className="list-group list-group-flush">
                        {notifications.slice(0, 10).map((notif) => (
                          <li 
                            key={notif._id} 
                            className={`list-group-item ${!notif.isRead ? 'bg-light' : ''}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1" onClick={() => handleMarkAsRead(notif._id)}>
                                <div className="d-flex align-items-center mb-1">
                                  <i className={`bi ${notif.type === 'appointment_accepted' ? 'bi-check-circle-fill text-success' : notif.type === 'appointment_rejected' ? 'bi-x-circle-fill text-danger' : 'bi-info-circle-fill text-info'} me-2`}></i>
                                  <strong className="small">{notif.title}</strong>
                                  {!notif.isRead && <span className="badge bg-primary ms-2" style={{ fontSize: '0.6rem' }}>NEW</span>}
                                </div>
                                <p className="mb-1 small text-muted">{notif.message}</p>
                                <small className="text-muted">{new Date(notif.createdAt).toLocaleString()}</small>
                              </div>
                              <button 
                                className="btn btn-sm btn-link text-danger p-0 ms-2"
                                onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif._id); }}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            {showFormatPopup && (
              <div 
                className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                style={{zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'}} 
                onClick={()=>setShowFormatPopup(false)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="format-popup-title"
              >
                <div 
                  className="card p-4 position-relative shadow-lg" 
                  style={{
                    minWidth: '300px', 
                    maxWidth: '500px', 
                    width: '90%',
                    animation: 'fadeInScale 0.3s ease-out'
                  }} 
                  onClick={e=>e.stopPropagation()}
                >
                  <button 
                    className="btn-close position-absolute top-0 end-0 m-3" 
                    onClick={()=>setShowFormatPopup(false)} 
                    aria-label={t("common.close", "Close")}
                  ></button>
                  <h5 id="format-popup-title" className="card-title mb-4 text-center fw-bold">
                    {t("report.selectFormat", "Select Report Format")}
                  </h5>
                  <div className="d-flex gap-3 flex-wrap justify-content-center">
                    {["pdf","csv","json"].map(fmt => (
                      <button 
                        key={fmt} 
                        className="btn btn-outline-primary d-flex flex-column align-items-center gap-2 p-3" 
                        style={{
                          minWidth: '100px',
                          transition: 'all 0.2s ease',
                          borderWidth: '2px'
                        }}
                        onClick={()=>{handleDownloadReport(fmt); setShowFormatPopup(false);}}
                        aria-label={`Download ${fmt.toUpperCase()} report`}
                      >
                        <span className="fw-bold fs-5">{fmt.toUpperCase()}</span>
                        <small className="text-muted">{fmt === 'pdf' ? 'Document' : fmt === 'csv' ? 'Spreadsheet' : 'Data'}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <ul className="dashboard-tabs nav nav-tabs list-unstyled mb-0" role="tablist">
          {["chatbot","chart","todo","dementia"].map(tab => (
            <li key={tab} className="nav-item" role="presentation">
              <button
                className={`btn ${activeTab===tab?"btn-primary":"btn-outline-secondary"} dashboard-tab-btn ${activeTab===tab?"active":""} d-flex align-items-center gap-2`}
                onClick={()=>handleTabChange(tab)}
                role="tab"
                aria-selected={activeTab===tab}
                aria-controls={`tabpanel-${tab}`}
                id={`tab-${tab}`}
                style={{
                  transition: 'all 0.2s ease',
                  minHeight: '44px'
                }}
              >
                {t(`dashboard.tab.${tab}`, tab === "dementia" ? t("dementia.title", "Dementia Checker") : tab.charAt(0).toUpperCase()+tab.slice(1))}
              </button>
            </li>
          ))}
        </ul>

        <div 
          className="dashboard-page-content card mt-4" 
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
}
