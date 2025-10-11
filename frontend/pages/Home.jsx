import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";
import homeImage from "../src/images/home.jpg";
import API from "../utils/axiosClient";

export default function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Optional: check session before redirect
      const data = await API.auth.checkSession();
      if (data?.user) {
        setUser(data.user);
        // If already logged in, go directly to dashboard
        navigate("/dashboard");
        return;
      }
      // If not logged in, go to Google OAuth login
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    } catch (err) {
      // Not logged in — start Google OAuth login
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAccess = () => {
    if (user?.isAdmin) navigate("/admin");
    else navigate("/admin-login");
  };

  return (
    <div className="home" style={{ backgroundImage: `url(${homeImage})` }}>
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
          <div className="mt-3">
            <button
              onClick={handleAdminAccess}
              className="btn btn-outline-light btn-sm"
            >
              Admin Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
