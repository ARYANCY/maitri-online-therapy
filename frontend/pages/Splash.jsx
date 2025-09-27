import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Splash.css";

export default function Splash() {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [started, setStarted] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let timer;
    if (started && videoRef.current) {
      const onPlay = () => {
        timer = setTimeout(() => navigate("/dashboard"), 12000);
      };
      videoRef.current.addEventListener("play", onPlay, { once: true });

      return () => {
        clearTimeout(timer);
        if (videoRef.current) {
          videoRef.current.removeEventListener("play", onPlay);
        }
      };
    }
  }, [started, navigate]);

  useEffect(() => {
    if (started && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  }, [started]);

  return (
    <div className="splash-container">
      {!started ? (
        <div className="splash-overlay">
          <h1 className="splash-text">MAITRI</h1>
          <p className="splash-subtext">
            Not just a chatbot — a warm, safe space for your well-being.
          </p>
          <button className="splash-btn" onClick={() => setStarted(true)}>
            Tap to Start
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="splash-video"
            autoPlay
            playsInline
          >
            <source
              src={isDesktop ? "/videos/splashd.MP4" : "/videos/splash.MP4"}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          {!isDesktop && (
            <div className="splash-overlay">
              <h1 className="splash-text">
                MAITRI is not just a chatbot—it is a warm, safe space to support your mental well-being.
              </h1>
            </div>
          )}
        </>
      )}
    </div>
  );
}
