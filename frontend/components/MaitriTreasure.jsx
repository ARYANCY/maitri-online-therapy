import React, { useState, useEffect, useCallback } from "react";
import API from "../utils/axiosClient";
import "../css/MaitriTreasure.css";
import { useTranslation } from "react-i18next";

import treasure1 from "@/images/pic1.png";
import treasure2 from "@/images/pic2.png";
import treasure3 from "@/images/pic3.png";

const images = [treasure1, treasure2, treasure3];

const faqs = [
  { question: "What is Maitri Treasure?", answer: "A platform to explore Gauhati University, discover its canteens, food spots, and social hangouts." },
  { question: "Who can participate?", answer: "All students and staff of Gauhati University are welcome." },
  { question: "Is it free?", answer: "Yes, it’s completely free to use and enjoy." },
  { question: "How do I start?", answer: "Click the 'Start the Treasure Hunt' button to begin exploring the campus." },
];

// ...imports and other code remain the same

export default function MaitriTreasure() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="loading">{t("dashboard.loading", "Loading...")}</p>;

  return (
    <div className="maitri-treasure-page">
      <div className="treasure-container">
        {/* Intro */}
        <section className="treasure-intro">
          <h1>{t("maitriTreasure.title", "Explore Gauhati University")}</h1>
          <p>{t(
            "maitriTreasure.description",
            "Discover the best canteens, food spots, and hangout places on campus. Meet friends, enjoy meals, and explore the vibrant life of Gauhati University."
          )}</p>
        </section>

        {/* Animated Image Carousel */}
        <section className="treasure-carousel">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={t(`maitriTreasure.carouselAlt${idx}`, `Spot ${idx + 1}`)}
              className={`carousel-image ${idx === currentImage ? "active" : ""}`}
            />
          ))}
        </section>

        {/* FAQs */}
        <section className="treasure-text">
          <h2>{t("maitriTreasure.faqsTitle", "FAQs")}</h2>
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <h3>{t(`maitriTreasure.faqs.${idx}.question`, faq.question)}</h3>
              <p>{t(`maitriTreasure.faqs.${idx}.answer`, faq.answer)}</p>
            </div>
          ))}
        </section>

        {/* Action Button */}
        <section className="treasure-action">
          <button className="treasure-start-btn">{t("maitriTreasure.startButton", "Start Exploring")}</button>
        </section>
      </div>
    </div>
  );
}
