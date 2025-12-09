import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function ResultPopup({ score, time, onNext, onRetry, detail = {} }) {
  const { t } = useTranslation();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedTime, setAnimatedTime] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const getPerformanceLevel = () => {
    if (score >= 80)
      return {
        level: "excellent",
        emoji: "🌟",
        color: "#22c55e",
        bgGradient: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        message: t("dementia.performance.excellent", "Excellent performance!"),
        description: t(
          "dementia.performanceDesc.excellent",
          "Outstanding cognitive performance! Keep up the great work."
        ),
      };
    if (score >= 60)
      return {
        level: "good",
        emoji: "👍",
        color: "#3b82f6",
        bgGradient: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
        message: t("dementia.performance.good", "Good performance!"),
        description: t(
          "dementia.performanceDesc.good",
          "Solid performance! You're doing well with your cognitive exercises."
        ),
      };
    if (score >= 40)
      return {
        level: "fair",
        emoji: "💪",
        color: "#f59e0b",
        bgGradient: "linear-gradient(135deg, #fef3c7, #fde68a)",
        message: t("dementia.performance.fair", "Fair performance!"),
        description: t(
          "dementia.performanceDesc.fair",
          "Good effort! Regular practice will help improve your scores."
        ),
      };
    return {
      level: "practice",
      emoji: "📚",
      color: "#ef4444",
      bgGradient: "linear-gradient(135deg, #fee2e2, #fecaca)",
      message: t("dementia.performance.practice", "Keep practicing!"),
      description: t(
        "dementia.performanceDesc.practice",
        "Don't give up! Practice regularly to see improvement."
      ),
    };
  };

  const performance = getPerformanceLevel();

  useEffect(() => {
    setAnimatedScore(0);
    setAnimatedTime(0);
    
    const scoreSteps = 60;
    const timeSteps = 40;
    const scoreStep = score > 0 ? score / scoreSteps : 0;
    const timeStep = time > 0 ? time / timeSteps : 0;

    let scoreCurrent = 0,
      timeCurrent = 0,
      scoreFrame = 0,
      timeFrame = 0;

    const animateScore = () => {
      if (scoreFrame < scoreSteps && score > 0) {
        scoreCurrent = Math.min(score, scoreCurrent + scoreStep);
        setAnimatedScore(Math.round(scoreCurrent));
        scoreFrame++;
        requestAnimationFrame(animateScore);
      } else {
        setAnimatedScore(score);
      }
    };

    const animateTime = () => {
      if (timeFrame < timeSteps && time > 0) {
        timeCurrent = Math.min(time, timeCurrent + timeStep);
        setAnimatedTime(Math.round(timeCurrent));
        timeFrame++;
        requestAnimationFrame(animateTime);
      } else {
        setAnimatedTime(time);
      }
    };

    if (score > 0) {
      animateScore();
    } else {
      setAnimatedScore(0);
    }
    
    if (time > 0) {
      setTimeout(() => animateTime(), 200);
    } else {
      setAnimatedTime(0);
    }
  }, [score, time]);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getAdditionalStats = () => {
    const stats = [];
    if (detail.rounds) stats.push({ label: t("dementia.rounds", "Rounds"), value: detail.rounds, icon: "🔄" });
    if (detail.attempts !== undefined)
      stats.push({ label: t("dementia.attempts", "Attempts"), value: detail.attempts, icon: "🎯" });
    if (detail.correct !== undefined && detail.total !== undefined)
      stats.push({
        label: t("dementia.accuracy", "Accuracy"),
        value: `${Math.round((detail.correct / detail.total) * 100)}%`,
        icon: "✅"
      });
    if (detail.errors !== undefined) stats.push({ label: t("dementia.errors", "Errors"), value: detail.errors, icon: "❌" });
    return stats;
  };

  const additionalStats = getAdditionalStats();

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => {
      if (typeof onNext === 'function') {
        onNext();
      }
    }, 300); 
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'opacity 0.3s ease',
        opacity: fadeOut ? 0 : 1
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className="card shadow-lg border-0 position-relative" 
        style={{
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '24px',
          background: 'white'
        }}
      >
        <button 
          className="btn-close position-absolute top-0 end-0 m-3" 
          onClick={handleClose} 
          aria-label={t("dementia.close", "Close")}
          style={{
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "50%",
            width: "40px",
            height: "40px"
          }}
        />

        <div
          className="text-center p-5"
          style={{
            background: performance.bgGradient,
            borderBottom: `4px solid ${performance.color}`,
            borderRadius: "24px 24px 0 0"
          }}
        >
          <div 
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: `4px solid ${performance.color}`,
              width: "120px",
              height: "120px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
            }}
          >
            <div style={{ fontSize: "72px" }}>
              {performance.emoji}
            </div>
          </div>
          <h2 className="h3 mb-2 fw-bold" style={{ color: performance.color }}>
            {t("dementia.testCompleted", "Test Completed!")}
          </h2>
        </div>

        <div 
          className="card-body p-4" 
          style={{
            flex: '1', 
            display: 'flex', 
            flexDirection: 'column', 
            overflowY: 'auto',
            background: "#f8fafc"
          }}
        >
          <div
            className="alert border-0 mb-4"
            style={{
              background: performance.bgGradient,
              border: `2px solid ${performance.color}40`,
              borderRadius: "16px"
            }}
          >
            <div className="fw-bold mb-2" style={{ color: performance.color, fontSize: "1.1rem" }}>
              {performance.message}
            </div>
            <div className="small" style={{ color: performance.color, opacity: 0.9 }}>
              {performance.description}
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px", background: "white" }}>
                <div className="card-body text-center p-4">
                  <div className="fs-1 mb-2">🎯</div>
                  <div className="text-muted small mb-2">{t("dementia.score", "Score")}</div>
                  <div className="h2 mb-0 fw-bold" style={{ color: performance.color }}>
                    {animatedScore}
                  </div>
                  <div className="text-muted small">{t("dementia.points", "points")}</div>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px", background: "white" }}>
                <div className="card-body text-center p-4">
                  <div className="fs-1 mb-2">⏱️</div>
                  <div className="text-muted small mb-2">{t("dementia.time", "Time")}</div>
                  <div className="h2 mb-0 fw-bold text-primary">{formatTime(animatedTime)}</div>
                  <div className="text-muted small">{t("dementia.totalTime", "total time")}</div>
                </div>
              </div>
            </div>
          </div>

          {additionalStats.length > 0 && (
            <div className="row g-2 mb-4">
              {additionalStats.map((stat, idx) => (
                <div key={idx} className="col-6">
                  <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", background: "white" }}>
                    <div className="card-body text-center p-3">
                      <div className="fs-4 mb-1">{stat.icon}</div>
                      <div className="text-muted small mb-1">{stat.label}</div>
                      <div className="h6 mb-0 fw-bold text-dark">{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="d-flex gap-3 mt-auto">
            {onRetry && typeof onRetry === 'function' && (
              <button
                className="btn btn-outline-secondary btn-lg flex-fill border-0"
                onClick={() => {
                  setFadeOut(true);
                  setTimeout(() => {
                    try {
                      onRetry();
                    } catch (err) {
                      console.error("[ResultPopup] Error in onRetry:", err);
                    }
                    setFadeOut(false);
                  }, 300);
                }}
                style={{ 
                  borderRadius: "16px",
                  padding: "1rem",
                  fontWeight: 600,
                  fontSize: "1rem",
                  transition: "all 0.3s ease"
                }}
              >
                🔄 {t("dementia.retry", "Retry")}
              </button>
            )}
            <button
              className="btn btn-lg border-0 flex-fill"
              onClick={handleClose}
              style={{ 
                background: `linear-gradient(135deg, ${performance.color}, ${performance.color}dd)`,
                color: "white",
                borderRadius: "16px",
                padding: "1rem",
                fontWeight: 600,
                fontSize: "1.1rem"
              }}
            >
              {t("dementia.saveContinue", "Save & Continue")} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
