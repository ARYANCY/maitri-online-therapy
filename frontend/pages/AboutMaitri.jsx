import React, { useState, useEffect, useCallback } from "react";
import "../css/AboutMaitri.css";
import Navbar from "../components/Navbar";
import API from "../utils/axiosClient";
import { useTranslation } from "react-i18next";

export default function AboutMaitri() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) return <p className="dashboard-loading">{t("dashboard.loading", "Loading...")}</p>;

  return (
    <div className="about-maitri-page">
      <Navbar user={user} />

      <div className="about-maitri-container">
        <section className="maitri-hero">
          <h1>{t("aboutMaitri.heroTitle", "About Maitri")}</h1>
          <p>{t("aboutMaitri.heroDescription")}</p>
        </section>

        <section className="maitri-mission">
          <h2>{t("aboutMaitri.missionTitle", "Our Mission")}</h2>
          <p>{t("aboutMaitri.missionDescription")}</p>
          <h2>{t("aboutMaitri.visionTitle", "Our Vision")}</h2>
          <p>{t("aboutMaitri.visionDescription")}</p>
        </section>

        <section className="maitri-features">
          <h2>{t("aboutMaitri.featuresTitle", "What We Offer")}</h2>
          <ul>
            {t("aboutMaitri.features", [], { returnObjects: true }).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="maitri-videos">
          <h2>{t("aboutMaitri.videosTitle", "Helpful Videos")}</h2>
          <div className="video-grid">
            <iframe
              src="https://www.youtube.com/embed/92iQ5Yk0oc8"
              title="Mindfulness Meditation"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <iframe
              src="https://www.youtube.com/embed/inpok4MKVLM"
              title="Stress Relief Techniques"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <iframe
              src="https://www.youtube.com/embed/oHg5SJYRHA0"
              title="Positive Thinking Techniques"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        <section className="maitri-tips">
          <h2>{t("aboutMaitri.tipsTitle", "Mental Health Tips")}</h2>
          <ul>
            {t("aboutMaitri.tips", [], { returnObjects: true }).map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="maitri-faqs">
          <h2>{t("aboutMaitri.faqsTitle", "Frequently Asked Questions")}</h2>
          <div className="faq-item">
            <h3>{t("aboutMaitri.faq1.question", "What is Maitri?")}</h3>
            <p>{t("aboutMaitri.faq1.answer")}</p>
          </div>
          <div className="faq-item">
            <h3>{t("aboutMaitri.faq2.question", "Is it free to use?")}</h3>
            <p>{t("aboutMaitri.faq2.answer")}</p>
          </div>
          <div className="faq-item">
            <h3>{t("aboutMaitri.faq3.question", "Can I track my progress?")}</h3>
            <p>{t("aboutMaitri.faq3.answer")}</p>
          </div>
          <div className="faq-item">
            <h3>{t("aboutMaitri.faq4.question", "Is my data private?")}</h3>
            <p>{t("aboutMaitri.faq4.answer")}</p>
          </div>
        </section>

        <section className="maitri-testimonials">
          <h2>{t("aboutMaitri.testimonialsTitle", "What Our Users Say")}</h2>
          {t("aboutMaitri.testimonials", [], { returnObjects: true }).map((item, idx) => (
            <div key={idx} className="testimonial-card">
              <p>{item}</p>
            </div>
          ))}
        </section>

        <section className="maitri-contact">
          <h2>{t("aboutMaitri.contactTitle", "Get Started with Maitri")}</h2>
          <p>{t("aboutMaitri.contactDescription", "Start your journey toward better mental health today. Explore our journaling and support features now!")}</p>
          <button className="maitri-start-btn">{t("aboutMaitri.startButton", "Start Journaling")}</button>
        </section>
      </div>
    </div>
  );
}
