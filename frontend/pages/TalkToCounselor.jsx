import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/TalkToCounselor.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TalkToCounselor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState({ user: true, list: true });
  const [error, setError] = useState({ user: "", list: "" });

  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data?.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
      setError(prev => ({ ...prev, user: "" }));
    } catch {
      navigate("/login");
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, [navigate]);

  const fetchCounselors = useCallback(async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError(prev => ({ ...prev, list: "" }));
    try {
      const data = await API.therapist.getAccepted();
      setCounselors(data);
    } catch (err) {
      setError(prev => ({
        ...prev,
        list: err.response?.data?.message || err.message || t("talk.errorFetching", "Error fetching counselors"),
      }));
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  }, [t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchCounselors();
  }, [user, fetchCounselors]);

  return (
    <div className="talk-container light-version" style={{ minHeight: "100vh", backgroundColor: "#f6f8fa" }}>
      <Navbar user={user} />
      <div className="container py-5">
        <header className="text-center mb-5">
          <h1 className="fw-bold text-primary">{t("talk.title", "Talk to a Counselor")}</h1>
          <p className="lead text-muted">
            {t("talk.subtitle", "Our verified counselors are ready to assist you professionally.")}
          </p>
        </header>

        {error.list && <div className="alert alert-danger text-center">{error.list}</div>}
        {loading.list && <p className="text-center">{t("talk.loading", "Loading counselors...")}</p>}
        {!loading.list && counselors.length === 0 && (
          <p className="text-center text-muted">{t("talk.noCounselors", "No counselors available right now.")}</p>
        )}

        <div className="counselor-grid">
          {!loading.list &&
            counselors.map((c) => (
              <div key={c._id} className="counselor-card glass-hover">
                <h5 className="card-title">{c.name}</h5>
                <p><strong>{t("talk.email", "Email")}:</strong> {c.email}</p>
                <p><strong>{t("talk.phone", "Phone")}:</strong> {c.phone}</p>
                <p><strong>{t("talk.specialization", "Specialization")}:</strong> {c.specialization}</p>
                <p><strong>{t("talk.experience", "Experience")}:</strong> {c.experience} {t("talk.years", "yrs")}</p>
                {c.qualifications && (
                  <p><strong>{t("talk.qualifications", "Qualifications")}:</strong> {c.qualifications}</p>
                )}
                <a href={`tel:${c.phone}`} className="btn-call">
                  {t("talk.callNow", "Call Now")}
                </a>
              </div>
            ))}
        </div>
      </div>

      <footer className="footer-section">
        <div className="footer-overlay">
          <div className="footer-content container text-center">
            <h2 className="footer-title">MindConnect</h2>
            <p className="footer-subtitle">
              {t("talk.footerLine", "Your safe space for mindful conversations and healing connections.")}
            </p>
            <div className="footer-links">
              <Link to="/therapist-form" className="footer-link">{t("talk.therapistForm", "Therapist Form")}</Link>
              <Link to="/admin" className="footer-link">{t("talk.adminDashboard", "Admin Dashboard")}</Link>
            </div>
            <p className="footer-copy">© 2025 MindConnect — {t("talk.footer", "Empowering mental wellness")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
