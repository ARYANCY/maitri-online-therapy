import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Splash.css";

export default function Splash() {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [started, setStarted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e) => setReducedMotion(e.matches);

    window.addEventListener("resize", handleResize);
    mediaQuery.addEventListener("change", listener);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  useEffect(() => {
    if (started && videoRef.current && !reducedMotion) {
      videoRef.current.style.opacity = 0;
      videoRef.current.play().then(() => {
        videoRef.current.style.transition = "opacity 3s ease";
        setTimeout(() => {
          videoRef.current.style.opacity = 1;
        }, 100); // slight delay to ensure transition works
      }).catch(() => {});
    }
  }, [started, reducedMotion]);

  const handleVideoEnd = () => {
    setFadeOut(true);
    setTimeout(() => navigate("/dashboard"), 1200);
  };

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => navigate("/dashboard"), 600);
  };

  return (
    <div className={`splash-container ${fadeOut ? "fade-out" : ""}`}>
      {!started ? (
        <div className="splash-overlay">
          <h1 className="splash-text">MAITRI</h1>
          <p className="splash-subtext">
            Not just a chatbot — a safe, warm space for your well-being.
          </p>
          <button className="splash-btn" onClick={() => setStarted(true)}>
            Tap to Start
          </button>
        </div>
      ) : reducedMotion ? (
        <div className="splash-overlay">
          <h1 className="splash-text">MAITRI</h1>
          <p className="splash-subtext">
            Welcome — supporting your well-being every step of the way.
          </p>
          <button className="splash-btn" onClick={handleSkip}>
            Continue
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="splash-video"
            autoPlay={false}
            playsInline
            preload={isDesktop ? "auto" : "none"}
            onEnded={handleVideoEnd}
          >
            <source
              src={isDesktop ? "/videos/splashd.MP4" : "/videos/splash.MP4"}
              type="video/mp4"
            />
            <source
              src={isDesktop ? "/videos/splashd.webm" : "/videos/splash.webm"}
              type="video/webm"
            />
          </video>

          {!isDesktop && (
            <div className="splash-overlay mobile-text">
              <h1 className="splash-text">Welcome to MAITRI</h1>
              <p className="splash-subtext">
                Your caring companion for mental well-being.
              </p>
            </div>
          )}

          <button className="skip-btn" onClick={handleSkip}>
            Skip Intro →
          </button>
        </>
      )}
    </div>
  );
}
