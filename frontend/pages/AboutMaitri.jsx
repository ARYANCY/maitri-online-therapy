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
      console.error(t("dashboard.error.sessionCheckFailed", "Session check failed:"), err);
      setError(t("dashboard.error.sessionCheckFailed", "Session check failed:") + " " + err.message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) return <p className="dashboard-loading">{t("dashboard.loading", "Loading...")}</p>;
  if (error) return <p className="dashboard-error">{error}</p>;

  // Helper function to safely get array from i18n
  const getArray = (key) => t(key, [], { returnObjects: true }) || [];

  return (
    <div className="about-maitri-page">
      <Navbar user={user} />

      <div className="about-maitri-container">
        {/* Hero Section */}
        <section className="maitri-hero">
          <h1>{t("aboutMaitri.heroTitle", "About Maitri")}</h1>
          <p>{t("aboutMaitri.heroDescription", "Maitri is dedicated to promoting mental health awareness...")}</p>
        </section>

        {/* Mission & Vision */}
        <section className="maitri-mission">
          <h2>{t("aboutMaitri.missionTitle", "Our Mission")}</h2>
          <p>{t("aboutMaitri.missionDescription", "To empower individuals to take charge of their mental health...")}</p>

          <h2>{t("aboutMaitri.visionTitle", "Our Vision")}</h2>
          <p>{t("aboutMaitri.visionDescription", "A world where mental health is valued equally...")}</p>
        </section>

        {/* Features */}
        <section className="maitri-features">
          <h2>{t("aboutMaitri.featuresTitle", "What We Offer")}</h2>
          <ul>
            {getArray("aboutMaitri.features").map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </section>

        {/* Videos */}
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

        {/* Mental Health Tips */}
        <section className="maitri-tips">
          <h2>{t("aboutMaitri.tipsTitle", "Mental Health Tips")}</h2>
          <ul>
            {getArray("aboutMaitri.tips").map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </section>

        {/* FAQs */}
        <section className="maitri-faqs">
          <h2>{t("aboutMaitri.faqsTitle", "Frequently Asked Questions")}</h2>
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="faq-item">
              <h3>{t(`aboutMaitri.faq${num}.question`, `FAQ ${num} Question`)}</h3>
              <p>{t(`aboutMaitri.faq${num}.answer`, `FAQ ${num} Answer`)}</p>
            </div>
          ))}
        </section>

        {/* Testimonials */}
        <section className="maitri-testimonials">
          <h2>{t("aboutMaitri.testimonialsTitle", "What Our Users Say")}</h2>
          {getArray("aboutMaitri.testimonials").map((item, idx) => (
            <div key={idx} className="testimonial-card">
              <p>{item}</p>
            </div>
          ))}
        </section>

        {/* Contact / Call to Action */}
        <section className="maitri-contact">
          <h2>{t("aboutMaitri.contactTitle", "Get Started with Maitri")}</h2>
          <p>
            {t(
              "aboutMaitri.contactDescription",
              "Start your journey toward better mental health today. Explore our journaling and support features now!"
            )}
          </p>
          <button className="maitri-start-btn">
            {t("aboutMaitri.startButton", "Start Journaling")}
          </button>
        </section>
      </div>
    </div>
  );
}
