import React from "react";
import "../css/Home.css"; 
import homeImage from "../src/images/home.jpg"

export default function Home() {
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
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
}
