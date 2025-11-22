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
  // Check active session on mount - but don't auto-redirect
  // ----------------------------
  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        const session = await API.auth.checkSession();
        if (active && session?.user) {
          // Store session info properly
          if (session.user) {
            localStorage.setItem("userId", session.user._id || "");
            localStorage.setItem("userEmail", session.user.email || "");
            localStorage.setItem("userName", session.user.name || "");
            localStorage.setItem("isAdmin", session.user.isAdmin ? "true" : "false");
            localStorage.setItem("sessionTime", Date.now().toString());
          }
          
          setUser(session.user);

          // Only redirect if coming from OAuth callback
          const params = new URLSearchParams(location.search);
          if (params.has("token") || params.has("code") || params.has("error")) {
            const seenSplash = localStorage.getItem("seenSplash") === "true";
            if (seenSplash) {
              navigate("/dashboard", { replace: true });
            } else {
              navigate("/splash", { replace: true });
            }
            return;
          }
          // Don't auto-redirect - let user choose to login
        } else {
          // Clear session if invalid
          localStorage.removeItem("userId");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userName");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("sessionTime");
        }
      } catch (err) {
        console.warn("Session verification failed:", err?.message || err);
        // Clear session on error
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("sessionTime");
      }
    };

    verifySession();
    return () => { active = false; };
  }, [navigate, location]);

  // ----------------------------
  // Google OAuth login handler - with account selection
  // ----------------------------
  const handleGoogleLogin = () => {
    if (isLoading) return;
    setIsLoading(true);

    // Allow minimal delay for UI to update before redirect
    // Add prompt=select_account to allow users to choose their Gmail account
    setTimeout(() => {
      const redirectURL = `${import.meta.env.VITE_API_URL}/auth/google?prompt=select_account`;
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
