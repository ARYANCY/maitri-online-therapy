import React from "react";
import { Link } from "react-router-dom";
import ReminderBell from "./ReminderBell";
import "../css/Navbar.css";

export default function Navbar({ user }) {
  return (
    <nav className="navbar">
      <div className="navbar-top">
        <h1 className="navbar-title">Maitri</h1>
      </div>
      <div className="navbar-bottom">
        <div className="navbar-left"></div>
        <div className="navbar-right">
          <ReminderBell />
          <span className="navbar-user">Hello, {user?.name || "Guest"}</span>
        </div>
      </div>
    </nav>
  );
}
