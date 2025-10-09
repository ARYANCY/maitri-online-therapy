import React, { useEffect, useState, useCallback } from "react";
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
  const [error, setError] = useState("");

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

  const fetchTherapists = useCallback(async () => {
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
      setError(err.response?.data?.message || err.message || t("admin.errorFetch", "Error fetching therapist applications"));
    }
  }, [t]);

  const handleReject = async (id) => {
    try {
      await API.therapist.updateStatus(id, "rejected");
      fetchTherapists();

      setTimeout(async () => {
        try {
          await API.therapist.delete(id);
          console.log(`Therapist ${id} auto-deleted after rejection.`);
          fetchTherapists();
        } catch (err) {
          console.error("Auto-delete failed:", err);
        }
      }, 2 * 60 * 60 * 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || t("admin.errorReject", "Error rejecting therapist"));
    }
  };

  const handleAccept = async (id) => {
    try {
      await API.therapist.updateStatus(id, "accepted");
      fetchTherapists();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || t("admin.errorAccept", "Error accepting therapist"));
    }
  };

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (user) fetchTherapists(); }, [user, fetchTherapists]);

  return (
    <>
      <Navbar user={user} />
      <div className="admin-container light-version container my-5 p-4">
        <div className="text-center mb-4 intro-section">
          <h1 className="text-primary fw-bold">{t("admin.title", "Therapist Applications")}</h1>
          <p className="text-muted lead">
            {t("admin.description", "Manage and review therapist applications submitted by professionals. Approve trusted therapists to connect faster, or reject unverified entries for quality assurance.")}
          </p>

          <button
            className="btn btn-outline-primary mt-3"
            onClick={() => navigate("/dashboard")}
          >
            {t("admin.goDashboard", "Go to Dashboard")}
          </button>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <div className="table-responsive shadow-sm glass-card p-3 rounded">
          <table className="table table-hover align-middle text-center admin-table">
            <thead className="table-light">
              <tr>
                {[
                  t("admin.table.name", "Name"),
                  t("admin.table.email", "Email"),
                  t("admin.table.phone", "Phone"),
                  t("admin.table.specialization", "Specialization"),
                  t("admin.table.experience", "Experience"),
                  t("admin.table.qualifications", "Qualifications"),
                  t("admin.table.status", "Status"),
                  t("admin.table.actions", "Actions"),
                ].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {therapists.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-muted py-4">{t("admin.noApplications", "No applications found.")}</td>
                </tr>
              ) : (
                therapists.map(t => (
                  <tr key={t._id}>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{t.phone}</td>
                    <td>{t.specialization}</td>
                    <td>{t.experience} {t("admin.years", "yrs")}</td>
                    <td>{t.qualifications || "N/A"}</td>
                    <td className={`status ${t.status}`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleAccept(t._id)}
                        className="btn btn-sm mx-1 status-btn accepted"
                        disabled={t.status === "accepted"}
                      >
                        {t("admin.accept", "Accept")}
                      </button>
                      <button
                        onClick={() => handleReject(t._id)}
                        className="btn btn-sm mx-1 status-btn rejected"
                        disabled={t.status === "rejected"}
                      >
                        {t("admin.reject", "Reject")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="text-center mt-5">
          <hr />
          <Link to="/talk-to-counselor" className="btn btn-link me-3">{t("admin.talkCounselor", "Talk to Counselor")}</Link>
          <Link to="/therapist-form" className="btn btn-link">{t("admin.therapistForm", "Therapist Form")}</Link>
        </footer>
      </div>
    </>
  );
}
