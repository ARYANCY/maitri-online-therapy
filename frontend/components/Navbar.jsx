import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import GULogo from "@/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/Navbar.css";

export default function Navbar({ user, downloadReport }) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Track selected language
  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem("preferredLang") || i18n.language || "en"
  );

  // Apply language on mount
  useEffect(() => {
    if (i18n.language !== selectedLang) {
      i18n.changeLanguage(selectedLang);
    }
  }, [selectedLang, i18n]);

  // Listen for languageChanged events
  useEffect(() => {
    const handleLangChange = () => {
      i18n.changeLanguage(localStorage.getItem("preferredLang") || "en");
    };
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, [i18n]);

  const changeLang = async (lng) => {
    if (lng === selectedLang) return;

    setSelectedLang(lng);
    localStorage.setItem("preferredLang", lng);

    try {
      await API.post("/auth/update-language", { language: lng });
    } catch (err) {
      console.error("Failed to update language preference:", err);
    }

    window.dispatchEvent(new Event("languageChanged"));
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

        {/* Language Switcher */}
        <div className="lang-switcher">
          {["en", "hi", "as"].map((lng) => (
            <button
              key={lng}
              onClick={() => changeLang(lng)}
              className={`lang-btn ${selectedLang === lng ? "active" : ""}`}
              aria-label={`Switch language to ${lng}`}
            >
              {lng === "en" && "EN"}
              {lng === "hi" && "हिं"}
              {lng === "as" && "অসমীয়া"}
              {selectedLang === lng && <span className="tick-mark">✔</span>}
            </button>
          ))}
        </div>

        {/* Hamburger for mobile */}
        <label className="hamburger d-md-none">
          <input
            type="checkbox"
            checked={menuOpen}
            onChange={() => setMenuOpen(!menuOpen)}
          />
          <svg viewBox="0 0 32 32">
            <path className="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
            <path className="line" d="M7 16 27 16"></path>
          </svg>
        </label>

      </div>

      {/* Bottom nav */}
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
        </div>

        <div className="navbar-right">
          <div className="navbar-user">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name || "User"} className="navbar-avatar" />
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
