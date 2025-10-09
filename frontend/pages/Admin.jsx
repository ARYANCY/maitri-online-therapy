import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/Admin.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";

export default function Admin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rejectTimers = useRef({}); // store setTimeout IDs

  // Fetch session info
  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data?.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
    } catch (err) {
      console.error("Session check failed:", err);
      navigate("/login");
    }
  }, [navigate]);

  // Fetch therapists
  const fetchTherapists = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await API.therapist.getAll();
      setTherapists(
        data.map(t => ({
          ...t,
          status: t.status || "pending",
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || t("admin.errorFetch"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Accept therapist
  const handleAccept = async (id) => {
    setTherapists(prev => prev.map(t => t._id === id ? { ...t, status: "accepted" } : t));
    try {
      await API.therapist.updateStatus(id, "accepted");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || t("admin.errorAccept"));
      fetchTherapists(); // revert changes
    }
  };

  // Reject therapist
  const handleReject = async (id) => {
    setTherapists(prev => prev.map(t => t._id === id ? { ...t, status: "rejected" } : t));
    
    try {
      await API.therapist.updateStatus(id, "rejected");
      
      // Schedule auto-delete
      if (rejectTimers.current[id]) clearTimeout(rejectTimers.current[id]);
      rejectTimers.current[id] = setTimeout(async () => {
        try {
          await API.therapist.delete(id);
          setTherapists(prev => prev.filter(t => t._id !== id));
          console.log(`Therapist ${id} auto-deleted after rejection.`);
        } catch (err) {
          console.error("Auto-delete failed:", err);
        }
      }, 2 * 60 * 60 * 1000); // 2 hours

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || t("admin.errorReject"));
      fetchTherapists(); // revert changes
    }
  };

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      Object.values(rejectTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchTherapists();
  }, [user, fetchTherapists]);

  return (
    <>
      <Navbar user={user} />
      <div className="admin-container light-version container my-5 p-4">
        <div className="text-center mb-4 intro-section">
          <h1 className="text-primary fw-bold">{t("admin.title")}</h1>
          <p className="text-muted lead">{t("admin.description")}</p>
          <button className="btn btn-outline-primary mt-3" onClick={() => navigate("/dashboard")}>
            {t("admin.goDashboard")}
          </button>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="table-responsive shadow-sm glass-card p-3 rounded">
            <table className="table table-hover align-middle text-center admin-table">
              <thead className="table-light">
                <tr>
                  {[
                    t("admin.table.name"),
                    t("admin.table.email"),
                    t("admin.table.phone"),
                    t("admin.table.specialization"),
                    t("admin.table.experience"),
                    t("admin.table.qualifications"),
                    t("admin.table.status"),
                    t("admin.table.actions"),
                  ].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {therapists.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-muted py-4">{t("admin.noApplications")}</td>
                  </tr>
                ) : (
                  therapists.map(t => (
                    <tr key={t._id}>
                      <td>{t.name}</td>
                      <td>{t.email}</td>
                      <td>{t.phone}</td>
                      <td>{t.specialization}</td>
                      <td>{t.experience} {t("admin.years")}</td>
                      <td>{t.qualifications || "N/A"}</td>
                      <td className={`status ${t.status}`}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</td>
                      <td className="action-buttons">
                        <button onClick={() => handleAccept(t._id)} className="btn btn-sm mx-1 status-btn accepted" disabled={t.status === "accepted"}>
                          {t("admin.accept")}
                        </button>
                        <button onClick={() => handleReject(t._id)} className="btn btn-sm mx-1 status-btn rejected" disabled={t.status === "rejected"}>
                          {t("admin.reject")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <footer className="text-center mt-5">
          <hr />
          <Link to="/talk-to-counselor" className="btn btn-link me-3">{t("admin.talkCounselor")}</Link>
          <Link to="/therapist-form" className="btn btn-link">{t("admin.therapistForm")}</Link>
        </footer>
      </div>
    </>
  );
}
