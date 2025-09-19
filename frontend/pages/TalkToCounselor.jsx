import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import "../css/TalkToCounselor.css";
import dhriti from "../src/images/dd.jpeg";
import API from "../utils/axiosClient";
import { useTranslation } from "react-i18next";

export default function TalkToCounselor() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setUser(data.user);
      setFormData(prev => ({ ...prev, name: data.user.name }));
    } catch (err) {
      console.error(t("dashboard.error.sessionCheckFailed", "Session check failed:"), err);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t("counselor.requestSubmitted", "Your request has been submitted. Our counselor will contact you soon!"));
    setFormData({ name: user?.name || "", email: "", message: "" });
  };

  if (loading) return <p className="dashboard-loading">{t("dashboard.loading", "Loading...")}</p>;
  if (error) return <p className="dashboard-error">{error}</p>;

  return (
    <div className="talk-counselor-page">
      <Navbar user={user} />

      <div className="talk-counselor-container">

        <section className="hero">
          <h1>{t("counselor.title", "Talk to a Counselor")}</h1>
          <p>{t("counselor.description")}</p>
        </section>

        <section className="counselor-profile">
          <img src={dhriti} alt={t("counselor.name")} className="counselor-img" />
          <div className="counselor-details">
            <h2>{t("counselor.name")}</h2>
            <p>
              <strong>{t("counselor.qualifications")}</strong> {t("counselor.qualificationsDetails")}
            </p>
            <p>
              <strong>{t("counselor.experience")}</strong> {t("counselor.experienceDetails")}
            </p>
            <p>
              <strong>{t("counselor.languages")}</strong> {t("counselor.languagesDetails")}
            </p>
            <p>
              <strong>{t("counselor.availability")}</strong> {t("counselor.availabilityDetails")}
            </p>
            <a href="tel:8822925245" className="call-btn">{t("counselor.callButton")}</a>
          </div>
        </section>

        <section className="counselor-form-section">
          <h2>{t("counselor.requestSession")}</h2>
          <form className="counselor-form" onSubmit={handleSubmit}>
            <label>
              {t("counselor.form.name")}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("counselor.form.namePlaceholder")}
                required
              />
            </label>
            <label>
              {t("counselor.form.email")}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("counselor.form.emailPlaceholder")}
                required
              />
            </label>
            <label>
              {t("counselor.form.message")}
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t("counselor.form.messagePlaceholder")}
                rows="5"
                required
              ></textarea>
            </label>
            <button type="submit" className="submit-btn">{t("counselor.form.submit")}</button>
          </form>
        </section>

      </div>
    </div>
  );
}
