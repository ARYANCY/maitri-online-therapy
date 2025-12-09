import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function ViewResult({
  showModal,
  onClose,
  loadingAssessment,
  assessmentError,
  riskAssessment,
  onRetry,
}) {
  const { t } = useTranslation();
  const [fadeOut, setFadeOut] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (showModal) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (overlayRef.current) {
        overlayRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [showModal]);
  
  const isNetworkError = assessmentError && (
    assessmentError.includes("Network") || 
    assessmentError.includes("network") ||
    assessmentError.includes("connection") ||
    assessmentError.includes("internet")
  );

  useEffect(() => {
    if (!showModal) return;

    const preventRefresh = (e) => {
      if (e && e.type === 'submit') {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        return false;
      }
    };

    document.addEventListener('submit', preventRefresh, true);

    return () => {
      document.removeEventListener('submit', preventRefresh, true);
    };
  }, [showModal]);

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFadeOut(true);
    setTimeout(() => {
      onClose();
      setFadeOut(false);
    }, 300);
  };

  const getRiskLevelStyle = () => {
    if (!riskAssessment) return { color: "#666", emoji: "📊", bgGradient: "linear-gradient(135deg, #f3f4f6, #e5e7eb)" };
    
    const level = riskAssessment.riskLevel || "low";
    if (level === "high") {
      return {
        color: "#ef4444",
        emoji: "⚠️",
        message: t("dementia.riskLevelHigh", "High Risk"),
        bgGradient: "linear-gradient(135deg, #fee2e2, #fecaca)",
        borderColor: "#ef4444"
      };
    } else if (level === "moderate") {
      return {
        color: "#f59e0b",
        emoji: "⚡",
        message: t("dementia.riskLevelModerate", "Moderate Risk"),
        bgGradient: "linear-gradient(135deg, #fef3c7, #fde68a)",
        borderColor: "#f59e0b"
      };
    } else {
      return {
        color: "#22c55e",
        emoji: "✅",
        message: t("dementia.riskLevelLow", "Low Risk"),
        bgGradient: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        borderColor: "#22c55e"
      };
    }
  };

  const riskStyle = getRiskLevelStyle();
  const riskScorePercent = riskAssessment && typeof riskAssessment.riskScore === 'number' 
    ? Math.round(Math.max(0, Math.min(1, riskAssessment.riskScore)) * 100)
    : 0;

  const formatAgeGroup = () => {
    const raw = riskAssessment?.ageGroup || riskAssessment?.gameResults?.[0]?.ageGroup;
    if (!raw) return t("dementia.unknown", "Unknown");
    return raw.toString().split("/")[0].trim();
  };

  if (!showModal) return null;

  return (
    <div
      ref={overlayRef}
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 10020,
        padding: '1rem',
        transition: 'opacity 0.2s ease',
        opacity: fadeOut ? 0 : 1,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose(e);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-modal-title"
    >
      <div 
        className="card shadow border-0"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          background: "white",
          zIndex: 10021
        }}
      >
        <button
          type="button"
          className="btn-close position-absolute"
          onClick={handleClose}
          aria-label={t("dementia.close", "Close")}
          style={{
            top: "1rem",
            right: "1rem",
            zIndex: 10,
            width: "32px",
            height: "32px",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            fontWeight: "bold",
            borderRadius: "50%"
          }}
        >
          ×
        </button>

        {loadingAssessment ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ padding: "3rem 2rem", minHeight: "360px" }}>
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h2 className="h4 mb-2 fw-bold text-primary">
              {t("dementia.calculatingAssessment", "Calculating assessment...")}
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
              {t("dementia.pleaseWait", "Please wait while we analyze your results...")}
            </p>
          </div>
        ) : assessmentError ? (
          <div style={{ 
            padding: "3rem 2rem", 
            textAlign: "center", 
            minHeight: "400px",
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center mb-4"
              style={{
                background: "linear-gradient(135deg, #ef444420, #ef444410)",
                border: "4px solid #ef444440",
                width: "120px",
                height: "120px"
              }}
            >
              <div style={{ fontSize: "64px" }}>
                {isNetworkError ? "🌐" : "⚠️"}
              </div>
            </div>
            <h2 className="h3 mb-3 fw-bold" style={{ color: "#ef4444" }}>
              {t("dementia.error", "Error")}
            </h2>
            <div 
              className="rounded p-3 mb-4"
              style={{
                background: "linear-gradient(135deg, #ef444415, #ef444408)",
                border: "2px solid #ef444430",
                color: "#ef4444",
                maxWidth: "90%",
                fontSize: "0.95rem",
                lineHeight: 1.6
              }}
            >
              {assessmentError}
            </div>
            <div className="d-flex gap-3" style={{ width: "100%", maxWidth: "400px" }}>
              {isNetworkError && onRetry && typeof onRetry === 'function' && (
                <button
                  type="button"
                  className="btn btn-primary flex-fill"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      onRetry(e);
                    } catch (err) {
                      console.error("[ViewResult] Error in onRetry:", err);
                    }
                  }}
                  style={{ 
                    borderRadius: "12px",
                    padding: "0.875rem",
                    fontWeight: 600
                  }}
                >
                  🔄 {t("dementia.retry", "Retry")}
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary flex-fill"
                onClick={handleClose}
                style={{ 
                  borderRadius: "12px",
                  padding: "0.875rem",
                  fontWeight: 600
                }}
              >
                {t("dementia.close", "Close")}
              </button>
            </div>
          </div>
        ) : riskAssessment && riskAssessment.success !== false && typeof riskAssessment.riskScore === 'number' ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <div 
              className="text-center p-4"
              style={{
                background: riskStyle.bgGradient,
                borderBottom: `4px solid ${riskStyle.borderColor}`,
                position: "relative"
              }}
            >
              <div 
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  border: `4px solid ${riskStyle.borderColor}`,
                  width: "100px",
                  height: "100px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ fontSize: "56px" }}>
                  {riskStyle.emoji}
                </div>
              </div>
              <h2 className="h3 mb-2 fw-bold" style={{ color: riskStyle.color }}>
                {t("dementia.riskAssessmentResults", "Risk Assessment Results")}
              </h2>
              <div 
                className="badge rounded-pill px-4 py-2"
                style={{
                  background: riskStyle.color,
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 600
                }}
              >
                {riskStyle.message}
              </div>
            </div>

            <div 
              style={{ 
                flex: "1", 
                overflowY: "auto", 
                overflowX: "hidden",
                minHeight: 0, 
                padding: "2rem",
                background: "#f8fafc"
              }}
            >
              <div className="row g-3 mb-4">
                <div className="col-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px", background: "white" }}>
                    <div className="card-body text-center p-4">
                      <div className="fs-1 mb-2">📊</div>
                      <div className="text-muted small mb-2">{t("dementia.riskScore", "Risk Score")}</div>
                      <div className="h2 mb-0 fw-bold" style={{ color: riskStyle.color }}>
                        {riskScorePercent}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px", background: "white" }}>
                    <div className="card-body text-center p-4">
                      <div className="fs-1 mb-2">🎯</div>
                      <div className="text-muted small mb-2">{t("dementia.riskLevel", "Risk Level")}</div>
                      <div className="h4 mb-0 fw-bold" style={{ color: riskStyle.color }}>
                        {riskAssessment.riskLevel ? riskAssessment.riskLevel.charAt(0).toUpperCase() + riskAssessment.riskLevel.slice(1) : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-4">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px", background: "white" }}>
                    <div className="card-body text-center p-4">
                      <div className="fs-1 mb-2">📅</div>
                      <div className="text-muted small mb-2">{t("dementia.profile", "Profile")}</div>
                      <div className="h6 mb-1 fw-bold text-primary">
                        {formatAgeGroup()}
                      </div>
                      <div className="text-muted small">
                        {t("dementia.gamesAnalyzed", "Games analyzed")}: {riskAssessment.gameResults?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {riskAssessment.explanation && (
                <div 
                  className="card border-0 shadow-sm mb-4"
                  style={{ 
                    borderRadius: "16px",
                    background: "white",
                    borderLeft: `4px solid ${riskStyle.borderColor}`
                  }}
                >
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">📝 Assessment Summary</h5>
                    <p className="text-muted mb-0" style={{ lineHeight: 1.7 }}>
                      {riskAssessment.explanation}
                    </p>
                  </div>
                </div>
              )}

              {riskAssessment.cognitiveMetrics?.cognitiveDomains && (
                <div 
                  className="card border-0 shadow-sm mb-4"
                  style={{ borderRadius: "16px", background: "white" }}
                >
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      🧠 {t("dementia.cognitiveDomains", "Cognitive Domain Scores")}
                    </h5>
                    <div className="row g-3">
                      {Object.entries(riskAssessment.cognitiveMetrics.cognitiveDomains).filter(([key, score]) => 
                        !['domainWeights', 'weightedRiskScore'].includes(key) &&
                        typeof score === 'number' &&
                        !isNaN(score) &&
                        score > 0
                      ).map(([domain, score]) => {
                        const weight = riskAssessment.cognitiveMetrics.cognitiveDomains.domainWeights?.[domain] || 0;
                        const domainLabels = {
                          memory: t("dementia.domainMemory", "Memory"),
                          language: t("dementia.domainLanguage", "Language"),
                          attention: t("dementia.domainAttention", "Attention"),
                          orientation: t("dementia.domainOrientation", "Orientation"),
                          executive: t("dementia.domainExecutive", "Executive")
                        };
                        const scoreColor = score >= 7 ? "#22c55e" : score >= 5 ? "#f59e0b" : "#ef4444";
                        return (
                          <div key={domain} className="col-12 col-md-6">
                            <div 
                              className="p-3 rounded"
                              style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0"
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-semibold">{domainLabels[domain] || domain}</span>
                                <span className="fw-bold" style={{ color: scoreColor, fontSize: "1.1rem" }}>
                                  {typeof score === 'number' ? score.toFixed(1) : score}
                                </span>
                              </div>
                              <div className="progress" style={{ height: "8px", borderRadius: "10px" }}>
                                <div 
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{ 
                                    width: `${typeof score === 'number' ? Math.max(0, Math.min(100, (score / 10) * 100)) : 0}%`,
                                    background: scoreColor,
                                    borderRadius: "10px"
                                  }}
                                />
                              </div>
                              <div className="text-muted small mt-1">
                                Weight: {(weight * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {riskAssessment.cognitiveMetrics.cognitiveDomains.weightedRiskScore !== undefined && (
                      <div 
                        className="mt-3 p-3 rounded"
                        style={{
                          background: "linear-gradient(135deg, #8b5cf610, #3b82f610)",
                          border: "2px solid #8b5cf6"
                        }}
                      >
                        <div className="fw-bold text-center" style={{ color: "#6b21a8" }}>
                          {t("dementia.weightedRiskScore", "Weighted Risk Score")}: {Math.round(riskAssessment.cognitiveMetrics.cognitiveDomains.weightedRiskScore * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(typeof riskAssessment.averageScore === 'number' || typeof riskAssessment.averageTime === 'number') && (
                <div className="row g-3 mb-4">
                  {typeof riskAssessment.averageScore === 'number' && !isNaN(riskAssessment.averageScore) && (
                    <div className="col-6">
                      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", background: "white" }}>
                        <div className="card-body text-center p-3">
                          <div className="text-muted small mb-1">{t("dementia.averageScore", "Average Score")}</div>
                          <div className="h5 mb-0 fw-bold text-primary">{riskAssessment.averageScore.toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {typeof riskAssessment.averageTime === 'number' && !isNaN(riskAssessment.averageTime) && (
                    <div className="col-6">
                      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", background: "white" }}>
                        <div className="card-body text-center p-3">
                          <div className="text-muted small mb-1">{t("dementia.averageTime", "Average Time")}</div>
                          <div className="h5 mb-0 fw-bold text-info">{Math.round(Math.max(0, riskAssessment.averageTime))}s</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {Array.isArray(riskAssessment.suggestions) && riskAssessment.suggestions.length > 0 && (
                <div 
                  className="card border-0 shadow-sm mb-4"
                  style={{ borderRadius: "16px", background: "white" }}
                >
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      💡 {t("dementia.recommendations", "Recommendations")}
                    </h5>
                    <ul className="mb-0" style={{ paddingLeft: "1.5rem" }}>
                      {riskAssessment.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="mb-2" style={{ lineHeight: 1.6, color: "#475569" }}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div 
                className="card border-0 mb-4"
                style={{ 
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #fff3cd, #ffe69c)",
                  border: "2px solid #ffc107"
                }}
              >
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-2">⚠️ {t("dementia.disclaimer", "Important Disclaimer")}</h6>
                  <p className="mb-0 small" style={{ lineHeight: 1.7, color: "#856404" }}>
                    {t(
                      "dementia.disclaimerText",
                      "This assessment is AI-generated for self-assessment purposes only. It should not be considered a clinical diagnosis. Please consult a licensed healthcare professional for any medical evaluation or concerns."
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-top" style={{ background: "white" }}>
              <button
                type="button"
                className="btn w-100"
                onClick={handleClose}
                style={{ 
                  background: `linear-gradient(135deg, ${riskStyle.color}, ${riskStyle.color}dd)`,
                  color: "white",
                  borderRadius: "12px",
                  padding: "1rem",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  border: "none"
                }}
              >
                {t("dementia.close", "Close")} →
              </button>
            </div>
          </div>
        ) : null}
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
