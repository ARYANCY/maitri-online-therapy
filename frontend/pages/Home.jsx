import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css"; 
import homeImage from "../src/images/home.jpg"
import API from "../utils/axiosClient";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const data = await API.auth.checkSession();
        if (data?.user) {
          // User is authenticated, redirect to dashboard
          navigate("/dashboard");
        }
      } catch (err) {
        // User is not authenticated, stay on home page
        console.log("User not authenticated, staying on home page");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
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
            Start your journey
          </button>
          <div className="mt-3">
            <button 
              onClick={() => navigate("/admin-login")} 
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
