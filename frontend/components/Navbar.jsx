import React from "react";
import ReminderBell from "./ReminderBell";
import "../css/Navbar.css";

export default function Navbar({ user }) {
  return (
    <nav className="navbar">
      {/* Top section */}
      <div className="navbar-top">
        <h1 className="navbar-title">Maitri</h1>
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
            Feeling down? Make a new friend!
          </a>
        </div>

        <div className="navbar-right">
          <ReminderBell />
          <span className="navbar-user">Hello, {user?.name || "Guest"}</span>
        </div>
      </div>
    </nav>
  );
}
