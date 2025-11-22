import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/Splash.css";

export default function Splash() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [started, setStarted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const videoRef = useRef(null);
  const loadingInterval = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Start video when user clicks start
  useEffect(() => {
    if (!started || videoError) return;
    const video = videoRef.current;
    if (!video) return;

    setVideoLoading(true);

    // Progress simulation (for preloading UX)
    loadingInterval.current = setInterval(() => {
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const progress = (bufferedEnd / video.duration) * 100;
        setLoadingProgress(Math.min(100, progress));
        if (progress >= 100) clearInterval(loadingInterval.current);
      }
    }, 100);

    // Try autoplay
    const playVideo = async () => {
      try {
        await video.play();
        setVideoLoading(false);
      } catch (err) {
        console.warn("Autoplay failed:", err);
        setVideoError(true);
        setVideoLoading(false);
      }
    };

    playVideo();

    return () => clearInterval(loadingInterval.current);
  }, [started, videoError]);

  const handleStart = useCallback(() => {
    localStorage.setItem("seenSplash", "true");
    setStarted(true);
  }, []);

  const handleSkip = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setFadeOut(true);
    setTimeout(() => navigate("/dashboard", { replace: true }), 600);
  }, [navigate, isNavigating]);

  const handleVideoEnd = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    setFadeOut(true);
    setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
  }, [navigate, isNavigating]);

  return (
    <div className={`splash-container ${fadeOut ? "fade-out" : ""}`}>
      {!started ? (
        <div className="splash-overlay">
          <div className="splash-logo-container">
            <h1 className="splash-text">MAITRI</h1>
            <div className="splash-logo-decoration"></div>
          </div>
          <p className="splash-subtext">
            {t("splash.tagline", "Not just a chatbot — a safe, warm space for your well-being.")}
          </p>
          <button className="splash-btn" onClick={handleStart}>
            {t("splash.startButton", "Tap to Start")}
          </button>
        </div>
      ) : videoError ? (
        <div className="splash-overlay">
          <div className="splash-logo-container">
            <h1 className="splash-text">MAITRI</h1>
          </div>
          <p className="splash-subtext">
            {t("splash.welcome", "Welcome — supporting your well-being every step of the way.")}
          </p>
          <button className="splash-btn" onClick={handleSkip}>
            {t("splash.continue", "Continue")}
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="splash-video"
            src={isDesktop ? "/videos/splashd.MP4" : "/videos/splash.MP4"}
            muted
            playsInline
            autoPlay
            onEnded={handleVideoEnd}
            onError={() => setVideoError(true)}
          />
          {videoLoading && (
            <div className="splash-loading">
              <div className="loading-spinner"></div>
              <div className="loading-progress-bar">
                <div
                  className="loading-progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="loading-text">{t("splash.loading", "Loading...")} {Math.round(loadingProgress)}%</p>
            </div>
          )}
          {videoRef.current && !videoLoading && (
            <button className="skip-btn" onClick={handleSkip}>
              {t("splash.skip", "Skip Intro")} →
            </button>
          )}
        </>
      )}
    </div>
  );
}
