import React from "react";
import "../css/Home.css";
import homeImage from "../src/images/home.jpg";
import API from "../utils/axiosClient";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // Open Google OAuth in a popup
      const googleUrl = `${import.meta.env.VITE_API_URL}/auth/google`;
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        googleUrl,
        "Google Login",
        `width=${width},height=${height},top=${top},left=${left}`
      );

      // Listen for message from popup
      window.addEventListener("message", async function onMessage(event) {
        if (event.origin !== import.meta.env.VITE_API_URL) return;

        const { token, success, user } = event.data || {};
        if (success && user) {
          localStorage.setItem("user", JSON.stringify(user));

          // Redirect based on role
          if (user.isAdmin) navigate("/admin");
          else navigate("/home");

          window.removeEventListener("message", onMessage);
          popup.close();
        }
      });
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="home" style={{ backgroundImage: `url(${homeImage})` }}>
      <div className="home-overlay">
        <div className="home-content">
          <h1 className="home-title">Welcome to <span>Maitri</span></h1>
          <p className="home-subtitle">
            A space to connect, learn, and grow — start your journey with Google login.
          </p>
          <button onClick={handleGoogleLogin} className="google-login-btn">
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
}
