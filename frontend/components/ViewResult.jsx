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
      window.scrollTo({ top: 0, behavior: 'auto' });
      if (overlayRef.current) {
        overlayRef.current.scrollTo({ top: 0, behavior: 'auto' });
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
    if (!riskAssessment) return { color: "#666", emoji: "📊" };
    
    const level = riskAssessment.riskLevel || "low";
    if (level === "high") {
      return {
        color: "#ef4444",
        emoji: "⚠️",
        message: t("dementia.riskLevelHigh", "High Risk"),
      };
    } else if (level === "moderate") {
      return {
        color: "#f59e0b",
        emoji: "⚡",
        message: t("dementia.riskLevelModerate", "Moderate Risk"),
      };
    } else {
      return {
        color: "#22c55e",
        emoji: "✅",
        message: t("dementia.riskLevelLow", "Low Risk"),
      };
    }
  };

  const riskStyle = getRiskLevelStyle();
  const riskScorePercent = riskAssessment && typeof riskAssessment.riskScore === 'number' 
    ? Math.round(Math.max(0, Math.min(1, riskAssessment.riskScore)) * 100)
    : 0;

  if (!showModal) return null;

  return (
    <div
      ref={overlayRef}
      className={`result-overlay ${fadeOut ? "fade-out" : "fade-in"}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          handleClose(e);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-modal-title"
      style={{
        alignItems: 'flex-start',
        paddingTop: '2rem'
      }}
    >
      <div 
        className="result-card"
        onClick={(e) => {
          
          if (e.target === e.currentTarget || e.target.closest('.result-close-btn') || e.target.closest('.result-btn')) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          
          if (e.target === e.currentTarget || e.target.closest('.result-close-btn') || e.target.closest('.result-btn')) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{ 
          top: '-68rem',
          maxWidth: "800px",
          width: "90%",
          maxHeight: "166vh",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
        }}
      >
        <button
          type="button"
          className="result-close-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose(e);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label={t("dementia.close", "Close")}
        >
          ×
        </button>

        {loadingAssessment && (
          <div style={{ 
            padding: "2rem", 
            textAlign: "center", 
            height: "100%", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div className="result-icon" style={{
              background: "linear-gradient(135deg, #3b82f620, #3b82f610)",
              border: "3px solid #3b82f640",
              width: "80px",
              height: "80px",
            }}>
              <div style={{ fontSize: "48px" }}>⏳</div>
            </div>
            <h2 className="result-title" style={{ color: "#3b82f6", fontSize: "1.5rem", marginTop: "1rem" }}>
              {t("dementia.calculatingAssessment", "Calculating assessment...")}
            </h2>
            <p style={{ color: "#666", marginTop: "1rem", fontSize: "0.875rem" }}>
              {t("dementia.pleaseWait", "Please wait while we analyze your results...")}
            </p>
            <p style={{ color: "#999", marginTop: "0.5rem", fontSize: "0.75rem", fontStyle: "italic" }}>
              {t("dementia.aiEvaluationNote", "AI evaluation may take up to 2 minutes. Please be patient.")}
            </p>
            <div style={{
              width: "80%",
              maxWidth: "300px",
              height: "4px",
              background: "#e5e7eb",
              borderRadius: "2px",
              marginTop: "1.5rem",
              overflow: "hidden"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                animation: "shimmer 1.5s infinite",
              }} />
            </div>
          </div>
        ) : assessmentError ? (
          <div style={{ 
            padding: "1rem", 
            textAlign: "center", 
            height: "100%", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div className="result-icon" style={{
              background: "linear-gradient(135deg, #ef444420, #ef444410)",
              border: "3px solid #ef444440",
              width: "80px",
              height: "80px",
            }}>
              <div style={{ fontSize: "48px" }}>
                {isNetworkError ? "🌐" : "⚠️"}
              </div>
            </div>
            <h2 className="result-title" style={{ color: "#ef4444", fontSize: "1.5rem", marginTop: "1rem" }}>
              {t("dementia.error", "Error")}
            </h2>
            <div className="result-message" style={{
              background: "linear-gradient(135deg, #ef444415, #ef444408)",
              border: "1px solid #ef444430",
              color: "#ef4444",
              padding: "0.75rem",
              fontSize: "0.875rem",
              marginTop: "1rem",
              maxWidth: "90%"
            }}>
              <div className="result-message-text">{assessmentError}</div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", width: "90%", maxWidth: "400px" }}>
              {isNetworkError && onRetry && (
                <button
                  type="button"
                  className="result-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRetry(e);
                  }}
                  style={{ background: "linear-gradient(135deg, #3b82f6, #3b82f6dd)", flex: 1 }}
                >
                  <span>{t("dementia.retry", "Retry")}</span>
                </button>
              )}
              <button
                type="button"
                className="result-btn"
                onClick={handleClose}
                style={{ background: "linear-gradient(135deg, #6b7280, #6b7280dd)", flex: 1 }}
              >
                <span>{t("dementia.close", "Close")}</span>
              </button>
            </div>
          </div>
        ) : riskAssessment && riskAssessment.success !== false && typeof riskAssessment.riskScore === 'number' ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            
            <div 
              className="result-content-scrollable"
              style={{ 
                flex: "1", 
                overflowY: "auto", 
                overflowX: "hidden",
                minHeight: 0, 
                display: "flex", 
                flexDirection: "column", 
                padding: "1rem",
                gap: "0.75rem"
              }}
            >
              <div className="result-icon" style={{
                background: `linear-gradient(135deg, ${riskStyle.color}20, ${riskStyle.color}10)`,
                border: `3px solid ${riskStyle.color}40`,
                width: "70px",
                height: "70px",
                margin: "0 auto",
                flexShrink: 0
              }}>
                <div className="result-emoji" style={{ fontSize: "40px" }}>
                  {riskStyle.emoji}
                </div>
              </div>

              <h2 className="result-title" style={{ color: riskStyle.color, fontSize: "1.25rem", marginBottom: "0.25rem", flexShrink: 0 }}>
                {t("dementia.riskAssessmentResults", "Risk Assessment Results")}
              </h2>

            <div className="result-message" style={{
              background: `linear-gradient(135deg, ${riskStyle.color}15, ${riskStyle.color}08)`,
              border: `1px solid ${riskStyle.color}30`,
              color: riskStyle.color,
              padding: "0.625rem",
              fontSize: "0.8125rem",
              flexShrink: 0
            }}>
              <div className="result-message-text" style={{ fontWeight: 600, fontSize: "0.875rem" }}>{riskStyle.message}</div>
              <div className="result-message-desc" style={{ fontSize: "0.75rem", marginTop: "0.375rem", lineHeight: "1.4" }}>
                {riskAssessment.explanation || t("dementia.assessmentComplete", "Assessment completed successfully.")}
              </div>
            </div>

            <div className="result-stats" style={{ gap: "0.75rem", justifyContent: "center", flexShrink: 0 }}>
              <div className="stat-box" style={{ padding: "0.625rem", minWidth: "100px" }}>
                <div className="stat-icon" style={{ fontSize: "1.25rem" }}>📊</div>
                <div className="stat-label" style={{ fontSize: "0.7rem" }}>{t("dementia.riskScore", "Risk Score")}</div>
                <div className="stat-value" style={{ color: riskStyle.color, fontSize: "1.25rem" }}>
                  {riskScorePercent}%
                </div>
                <div className="stat-sublabel" style={{ fontSize: "0.65rem" }}>{t("dementia.percentage", "percentage")}</div>
              </div>

              <div className="stat-box" style={{ padding: "0.625rem", minWidth: "100px" }}>
                <div className="stat-icon" style={{ fontSize: "1.25rem" }}>🎯</div>
                <div className="stat-label" style={{ fontSize: "0.7rem" }}>{t("dementia.riskLevel", "Risk Level")}</div>
                <div className="stat-value" style={{ color: riskStyle.color, fontSize: "1.1rem" }}>
                  {riskAssessment.riskLevel ? riskAssessment.riskLevel.charAt(0).toUpperCase() + riskAssessment.riskLevel.slice(1) : "N/A"}
                </div>
                <div className="stat-sublabel" style={{ fontSize: "0.65rem" }}>{t("dementia.level", "level")}</div>
              </div>
            </div>

            
            {riskAssessment.cognitiveMetrics?.cognitiveDomains && (
              <div style={{
                marginBottom: "0.75rem",
                padding: "0.75rem",
                background: "rgba(59, 130, 246, 0.05)",
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                flexShrink: 0
              }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.5rem", color: "#1e40af" }}>
                  🧠 {t("dementia.cognitiveDomains", "Cognitive Domain Scores")}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", fontSize: "0.7rem" }}>
                  {Object.entries(riskAssessment.cognitiveMetrics.cognitiveDomains).filter(([key]) => 
                    !['domainWeights', 'weightedRiskScore'].includes(key)
                  ).map(([domain, score]) => {
                    const weight = riskAssessment.cognitiveMetrics.cognitiveDomains.domainWeights?.[domain] || 0;
                    const domainLabels = {
                      memory: t("dementia.domainMemory", "Memory"),
                      language: t("dementia.domainLanguage", "Language"),
                      attention: t("dementia.domainAttention", "Attention"),
                      orientation: t("dementia.domainOrientation", "Orientation"),
                      executive: t("dementia.domainExecutive", "Executive")
                    };
                    return (
                      <div key={domain} style={{
                        padding: "0.5rem",
                        background: "white",
                        borderRadius: "6px",
                        border: "1px solid rgba(0,0,0,0.1)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                          <span style={{ fontWeight: 500 }}>{domainLabels[domain] || domain}</span>
                          <span style={{ fontWeight: 600, color: score >= 7 ? "#22c55e" : score >= 5 ? "#f59e0b" : "#ef4444" }}>
                            {typeof score === 'number' ? score.toFixed(1) : score}/10
                          </span>
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "#666" }}>
                          Weight: {(weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                {riskAssessment.cognitiveMetrics.cognitiveDomains.weightedRiskScore !== undefined && (
                  <div style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem",
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#6b21a8"
                  }}>
                    {t("dementia.weightedRiskScore", "Weighted Risk Score")}: {Math.round(riskAssessment.cognitiveMetrics.cognitiveDomains.weightedRiskScore * 100)}%
                  </div>
                )}
              </div>
            )}

            {typeof riskAssessment.averageScore === 'number' && !isNaN(riskAssessment.averageScore) && (
              <div className="result-additional-stats" style={{ gap: "0.625rem", marginBottom: "0.375rem", flexShrink: 0 }}>
                <div className="additional-stat-item" style={{ padding: "0.5rem 0.875rem", fontSize: "0.75rem" }}>
                  <div className="additional-stat-label" style={{ fontSize: "0.65rem" }}>{t("dementia.averageScore", "Average Score")}</div>
                  <div className="additional-stat-value" style={{ fontSize: "0.9rem" }}>{riskAssessment.averageScore.toFixed(1)}</div>
                </div>
                {typeof riskAssessment.averageTime === 'number' && !isNaN(riskAssessment.averageTime) && (
                  <div className="additional-stat-item" style={{ padding: "0.5rem 0.875rem", fontSize: "0.75rem" }}>
                    <div className="additional-stat-label" style={{ fontSize: "0.65rem" }}>{t("dementia.averageTime", "Average Time")}</div>
                    <div className="additional-stat-value" style={{ fontSize: "0.9rem" }}>{`${Math.round(Math.max(0, riskAssessment.averageTime))}s`}</div>
                  </div>
                )}
              </div>
            )}

            {Array.isArray(riskAssessment.suggestions) && riskAssessment.suggestions.length > 0 && (
              <div style={{
                marginBottom: "0.375rem",
                padding: "0.625rem",
                background: "rgba(0, 0, 0, 0.02)",
                borderRadius: "8px",
                textAlign: "left",
                flexShrink: 0
              }}>
                <h3 style={{ fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.375rem", color: "#333" }}>
                  {t("dementia.recommendations", "Recommendations")}
                </h3>
                <ul style={{ margin: 0, paddingLeft: "0.875rem", fontSize: "0.65rem", lineHeight: "1.4" }}>
                  {riskAssessment.suggestions.map((suggestion, idx) => (
                    <li key={idx} style={{ marginBottom: "0.25rem", color: "#666" }}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

              
              {riskAssessment.cognitiveMetrics?.cognitiveDomains && (
                <div style={{
                  padding: "0.625rem",
                  marginBottom: "0.375rem",
                  borderRadius: "8px",
                  backgroundColor: "#e7f3ff",
                  border: "1px solid #b3d9ff",
                  fontSize: "0.7rem",
                  color: "#004085",
                  textAlign: "left",
                  lineHeight: "1.4",
                  flexShrink: 0
                }}>
                  <strong style={{ fontSize: "0.75rem" }}>📊 {t("dementia.assessmentMethodology", "Assessment Methodology")}:</strong>
                  <div style={{ fontSize: "0.6875rem", marginTop: "0.25rem" }}>
                    {t("dementia.methodologyText", "Scores calculated using weighted cognitive domain model. Games map to specific cognitive domains (Memory, Language, Attention, Orientation, Executive) with clinical justification. Scores normalized by difficulty level for fair comparison.")}
                  </div>
                </div>
              )}

              <div style={{
                padding: "0.625rem",
                marginBottom: "0.375rem",
                borderRadius: "8px",
                backgroundColor: "#fff3cd",
                border: "2px solid #ffc107",
                fontSize: "0.7rem",
                color: "#856404",
                textAlign: "left",
                lineHeight: "1.4",
                flexShrink: 0
              }}>
                <strong style={{ fontSize: "0.75rem" }}>⚠️ {t("dementia.disclaimer", "Important Disclaimer")}:</strong>{" "}
                <span style={{ fontSize: "0.6875rem" }}>
                  {t(
                    "dementia.disclaimerText",
                    "This assessment is AI-generated for self-assessment purposes only. It should not be considered a clinical diagnosis. Please consult a licensed healthcare professional for any medical evaluation or concerns."
                  )}
                </span>
              </div>
            </div>

            
            <button
              type="button"
              className="result-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose(e);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{ 
                background: `linear-gradient(135deg, ${riskStyle.color}, ${riskStyle.color}dd)`,
                marginTop: "0.5rem",
                flexShrink: 0,
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem"
              }}
            >
              <span>{t("dementia.close", "Close")}</span>
              <span className="result-btn-arrow">→</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
