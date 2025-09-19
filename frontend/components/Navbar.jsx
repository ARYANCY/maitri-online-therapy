import React from "react";
import ReminderBell from "./ReminderBell";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom"; // ✅ Import Link
import "../css/Navbar.css";

export default function Navbar({ user }) {
  const { i18n, t } = useTranslation();

  const changeLang = (lng) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
      localStorage.setItem("preferredLang", lng); // ✅ persist choice
    }
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-top">
        <h1 className="navbar-title">{t("navbar.title")}</h1>

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
      </div>

      <div className="navbar-bottom">
        <div className="navbar-left">
          <Link to="/" className="navbar-link">
            {t("navbar.home", "Home")}
          </Link>
          <Link to="/dashboard" className="navbar-link">
            {t("navbar.dashboard", "Dashboard")}
          </Link>
          <Link to="/about" className="navbar-link">
            {t("navbar.about", "About Maitri")}
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
