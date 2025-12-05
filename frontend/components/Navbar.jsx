import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import GULogo from "@/images/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/components/Navbar.css";

export default function Navbar({ user, downloadReport }) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem("preferredLang") || i18n.language || "en"
  );

  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  useEffect(() => {
    i18n.changeLanguage(selectedLang);
  }, [selectedLang, i18n]);

  
  const changeLang = async (lng) => {
    if (lng === selectedLang) return;
    setSelectedLang(lng);
    localStorage.setItem("preferredLang", lng);
    await i18n.changeLanguage(lng);
    try {
      await API.auth.updateLanguage(lng);
    } catch (_) {}
    window.dispatchEvent(new Event("languageChanged"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setLanguageDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    if (languageDropdownOpen || profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [languageDropdownOpen, profileDropdownOpen]);

  return (
    <nav className={`navbar-magic ${scrolled ? "navbar-scrolled" : ""}`}>
      
      <div className="navbar-top">
        <div className="navbar-top-content">
          <div className="navbar-top-left">
            <a 
              href="https://gauhati.ac.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="navbar-logo-wrapper"
              id="appLogo"
            >
              <img 
                src={GULogo} 
                alt={t("navbar.guLogo", "Gauhati University Logo")} 
                className="navbar-logo"
              />
            </a>
            <h1 className="navbar-title">
              <span className="navbar-title-text">{t("navbar.title", "Maitri")}</span>
            </h1>
          </div>
          <div className="navbar-top-right">
            <div className="dropdown" id="languageSelector" ref={languageDropdownRef}>
              <button
                className="dropdown-toggle"
                type="button"
                id="languageDropdown"
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              >
                <span>
                  {selectedLang === "en" && "EN"}
                  {selectedLang === "hi" && "हिं"}
                  {selectedLang === "as" && "অসমীয়া"}
                </span>
              </button>
              <ul className={`dropdown-menu ${languageDropdownOpen ? "show" : ""}`}>
                {["en", "hi", "as"].map((lng) => (
                  <li key={lng}>
                    <button
                      className={`dropdown-item ${selectedLang === lng ? "active" : ""}`}
                      onClick={() => {
                        changeLang(lng);
                        setLanguageDropdownOpen(false);
                      }}
                    >
                      <span>
                        {lng === "en" && "English"}
                        {lng === "hi" && "हिंदी"}
                        {lng === "as" && "অসমীয়া"}
                      </span>
                      {selectedLang === lng && (
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 16 16" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="check-icon"
                        >
                          <path 
                            d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" 
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="navbar-toggle d-lg-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div className={`hamburger-icon ${menuOpen ? "active" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      
      <div className={`navbar-bottom ${menuOpen ? "navbar-bottom-open" : ""}`}>
        <div className="navbar-bottom-content">
          <div className="navbar-bottom-left">
            <div className="navbar-user-dropdown" ref={profileDropdownRef}>
              <button 
                className={`navbar-user-trigger ${profileDropdownOpen ? 'active' : ''}`}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || t("navbar.user", "User")} 
                    className={`navbar-avatar ${profileDropdownOpen ? 'zoomed' : ''}`}
                    id="userAvatar"
                  />
                ) : (
                  <div className={`navbar-avatar placeholder ${profileDropdownOpen ? 'zoomed' : ''}`} id="userAvatar">
                    <span>{user?.name?.charAt(0).toUpperCase() || "G"}</span>
                  </div>
                )}
                <span className="navbar-username d-none d-sm-inline" id="userName">
                  <strong>{user?.name || t("navbar.guest", "Guest")}</strong>
                </span>
                <svg 
                  className={`dropdown-arrow ${profileDropdownOpen ? 'rotated' : ''}`}
                  width="12" 
                  height="12" 
                  viewBox="0 0 16 16" 
                  fill="currentColor"
                >
                  <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
              
              <div className={`profile-dropdown-menu ${profileDropdownOpen ? 'show' : ''}`}>
                <div className="profile-dropdown-header">
                  <div className="profile-info">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="profile-dropdown-avatar" />
                    ) : (
                      <div className="profile-dropdown-avatar placeholder">
                        <span>{user?.name?.charAt(0).toUpperCase() || "G"}</span>
                      </div>
                    )}
                    <div className="profile-details">
                      <span className="profile-name">{user?.name || "Guest"}</span>
                      <span className="profile-email">{user?.email || ""}</span>
                    </div>
                  </div>
                </div>
                <div className="profile-dropdown-divider"></div>
                <div className="profile-dropdown-links">
                  <Link 
                    to="/my-appointments" 
                    className="profile-dropdown-link"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                      <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                    <span>{t("navbar.myAppointments", "My Appointments")}</span>
                  </Link>
                  <Link 
                    to="/admin" 
                    className="profile-dropdown-link"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                    </svg>
                    <span>{t("navbar.admin", "Admin Panel")}</span>
                  </Link>
                  <Link 
                    to="/doct-dashboard" 
                    className="profile-dropdown-link"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    <span>{t("navbar.therapistDashboard", "Therapist Dashboard")}</span>
                  </Link>
                  <Link 
                    to="/doch-dashboard" 
                    className="profile-dropdown-link"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 4.143A1.071 1.071 0 1 0 8 2a1.071 1.071 0 0 0 0 2.143zm-4.668 1.47a1.071 1.071 0 1 0 0-2.143 1.071 1.071 0 0 0 0 2.143zm9.336 0a1.071 1.071 0 1 0 0-2.143 1.071 1.071 0 0 0 0 2.143zM8 10.5c-3.037 0-5.5-1.607-5.5-3.5S4.963 3.5 8 3.5s5.5 1.607 5.5 3.5-2.463 3.5-5.5 3.5zm0 .5c3.314 0 6-1.791 6-4s-2.686-4-6-4-6 1.791-6 4 2.686 4 6 4z"/>
                      <path d="M8 13c-1.657 0-3 1.343-3 3h6c0-1.657-1.343-3-3-3z"/>
                    </svg>
                    <span>{t("navbar.healthcareDashboard", "Healthcare Dashboard")}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="navbar-bottom-center">
            <Link 
              to="/about-maitri" 
              className={`navbar-link-btn ${isActive("/about-maitri") ? "active" : ""}`}
              id="analysisRoute"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" fill="currentColor"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" fill="currentColor"/>
              </svg>
              <span>{t("navbar.about", "About")}</span>
            </Link>
            <Link 
              to="/dashboard" 
              className={`navbar-link-btn ${isActive("/dashboard") ? "active" : ""}`}
              id="dashboardRoute"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z" fill="currentColor"/>
              </svg>
              <span>{t("navbar.dashboard", "Dashboard")}</span>
            </Link>
            <Link 
              to="/talk-to-counselor" 
              className={`navbar-link-btn ${isActive("/talk-to-counselor") ? "active" : ""}`}
              id="settingsRoute"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2zm5 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/>
              </svg>
              <span>{t("navbar.talkToCounselor", "Talk to Healthcare Professionals")}</span>
            </Link>
          </div>
          <div className="navbar-bottom-right">
            <button 
              onClick={handleLogout} 
              className="navbar-logout-btn"
              id="logout"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" fill="currentColor"/>
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" fill="currentColor"/>
              </svg>
              <span>{t("navbar.logout", "Logout")}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
