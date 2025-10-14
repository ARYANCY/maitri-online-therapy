import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Home.css";
import homeImage from "@/images/home.jpg";
import API from "../utils/axiosClient";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // ----------------------------
  // Check active session on mount
  // ----------------------------
  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        const session = await API.auth.checkSession();
        if (active && session?.user) {
          setUser(session.user);

          const params = new URLSearchParams(location.search);
          if (params.has("token") || params.has("code")) {
            navigate("/splash", { replace: true });
          }
        }
      } catch (err) {
        console.warn("Session verification failed:", err?.message || err);
      }
    };

    verifySession();
    return () => { active = false; };
  }, [navigate, location]);

  // ----------------------------
  // Google OAuth login handler
  // ----------------------------
  const handleGoogleLogin = () => {
    if (isLoading) return;
    setIsLoading(true);

    // Allow minimal delay for UI to update before redirect
    setTimeout(() => {
      const redirectURL = `${import.meta.env.VITE_API_URL}/auth/google`;
      try {
        window.location.assign(redirectURL);
      } catch {
        // Fallback in case assign fails (rare edge)
        window.location.href = redirectURL;
      }
    }, 150);
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div
      className="home"
      style={{
        backgroundImage: `url(${homeImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="home-overlay">
        <div className="home-content">
          <h1 className="home-title">
            Welcome to <span>Maitri</span>
          </h1>

          <p className="home-subtitle">
            A space to connect, learn, and grow — start your journey with Google login.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="google-login-btn"
            disabled={isLoading}
          >
            {isLoading ? "Redirecting..." : "Start your journey"}
          </button>
        </div>
      </div>
    </div>
  );
}
