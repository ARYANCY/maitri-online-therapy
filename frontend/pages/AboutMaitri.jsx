import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import API from "../utils/axiosClient";
import "../css/AboutMaitri.css";
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
      console.error(t("dashboard.error.sessionCheckFailed", "Session check failed:"), err);
      setError(
        t("dashboard.error.sessionCheckFailed", "Session check failed:") + " " + err.message
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const getArray = (key) => {
    const value = t(key, [], { returnObjects: true });
    return Array.isArray(value) ? value : [];
  };

  if (loading) return <p className="dashboard-loading">{t("dashboard.loading", "Loading...")}</p>;
  if (error) return <p className="dashboard-error">{error}</p>;

  return (
    <div className="about-maitri-page">
      <Navbar user={user} />

      <div className="about-maitri-container">

        <section className="maitri-hero">
          <h1>{t("aboutMaitri.heroTitle", "About Maitri")}</h1>
          <p>
            {t(
              "aboutMaitri.heroDescription",
              "Maitri is dedicated to promoting mental health awareness and support."
            )}
          </p>
        </section>

        <section className="maitri-mission">
          <h2>{t("aboutMaitri.missionTitle", "Our Mission")}</h2>
          <p>
            {t(
              "aboutMaitri.missionDescription",
              "To empower individuals to take charge of their mental health."
            )}
          </p>

          <h2>{t("aboutMaitri.visionTitle", "Our Vision")}</h2>
          <p>
            {t(
              "aboutMaitri.visionDescription",
              "A world where mental health is valued and supported equally."
            )}
          </p>
        </section>

        <section className="maitri-features">
          <h2>{t("aboutMaitri.featuresTitle", "What We Offer")}</h2>
          <ul>
            {getArray("aboutMaitri.features").map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="maitri-videos">
          <h2>{t("aboutMaitri.videosTitle", "Helpful Videos")}</h2>
          <div className="video-grid">

            <iframe
              src="https://www.youtube.com/embed/v7AYKMP6rOE"
              title="Yoga for Mental Health"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <iframe
              src="https://www.youtube.com/embed/6p_yaNFSYao"
              title="Guided Meditation for Stress Relief"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <iframe
              src="https://www.youtube.com/embed/tEmt1Znux58"
              title="Breathing Exercises for Anxiety"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
        <section className="maitri-tips">
          <h2>{t("aboutMaitri.tipsTitle", "Mental Health Tips")}</h2>
          <ul>
            {getArray("aboutMaitri.tips").map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="maitri-faqs">
          <h2>{t("aboutMaitri.faqsTitle", "Frequently Asked Questions")}</h2>
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="faq-item">
              <h3>{t(`aboutMaitri.faq${num}.question`, `FAQ ${num} Question`)}</h3>
              <p>{t(`aboutMaitri.faq${num}.answer`, `FAQ ${num} Answer`)}</p>
            </div>
          ))}
        </section>
        <section className="maitri-medico">
          <h2>{t("aboutMaitri.medicoTitle", "MindCare")}</h2>
          <p>
            {t(
              "aboutMaitri.medicoDescription",
              "Access mental health resources, guidance, and support through MindCare."
            )}
          </p>
          <a 
            href="https://maitri-medico.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="maitri-medico-btn"
          >
            {t("aboutMaitri.medicoButton", "Visit MindCare")}
          </a>
        </section>


      </div>
    </div>
  );
}
