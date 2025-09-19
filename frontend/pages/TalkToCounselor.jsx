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
      setFormData({ ...formData, name: data.user.name });
    } catch (err) {
      console.error("Session check failed:", err);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t("counselor.requestSubmitted", "Your request has been submitted. Our counselor will contact you soon!"));
    setFormData({ name: user?.name || "", email: "", message: "" });
  };

  if (loading) return <p className="dashboard-loading">{t("loading", "Loading...")}</p>;
  if (error) return <p className="dashboard-error">{error}</p>;

  return (
    <div className="talk-counselor-page">
      <Navbar user={user} />

      <div className="talk-counselor-container">

        <section className="hero">
          <h1>{t("counselor.title", "Talk to a Counselor")}</h1>
          <p>
            {t(
              "counselor.description",
              "Need guidance or support? Reach out to our professional counselor for a confidential and empathetic conversation."
            )}
          </p>
        </section>

        <section className="counselor-profile">
          <img src={dhriti} alt="Dhriti Tapati Dey" className="counselor-img" />
          <div className="counselor-details">
            <h2>{t("counselor.name", "DHRITI TAPATI DEY")}</h2>
            <p>
              <strong>{t("counselor.qualifications", "Qualifications:")}</strong>{" "}
              {t("counselor.qualificationsDetails", "M.A. in Clinical Psychology, Certified CBT Practitioner")}
            </p>
            <p>
              <strong>{t("counselor.experience", "Experience:")}</strong>{" "}
              {t(
                "counselor.experienceDetails",
                "7 years in mental health counseling, specializing in anxiety, depression, and stress management"
              )}
            </p>
            <p>
              <strong>{t("counselor.languages", "Languages:")}</strong>{" "}
              {t("counselor.languagesDetails", "English, Hindi, Assamese")}
            </p>
            <p>
              <strong>{t("counselor.availability", "Availability:")}</strong>{" "}
              {t("counselor.availabilityDetails", "Mon-Fri, 10:00 AM - 6:00 PM")}
            </p>
            <a href="tel:8822925245" className="call-btn">{t("counselor.callButton", "Call 88229 25245")}</a>
          </div>
        </section>

        <section className="counselor-form-section">
          <h2>{t("counselor.requestSession", "Request a Session")}</h2>
          <form className="counselor-form" onSubmit={handleSubmit}>
            <label>
              {t("counselor.form.name", "Name")}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("counselor.form.namePlaceholder", "Your Name")}
                required
              />
            </label>
            <label>
              {t("counselor.form.email", "Email")}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("counselor.form.emailPlaceholder", "Your Email")}
                required
              />
            </label>
            <label>
              {t("counselor.form.message", "Message")}
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t("counselor.form.messagePlaceholder", "Write your concerns here...")}
                rows="5"
                required
              ></textarea>
            </label>
            <button type="submit" className="submit-btn">{t("counselor.form.submit", "Submit Request")}</button>
          </form>
        </section>

      </div>
    </div>
  );
}
