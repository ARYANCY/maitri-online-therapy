import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/components/Footer.css";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="maitri-footer">
      <div className="footer-container">
        <div className="footer-content">
          
          <div className="footer-section footer-about">
            <h3 className="footer-title">
              {t("footer.aboutTitle", "About Maitri")}
            </h3>
            <p className="footer-description">
              {t("footer.description", "Maitri leverages advanced artificial intelligence and evidence-based cognitive assessment tools to help detect early signs of dementia through simple, accessible at-home cognitive assessments. Our innovative platform empowers individuals and families to monitor cognitive health proactively, enabling timely intervention and support.")}
            </p>
          </div>

          
          <div className="footer-section footer-links">
            <h3 className="footer-title">
              {t("footer.quickLinksTitle", "Quick Links")}
            </h3>
            <ul className="footer-link-list">
              <li>
                <Link to="/about-maitri" className="footer-link">
                  {t("footer.linkAbout", "About")}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="footer-link">
                  {t("footer.linkAssessment", "Assessment")}
                </Link>
              </li>
              <li>
                <Link to="/talk-to-counselor" className="footer-link">
                  {t("footer.linkCounselor", "Talk to Counselor")}
                </Link>
              </li>
              <li>
                <Link to="/doc" className="footer-link">
                  {t("footer.linkCarePartners", "Join as Care Partner")}
                </Link>
              </li>
            </ul>
          </div>

          
          <div className="footer-section footer-info">
            <h3 className="footer-title">
              {t("footer.contactTitle", "Get Started")}
            </h3>
            <p className="footer-info-text">
              {t("footer.infoText", "Take control of your cognitive health today. Start with a simple assessment to understand your cognitive baseline.")}
            </p>
            <Link to="/dashboard" className="footer-cta-btn">
              {t("footer.startAssessment", "Start Assessment")}
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} {t("footer.copyright", "Maitri. All rights reserved.")}
            </p>
            <p className="footer-tagline">
              {t("footer.tagline", "Empowering cognitive health through AI-driven insights")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

