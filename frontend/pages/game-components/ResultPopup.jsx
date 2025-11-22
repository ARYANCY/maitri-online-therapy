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

  // Animate score and time
  useEffect(() => {
    const scoreSteps = 60;
    const timeSteps = 40;
    const scoreStep = score / scoreSteps;
    const timeStep = time / timeSteps;

    let scoreCurrent = 0,
      timeCurrent = 0,
      scoreFrame = 0,
      timeFrame = 0;

    const animateScore = () => {
      if (scoreFrame < scoreSteps) {
        scoreCurrent = Math.min(score, scoreCurrent + scoreStep);
        setAnimatedScore(Math.round(scoreCurrent));
        scoreFrame++;
        requestAnimationFrame(animateScore);
      } else setAnimatedScore(score);
    };

    const animateTime = () => {
      if (timeFrame < timeSteps) {
        timeCurrent = Math.min(time, timeCurrent + timeStep);
        setAnimatedTime(Math.round(timeCurrent));
        timeFrame++;
        requestAnimationFrame(animateTime);
      } else setAnimatedTime(time);
    };

    animateScore();
    setTimeout(() => animateTime(), 200);
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

  // Close with fade-out
  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => onNext?.(), 300); // match CSS fade duration
  };

  return (
    <div
      className={`result-overlay ${fadeOut ? "fade-out" : "fade-in"}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="result-card">
        <button className="result-close-btn" onClick={handleClose} aria-label={t("dementia.close", "Close")}>
          ×
        </button>

        <div
          className="result-icon"
          style={{
            background: `linear-gradient(135deg, ${performance.color}20, ${performance.color}10)`,
            border: `3px solid ${performance.color}40`,
          }}
        >
          <div className="result-emoji" style={{ fontSize: "64px" }}>
            {performance.emoji}
          </div>
        </div>

        <h2 className="result-title" style={{ color: performance.color }}>
          {t("dementia.testCompleted", "Test Completed!")}
        </h2>

        <div
          className="result-message"
          style={{
            background: `linear-gradient(135deg, ${performance.color}15, ${performance.color}08)`,
            border: `1px solid ${performance.color}30`,
            color: performance.color,
          }}
        >
          <div className="result-message-text">{performance.message}</div>
          <div className="result-message-desc">{performance.description}</div>
        </div>

        <div className="result-stats">
          <div className="stat-box">
            <div className="stat-icon">🎯</div>
            <div className="stat-label">{t("dementia.score", "Score")}</div>
            <div className="stat-value" style={{ color: performance.color }}>
              {animatedScore}
            </div>
            <div className="stat-sublabel">{t("dementia.points", "points")}</div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">⏱️</div>
            <div className="stat-label">{t("dementia.time", "Time")}</div>
            <div className="stat-value">{formatTime(animatedTime)}</div>
            <div className="stat-sublabel">{t("dementia.totalTime", "total time")}</div>
          </div>
        </div>

        {additionalStats.length > 0 && (
          <div className="result-additional-stats">
            {additionalStats.map((stat, idx) => (
              <div key={idx} className="additional-stat-item">
                <div className="additional-stat-label">{stat.label}</div>
                <div className="additional-stat-value">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        <button
          className="result-btn"
          onClick={handleClose}
          style={{ background: `linear-gradient(135deg, ${performance.color}, ${performance.color}dd)` }}
        >
          <span>{t("dementia.saveContinue", "Save & Continue")}</span>
          <span className="result-btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
