import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/pages/Home.css";
import homeImage from "@/images/home.jpg";
import API from "../utils/axiosClient";
import { storeUserSession, clearUserSession } from "../utils/session";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  
  
  
  
  
  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        console.log("[SESSION DEBUG] Starting session verification (Home.jsx)...");
        const session = await API.auth.checkSession();
        console.log("[SESSION DEBUG] Session check completed (Home.jsx):", {
          success: session?.success,
          hasUser: !!session?.user,
          userId: session?.user?._id,
          message: session?.message
        });
        
        
        if (active && session?.success === true && session?.user) {
          
          storeUserSession(session.user, session.sessionInfo);
          setUser(session.user);

          
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
          
        } else {
          
          
          if (import.meta.env.DEV) {
            console.log(`[SESSION] No active session (Home.jsx) - expected when not logged in:`, {
              success: session?.success,
              hasUser: !!session?.user,
              message: session?.message
            });
          }
          
          
          if (session && session.success !== false && !session.user) {
            console.error(`[SESSION ERROR] Unexpected session state (Home.jsx):`, {
              success: session?.success,
              hasUser: !!session?.user,
              message: session?.message,
              debug: session?.debug,
              fullResponse: session
            });
          }
          
          
          clearUserSession(true);
        }
      } catch (err) {
        
        console.error(`[SESSION ERROR] Session verification failed (Home.jsx):`, {
          message: err.message,
          name: err.name,
          stack: err.stack,
          code: err.code,
          response: err.response?.data,
          status: err.response?.status
        });
        
        clearUserSession(true);
      }
    };

    
    
    const timeoutId = setTimeout(() => {
      if (active) {
        verifySession();
      }
    }, 100);

    return () => { 
      active = false;
      clearTimeout(timeoutId);
    };
  }, [navigate, location]);

  
  
  
  const handleGoogleLogin = () => {
    if (isLoading) return;
    setIsLoading(true);

    
    
    setTimeout(() => {
      const redirectURL = `${import.meta.env.VITE_API_URL}/auth/google?prompt=select_account`;
      try {
        window.location.assign(redirectURL);
      } catch {
        
        window.location.href = redirectURL;
      }
    }, 150);
  };

  
  
  
  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 position-relative"
      style={{
        backgroundImage: `url(${homeImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.55)'}}>
        <div className="text-center text-white" style={{maxWidth: '700px'}}>
          <h1 className="display-4 fw-bold mb-3">
            {t("home.welcome", "Welcome to")} <span className="text-primary">Maitri</span>
          </h1>

          <p className="lead mb-4">
            {t("home.subtitle", "A space to connect, learn, and grow — start your journey with Google login.")}
          </p>

          <button
            onClick={handleGoogleLogin}
            className="btn btn-primary btn-lg"
            disabled={isLoading}
          >
            {isLoading ? t("home.redirecting", "Redirecting...") : t("home.startJourney", "Start your journey")}
          </button>
        </div>
      </div>
    </div>
  );
}
