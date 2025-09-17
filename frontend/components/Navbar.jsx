import React from "react";
import ReminderBell from "./ReminderBell";
import { useTranslation } from "react-i18next";
import "../css/Navbar.css";

export default function Navbar({ user }) {
  const { i18n, t } = useTranslation();

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="navbar glass">
      {/* Top section */}
      <div className="navbar-top">
        <h1 className="navbar-title">{t("navbar.title") || "Maitri"}</h1>

        {/* Language switcher */}
        <div className="lang-switcher">
          <button onClick={() => changeLang("en")}>EN</button>
          <button onClick={() => changeLang("hi")}>हिं</button>
          <button onClick={() => changeLang("as")}>অসমীয়া</button>
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
            {t("navbar.feelingDown") || "Feeling down? Make a new friend!"}
          </a>
        </div>

        <div className="navbar-right">
          <ReminderBell />
          <span className="navbar-user">
            {t("navbar.hello", { name: user?.name || "Guest" }) || `Hello, ${user?.name || "Guest"}`}
          </span>
        </div>
      </div>
    </nav>
  );
}
