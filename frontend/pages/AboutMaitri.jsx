import React, { useState, useEffect, useCallback } from "react";
import "../css/AboutMaitri.css";
import Navbar from "../components/Navbar";
import API from "../utils/axiosClient";
import { useTranslation } from "react-i18next";

export default function AboutMaitri() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setUser(data.user);
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

  if (loading) return <p className="dashboard-loading">{t("loading")}</p>;
  if (error) return <p className="dashboard-error">{error}</p>;

  return (
    <div className="about-maitri-page">
      <Navbar user={user} />

      <div className="about-maitri-container">

        <section className="maitri-hero">
          <h1>{t("aboutMaitri.title")}</h1>
          <p>{t("aboutMaitri.description")}</p>
        </section>

        <section className="maitri-mission">
          <h2>{t("aboutMaitri.missionTitle")}</h2>
          <p>{t("aboutMaitri.missionDescription")}</p>
          <h2>{t("aboutMaitri.visionTitle")}</h2>
          <p>{t("aboutMaitri.visionDescription")}</p>
        </section>

        <section className="maitri-features">
          <h2>{t("aboutMaitri.featuresTitle")}</h2>
          <ul>
            {t("aboutMaitri.featuresList", { returnObjects: true }).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="maitri-videos">
          <h2>{t("aboutMaitri.videosTitle")}</h2>
          <div className="video-grid">
            <iframe
              src="https://www.youtube.com/embed/92iQ5Yk0oc8"
              title={t("aboutMaitri.video1Title")}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <iframe
              src="https://www.youtube.com/embed/inpok4MKVLM"
              title={t("aboutMaitri.video2Title")}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <iframe
              src="https://www.youtube.com/embed/oHg5SJYRHA0"
              title={t("aboutMaitri.video3Title")}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        <section className="maitri-tips">
          <h2>{t("aboutMaitri.tipsTitle")}</h2>
          <ul>
            {t("aboutMaitri.tipsList", { returnObjects: true }).map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="maitri-faqs">
          <h2>{t("aboutMaitri.faqsTitle")}</h2>
          {t("aboutMaitri.faqsList", { returnObjects: true }).map((faq, idx) => (
            <div className="faq-item" key={idx}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </section>

        <section className="maitri-testimonials">
          <h2>{t("aboutMaitri.testimonialsTitle")}</h2>
          {t("aboutMaitri.testimonialsList", { returnObjects: true }).map((testimonial, idx) => (
            <div className="testimonial-card" key={idx}>
              <p>"{testimonial.text}" – <strong>{testimonial.author}</strong></p>
            </div>
          ))}
        </section>

        <section className="maitri-contact">
          <h2>{t("aboutMaitri.contactTitle")}</h2>
          <p>{t("aboutMaitri.contactDescription")}</p>
          <button className="maitri-start-btn">{t("aboutMaitri.startButton")}</button>
        </section>

      </div>
    </div>
  );
}
