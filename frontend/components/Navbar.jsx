import React, { useState } from "react";
import ReminderBell from "./ReminderBell";
import { useTranslation } from "react-i18next";
import GULogo from "../src/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/Navbar.css";

export default function Navbar({ user, downloadReport }) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLang = async (lng) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
      localStorage.setItem("preferredLang", lng);
      try {
        await API.post("/auth/update-language", { language: lng });
        console.log(`Language preference updated to ${lng}`);
      } catch (err) {
        console.error("Failed to update language preference:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar glass">
      {/* Top section */}
      <div className="navbar-top">
        <div className="navbar-title-container">
          <a href="https://gauhati.ac.in" target="_blank" rel="noopener noreferrer">
            <img src={GULogo} alt="GU Logo" className="gu-logo" />
          </a>
          <h1 className="navbar-title">{t("navbar.title")}</h1>
        </div>

        <div className="lang-switcher">
          {["en", "hi", "as"].map((lng) => (
            <button
              key={lng}
              onClick={() => changeLang(lng)}
              className={`lang-btn ${i18n.language === lng ? "active" : ""}`}
              aria-label={`Switch language to ${lng}`}
            >
              {lng === "en" && "EN"}
              {lng === "hi" && "हिं"}
              {lng === "as" && "অসমীয়া"}
            </button>
          ))}
        </div>

        <input
          type="checkbox"
          id="checkbox"
          checked={menuOpen}
          onChange={() => setMenuOpen(!menuOpen)}
        />
        <label htmlFor="checkbox" className="toggle">
          <div className="bars" id="bar1"></div>
          <div className="bars" id="bar2"></div>
          <div className="bars" id="bar3"></div>
        </label>
      </div>

      {/* Bottom nav (links & user info) */}
      <div className={`navbar-bottom ${menuOpen ? "open" : ""}`}>
        <div className="navbar-left">
          <button onClick={handleLogout} className="navbar-link">
            {t("navbar.logout", "Logout")}
          </button>
          <Link to="/dashboard" className="navbar-link ww">
            {t("navbar.dashboard", "Dashboard")}
          </Link>
          <Link to="/about-maitri" className="navbar-link ww">
            {t("navbar.about", "About Maitri")}
          </Link>
          <Link to="/talk-to-counselor" className="navbar-link ww">
            {t("navbar.talkToCounselor", "Talk to Counselor")}
          </Link>

          <a
            href="https://chat-app-ashen-phi.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-chat-btn"
          >
            {t("navbar.feelingDown")}
          </a>

          {typeof downloadReport === "function" && (
            <button
              className="navbar-link download-btn"
              onClick={downloadReport}
            >
              {t("navbar.downloadReport", "Download Report")}
            </button>
          )}
        </div>

        <div className="navbar-right">
          <ReminderBell />
          <div className="navbar-user">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="navbar-avatar"
              />
            ) : (
              <div className="navbar-avatar placeholder">
                {user?.name?.charAt(0).toUpperCase() || "G"}
              </div>
            )}
            <span className="navbar-username">
              {t("navbar.hello", { name: user?.name || t("navbar.guest") })}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
