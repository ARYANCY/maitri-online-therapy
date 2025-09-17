import React from "react";
import ReminderBell from "./ReminderBell";
import { useTranslation } from "react-i18next";
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
      {/* Top section */}
      <div className="navbar-top">
        <h1 className="navbar-title">{t("navbar.title")}</h1>

        {/* Language switcher */}
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

      {/* Bottom section */}
      <div className="navbar-bottom">
        <div className="navbar-left">
          {/* Feeling lonely button */}
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

          {/* User avatar + name */}
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
