import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../css/game/ResultPopup.css";

export default function ResultPopup({ score, time, onNext, detail = {} }) {
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
    if (detail.rounds) stats.push({ label: t("dementia.rounds", "Rounds"), value: detail.rounds });
    if (detail.attempts !== undefined)
      stats.push({ label: t("dementia.attempts", "Attempts"), value: detail.attempts });
    if (detail.correct !== undefined && detail.total !== undefined)
      stats.push({
        label: t("dementia.accuracy", "Accuracy"),
        value: `${Math.round((detail.correct / detail.total) * 100)}%`,
      });
    if (detail.errors !== undefined) stats.push({ label: t("dementia.errors", "Errors"), value: detail.errors });
    return stats;
  };

  const additionalStats = getAdditionalStats();

  
  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => onNext?.(), 300); 
  };

  return (
    <div
      className={`position-absolute top-0 start-0 w-100 d-flex align-items-center justify-content-center p-3 ${fadeOut ? "fade-out" : "fade-in"}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        overscrollBehavior: 'none',
        scrollBehavior: 'auto',
        borderRadius: '8px',
        minHeight: '100%',
        padding: '2rem 1rem'
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="card shadow-lg border-0 position-relative result-popup-card" style={{
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '12px'
      }}>
        <button 
          className="btn-close position-absolute top-0 end-0 m-3" 
          onClick={handleClose} 
          aria-label={t("dementia.close", "Close")}
          style={{zIndex: 10}}
        ></button>

        <div
          className="text-center p-4"
          style={{
            background: `linear-gradient(135deg, ${performance.color}20, ${performance.color}10)`,
            border: `3px solid ${performance.color}40`,
          }}
        >
          <div className="result-emoji" style={{ fontSize: "64px" }}>
            {performance.emoji}
          </div>
        </div>

        <div className="card-body text-center p-4" style={{flex: '1', display: 'flex', flexDirection: 'column', overflowY: 'auto', overscrollBehavior: 'none', scrollBehavior: 'auto'}}>
          <h2 className="h4 mb-3 fw-bold" style={{ color: performance.color }}>
            {t("dementia.testCompleted", "Test Completed!")}
          </h2>

          <div
            className="alert mb-4"
            style={{
              background: `linear-gradient(135deg, ${performance.color}15, ${performance.color}08)`,
              border: `1px solid ${performance.color}30`,
              color: performance.color,
            }}
          >
            <div className="fw-bold mb-2">{performance.message}</div>
            <div className="small">{performance.description}</div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card border-0 bg-light">
                <div className="card-body text-center">
                  <div className="fs-3 mb-2">🎯</div>
                  <div className="small text-muted mb-1">{t("dementia.score", "Score")}</div>
                  <div className="h4 mb-0 fw-bold" style={{ color: performance.color }}>
                    {animatedScore}
                  </div>
                  <div className="small text-muted">{t("dementia.points", "points")}</div>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div className="card border-0 bg-light">
                <div className="card-body text-center">
                  <div className="fs-3 mb-2">⏱️</div>
                  <div className="small text-muted mb-1">{t("dementia.time", "Time")}</div>
                  <div className="h4 mb-0 fw-bold">{formatTime(animatedTime)}</div>
                  <div className="small text-muted">{t("dementia.totalTime", "total time")}</div>
                </div>
              </div>
            </div>
          </div>

          {additionalStats.length > 0 && (
            <div className="row g-2 mb-4">
              {additionalStats.map((stat, idx) => (
                <div key={idx} className="col-6">
                  <div className="card border-0 bg-light">
                    <div className="card-body text-center p-2">
                      <div className="small text-muted mb-1">{stat.label}</div>
                      <div className="h6 mb-0 fw-bold">{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-primary w-100 btn-lg"
            onClick={handleClose}
            style={{ background: `linear-gradient(135deg, ${performance.color}, ${performance.color}dd)` }}
          >
            {t("dementia.saveContinue", "Save & Continue")} →
          </button>
        </div>
      </div>
    </div>
  );
}
