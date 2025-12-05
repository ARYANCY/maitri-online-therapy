import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ColorSequence from "./game-components/ColorSequence";
import DigitSpan from "./game-components/DigitSpan";
import Memory from "./game-components/MemoryMatch";
import NBack from "./game-components/NBack";
import ReactionTime from "./game-components/ReactionTimeTest";
import StroopTest from "./game-components/StroopTest";
import PatternRecall from "./game-components/PatternRecall";
import ClockDrawing from "./game-components/ClockDrawing";
import GameInstructions from "../components/GameInstructions";
import ViewResult from "../components/ViewResult";
import GameKeyboardShortcuts from "../components/GameKeyboardShortcuts";
import API from "../utils/axiosClient";

const LS_PROGRESS = "mini_game_progress";
const LS_ASSESSMENT = "mini_game_assessment";
const MIN_GAMES_FOR_ASSESSMENT = 5;

const generateResultsHash = (results) => {
  if (!results || results.length === 0) return null;
  const lastNGames = results.slice(-MIN_GAMES_FOR_ASSESSMENT);
  const hashData = lastNGames.map(r => ({
    key: r.key,
    score: r.score || 0,
    time: r.time || 0,
    timestamp: r.timestamp || 0
  }));
  return JSON.stringify(hashData);
};

const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.error || new Error("Unknown error"));
      console.error("Game Error:", event.error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return fallback || <div className="error-message">Something went wrong. Please refresh the page.</div>;
  }

  return children;
};

export default function Game({ onDataUpdate }) {
  const { t } = useTranslation();
  
  const lastDataUpdateRef = useRef(0);
  const isSubmittingRef = useRef(false);
  
  const [current, setCurrent] = useState(null);
  const [results, setResults] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_PROGRESS);
      return stored ? JSON.parse(stored).results || [] : [];
    } catch (err) {
      console.warn("Failed to load progress:", err);
      return [];
    }
  });
  const [completedKeys, setCompletedKeys] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_PROGRESS);
      return stored ? JSON.parse(stored).completed || [] : [];
    } catch (err) {
      console.warn("Failed to load completed games:", err);
      return [];
    }
  });
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [assessmentError, setAssessmentError] = useState(null);

  useEffect(() => {
    if (showInstructions) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showInstructions]);

  useEffect(() => {
    if (current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [current]);

  const games = useMemo(() => {
    return [
      {
        key: "color_sequence",
        component: ColorSequence,
        i18nKey: "colorSequence",
      },
      {
        key: "digit_span",
        component: DigitSpan,
        i18nKey: "digitSpan",
      },
      {
        key: "memory",
        component: Memory,
        i18nKey: "memory",
      },
      {
        key: "n_back",
        component: NBack,
        i18nKey: "nBack",
      },
      {
        key: "reaction_time",
        component: ReactionTime,
        i18nKey: "reactionTime",
      },
      {
        key: "stroop_test",
        component: StroopTest,
        i18nKey: "stroopTest",
      },
      {
        key: "pattern_recall",
        component: PatternRecall,
        i18nKey: "patternRecall",
      },
      {
        key: "clock_drawing",
        component: ClockDrawing,
        i18nKey: "clockDrawing",
      },
    ];
  }, []);
  
  const getGameTitle = useCallback((game) => {
    const titles = {
      color_sequence: t("dementia.games.colorSequence", "Color Sequence"),
      digit_span: t("dementia.games.digitSpan", "Digit Span"),
      memory: t("dementia.games.memory", "Memory Match"),
      n_back: t("dementia.games.nBack", "N-Back"),
      reaction_time: t("dementia.games.reactionTime", "Reaction Time"),
      stroop_test: t("dementia.games.stroopTest", "Stroop Test"),
      pattern_recall: t("dementia.games.patternRecall", "Pattern Recall"),
      clock_drawing: t("dementia.games.clockDrawing", "Clock Drawing"),
    };
    return titles[game.key] || game.key;
  }, [t]);
  
  const getGameIcon = useCallback((game) => {
    const icons = {
      color_sequence: "🎨",
      digit_span: "🔢",
      memory: "🧩",
      n_back: "🔄",
      reaction_time: "⚡",
      stroop_test: "🎯",
      pattern_recall: "🔁",
      clock_drawing: "🕐",
    };
    return icons[game.key] || "🎮";
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_PROGRESS,
        JSON.stringify({ results, completed: completedKeys })
      );
    } catch (err) {
      console.warn("Failed to save progress:", err);
    }
  }, [results, completedKeys]);

  const handleExit = useCallback(() => {
    setCurrent(null);
    setSelectedGame(null);
    setShowInstructions(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && current) {
        handleExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, handleExit]);

  const handleFinish = useCallback(
    (payload) => {
      try {
        if (!payload || typeof payload !== 'object') {
          console.warn("[Game] Invalid finish payload:", payload);
          return;
        }

        const key = payload?.key || current?.key;
        if (!key || typeof key !== 'string') {
          console.warn("[Game] No valid game key provided in finish payload");
          return;
        }

        const score = typeof payload?.score === 'number' ? Math.max(0, payload.score) : 0;
        const detail = payload?.detail && typeof payload.detail === 'object' ? payload.detail : null;
        const time = typeof payload?.time === 'number' 
          ? Math.max(0, payload.time) 
          : (detail && typeof detail.time === 'number' ? Math.max(0, detail.time) : 0);
        
        const found = games.find((g) => g.key === key);
        const title = found ? getGameTitle(found) : key || "Game";

        const resultEntry = {
          key,
          title,
          score,
          time,
          detail,
          timestamp: Date.now(),
        };

        setResults((prev) => {
          const newResults = [...prev, resultEntry];
          try {
            localStorage.removeItem(LS_ASSESSMENT);
          } catch (err) {
            console.warn("[Game] Failed to clear assessment cache:", err);
          }
          return newResults;
        });
        setCompletedKeys((prev) => Array.from(new Set([...prev, key])));
        setCurrent(null);
      } catch (err) {
        console.error("[Game] Error handling game finish:", err);
      }
    },
    [current, games, getGameTitle]
  );

  const resetProgress = useCallback(() => {
    if (
      window.confirm(
        t("dementia.confirmReset", "Are you sure you want to reset all progress?")
      )
    ) {
      setResults([]);
      setCompletedKeys([]);
      setRiskAssessment(null);
      try {
        localStorage.removeItem(LS_PROGRESS);
        localStorage.removeItem(LS_ASSESSMENT);
      } catch (err) {
        console.warn("Failed to clear progress:", err);
      }
    }
  }, [t]);

  const currentConf = current ? games.find((g) => g.key === current.key) : null;
  const CurrentComp = currentConf?.component || null;
  const canViewResults = results.length >= MIN_GAMES_FOR_ASSESSMENT;

  const handleViewResults = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isSubmittingRef.current) {
      return;
    }

    if (results.length < MIN_GAMES_FOR_ASSESSMENT) {
      setLoadingAssessment(false);
      setShowResultsModal(true);
      setAssessmentError(
        t("dementia.needMoreGames", {
          count: MIN_GAMES_FOR_ASSESSMENT,
          defaultValue: `Please complete at least ${MIN_GAMES_FOR_ASSESSMENT} games to view results.`
        })
      );
      return;
    }

    isSubmittingRef.current = true;
    setLoadingAssessment(true);
    setShowResultsModal(true);
    setAssessmentError(null);

    try {
      const gameResults = results.slice(-MIN_GAMES_FOR_ASSESSMENT).map((r) => ({
        key: r.key,
        title: r.title,
        score: r.score || 0,
        time: r.time || 0,
        detail: r.detail || {},
      }));

      const resultsHash = generateResultsHash(results);
      
      let cachedAssessment = null;
      try {
        const cached = localStorage.getItem(LS_ASSESSMENT);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.resultsHash === resultsHash && parsed.assessment) {
            cachedAssessment = parsed.assessment;
          }
        }
      } catch (err) {
        console.warn("[Game] Failed to read cached assessment:", err);
      }

      if (cachedAssessment) {
        setRiskAssessment(cachedAssessment);
        setLoadingAssessment(false);
        isSubmittingRef.current = false;
        return;
      }

      const response = await API.dementia.submitGameResults({ gameResults });
      
      const responseData = response?.data || response;
      
      if (response && response.success === true && responseData) {
        const riskScore = typeof responseData.riskScore === 'number' ? Math.max(0, Math.min(1, responseData.riskScore)) : 0;
        const assessmentData = {
          success: true,
          sessionId: responseData.sessionId || null,
          riskScore: riskScore,
          riskLevel: responseData.riskLevel && ['low', 'moderate', 'high'].includes(responseData.riskLevel) ? responseData.riskLevel : "low",
          explanation: responseData.explanation ? String(responseData.explanation) : "",
          suggestions: Array.isArray(responseData.suggestions) ? responseData.suggestions.map(String) : [],
          gameResults: Array.isArray(responseData.gameResults) ? responseData.gameResults : gameResults,
          averageScore: typeof responseData.averageScore === 'number' ? responseData.averageScore : 0,
          averageTime: typeof responseData.averageTime === 'number' ? responseData.averageTime : 0,
          cognitiveMetrics: responseData.cognitiveMetrics || null,
          cognitiveDomains: responseData.cognitiveMetrics?.cognitiveDomains || null,
        };
        setRiskAssessment(assessmentData);
        setAssessmentError(null);
        setLoadingAssessment(false);

        try {
          localStorage.setItem(LS_ASSESSMENT, JSON.stringify({
            resultsHash: resultsHash,
            assessment: assessmentData,
            timestamp: Date.now()
          }));
        } catch (err) {
          console.warn("[Game] Failed to cache assessment:", err);
        }

      } else {
        const errorMsg = response?.error || responseData?.error || "Invalid response from server. Missing assessment data.";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("[Game] Error in handleViewResults:", error);
      let errorMessage = t("dementia.failedAssessment", "Failed to generate assessment");
      
      if (error.message === "Network Error" || error.code === "ERR_NETWORK" || error.message?.includes("Network") || error.code === "ECONNABORTED") {
        errorMessage = t("dementia.networkError", "Network connection error. Please check your internet connection and try again.");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setAssessmentError(errorMessage);
      setRiskAssessment(null);
      setLoadingAssessment(false);
    } finally {
      isSubmittingRef.current = false;
    }
  }, [results, t]);

  const handleGameClick = useCallback((game) => {
    setSelectedGame(game);
    setShowInstructions(true);
  }, []);

  const handleStartGame = useCallback(() => {
    if (selectedGame) {
      setShowInstructions(false);
      setSelectedGame(null);
      setCurrent({ key: selectedGame.key });
    }
  }, [selectedGame]);

  const handleCloseInstructions = useCallback(() => {
    setShowInstructions(false);
    setSelectedGame(null);
  }, []);

  const closeResultsModal = useCallback(() => {
    setShowResultsModal(false);
    setAssessmentError(null);
    
    if (onDataUpdate) {
      const now = Date.now();
      if (now - lastDataUpdateRef.current > 1000) {
        lastDataUpdateRef.current = now;
        setTimeout(() => {
          try {
            if (onDataUpdate) onDataUpdate();
          } catch (err) {
            console.warn("[Game] Error calling onDataUpdate:", err);
          }
        }, 300);
      }
    }
  }, [onDataUpdate]);

  if (!t || !games || games.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh", padding: "3rem" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-4" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading games...</span>
          </div>
          <p className="text-muted fs-5 mt-3">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh", padding: "3rem" }}>
          <div className="text-center">
            <div className="alert alert-danger shadow-sm" role="alert" style={{ maxWidth: "500px" }}>
              <h4 className="alert-heading">⚠️ Error Loading Games</h4>
              <p className="mb-3">Something went wrong. Please refresh the page.</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="container-fluid py-5" style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {!current && (
          <>
            {/* Hero Header Section */}
            <div className="text-center mb-5">
              <div className="mb-4">
                <h1 className="display-4 fw-bold mb-3" style={{ 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>
                  {t("dementia.title", "Cognitive Games")}
                </h1>
                <p className="lead text-muted mb-4">
                  {t("dementia.subtitle", "Assess and improve your cognitive abilities through engaging games")}
                </p>
              </div>
              
              {/* Stats Bar */}
              <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap mb-4">
                <div className="card border-0 shadow-sm" style={{ 
                  background: "linear-gradient(135deg, #667eea15, #764ba215)",
                  borderRadius: "16px",
                  padding: "1rem 2rem",
                  minWidth: "200px"
                }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="fs-1">📊</div>
                    <div className="text-start">
                      <div className="text-muted small">Games Completed</div>
                      <div className="h4 mb-0 fw-bold text-primary">{results.length}</div>
                    </div>
                  </div>
                </div>
                
                {canViewResults ? (
                  <button
                    type="button"
                    className="btn btn-lg shadow-sm"
                    onClick={handleViewResults}
                    disabled={loadingAssessment || isSubmittingRef.current}
                    style={{
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "0.875rem 2rem",
                      fontWeight: 600,
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 8px 20px rgba(34, 197, 94, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    {loadingAssessment ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {t("dementia.calculating", "Calculating...")}
                      </>
                    ) : (
                      <>
                        📈 {t("dementia.viewResults", "View Results")}
                      </>
                    )}
                  </button>
                ) : results.length > 0 && (
                  <div className="card border-0 shadow-sm bg-warning bg-opacity-10" style={{ 
                    borderRadius: "16px",
                    padding: "1rem 2rem",
                    minWidth: "250px"
                  }}>
                    <div className="text-warning-emphasis fw-semibold">
                      {t("dementia.gamesRemaining", { count: MIN_GAMES_FOR_ASSESSMENT - results.length })}{" "}
                      {t("dementia.gamesRemainingText", "more games needed")}
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  className="btn btn-outline-danger btn-lg shadow-sm"
                  onClick={resetProgress}
                  style={{ 
                    borderRadius: "12px",
                    padding: "0.875rem 2rem",
                    fontWeight: 600
                  }}
                >
                  🔄 {t("dementia.reset", "Reset")}
                </button>
              </div>
            </div>

            {/* Disclaimer Card */}
            <div className="card border-0 shadow-sm mb-5" style={{ 
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              borderRadius: "16px",
              border: "2px solid #fbbf24"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="fs-1">⚠️</div>
                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-3 text-dark">Important Disclaimer</h5>
                    <p className="mb-2 small text-dark" style={{ lineHeight: 1.7 }}>
                      <strong>Assessment Purpose:</strong> These cognitive assessments are designed for screening and self-assessment purposes only. They are based on validated neuropsychological testing paradigms but are NOT intended to replace professional medical evaluation, diagnosis, or treatment.
                    </p>
                    <p className="mb-2 small text-dark" style={{ lineHeight: 1.7 }}>
                      <strong>Clinical Interpretation:</strong> Results should be interpreted by qualified healthcare professionals in conjunction with comprehensive clinical assessment, medical history, and appropriate diagnostic testing.
                    </p>
                    <p className="mb-0 small text-dark" style={{ lineHeight: 1.7 }}>
                      <strong>Not a Diagnosis:</strong> The platform does not provide medical diagnosis, treatment recommendations, or clinical decision-making support. Always consult licensed healthcare professionals for any medical concerns.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Games Grid */}
            <div className="row g-4 mb-5">
              {games.map((g) => (
                <div key={g.key} className="col-12 col-md-6 col-lg-4 col-xl-3">
                  <div 
                    className="card h-100 border-0 shadow-sm"
                    style={{
                      borderRadius: "20px",
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                      background: completedKeys.includes(g.key) 
                        ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" 
                        : "linear-gradient(135deg, #ffffff, #f8fafc)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div className="card-body d-flex flex-column p-4">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="fs-1" style={{ lineHeight: 1 }}>
                          {getGameIcon(g)}
                        </div>
                        {completedKeys.includes(g.key) && (
                          <span className="badge rounded-pill" style={{
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            color: "white",
                            padding: "0.5rem 1rem",
                            fontSize: "0.75rem",
                            fontWeight: 600
                          }}>
                            ✓ {t("dementia.completed", "Completed")}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="h5 mb-3 fw-bold" style={{ color: "#1e293b" }}>
                        {getGameTitle(g)}
                      </h4>
                      
                      <p className="text-muted mb-4 flex-grow-1 small" style={{ lineHeight: 1.6 }}>
                        {t(`dementia.games.descriptions.${g.i18nKey || g.key}`, "Test your cognitive abilities with this engaging game.")}
                      </p>
                      
                      <button
                        type="button"
                        className="btn w-100 mt-auto border-0"
                        onClick={() => handleGameClick(g)}
                        style={{
                          background: completedKeys.includes(g.key)
                            ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                            : "linear-gradient(135deg, #667eea, #764ba2)",
                          color: "white",
                          borderRadius: "12px",
                          padding: "0.875rem",
                          fontWeight: 600,
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        {completedKeys.includes(g.key) ? "🔄 " : "▶️ "}
                        {t("dementia.play", "Play")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Information Cards */}
            <div className="row g-4 mb-5">
              <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                  <div className="card-header border-0 bg-primary text-white" style={{ 
                    borderRadius: "20px 20px 0 0",
                    padding: "1.5rem"
                  }}>
                    <h3 className="h5 mb-0 fw-bold">
                      📊 {t("dementia.howScoringWorks", "How Results Are Scored & Evaluated")}
                    </h3>
                  </div>
                  <div className="card-body p-4">
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">Game-Based Assessment Scoring</h6>
                      <p className="small text-muted mb-3" style={{ lineHeight: 1.7 }}>
                        Cognitive metrics are calculated from your performance in various cognitive games. Each game is designed to assess specific cognitive domains based on validated neuropsychological testing paradigms.
                      </p>
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">Weighted Risk Score Calculation</h6>
                      <p className="small text-muted mb-0" style={{ lineHeight: 1.7 }}>
                        The final cognitive risk score uses a weighted domain model: Memory (30%), Language (20%), Attention (20%), Orientation (15%), Executive Function (15%).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                  <div className="card-header border-0 bg-success text-white" style={{ 
                    borderRadius: "20px 20px 0 0",
                    padding: "1.5rem"
                  }}>
                    <h3 className="h5 mb-0 fw-bold">
                      🎮 {t("dementia.whatEachGameTests", "What Each Game Tests")}
                    </h3>
                  </div>
                  <div className="card-body p-4">
                    <div className="small" style={{ maxHeight: "400px", overflowY: "auto" }}>
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">🔢 Digit Span</h6>
                        <p className="text-muted mb-1 small">Tests working memory capacity</p>
                        <span className="badge bg-info text-dark me-1">Memory (80%)</span>
                        <span className="badge bg-secondary">Attention (20%)</span>
                      </div>
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">🧩 Memory Match</h6>
                        <p className="text-muted mb-1 small">Assesses associative memory</p>
                        <span className="badge bg-info text-dark me-1">Memory (75%)</span>
                        <span className="badge bg-secondary">Executive (25%)</span>
                      </div>
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">🎯 Stroop Test</h6>
                        <p className="text-muted mb-1 small">Assesses cognitive flexibility</p>
                        <span className="badge bg-info text-dark me-1">Executive (80%)</span>
                        <span className="badge bg-secondary">Attention (20%)</span>
                      </div>
                      <div className="mb-0">
                        <h6 className="fw-bold mb-1">🕐 Clock Drawing</h6>
                        <p className="text-muted mb-1 small">Tests multiple cognitive domains</p>
                        <span className="badge bg-info text-dark me-1">Executive (50%)</span>
                        <span className="badge bg-secondary">Orientation (30%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showInstructions && selectedGame && (
          <GameInstructions
            gameKey={selectedGame.i18nKey || selectedGame.key}
            onClose={handleCloseInstructions}
            onStart={handleStartGame}
          />
        )}

        {CurrentComp && current && (
          <div className="game-container">
            <GameKeyboardShortcuts show={true} />
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
              <div className="card-header border-0 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                borderRadius: "20px 20px 0 0",
                padding: "1.5rem"
              }}>
                <h2 className="h4 mb-0 fw-bold">
                  {currentConf ? getGameTitle(currentConf) : t("dementia.title", "Cognitive Games")}
                </h2>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={handleExit}
                  style={{ borderRadius: "10px", fontWeight: 600 }}
                >
                  ← {t("dementia.backToGames", "Back to Games")} (ESC)
                </button>
              </div>
            </div>
            
            <ErrorBoundary
              fallback={
                <div className="card border-0 shadow-sm" style={{ borderRadius: "20px", padding: "3rem" }}>
                  <div className="text-center">
                    <p className="mb-4">{t("dementia.gameError", "An error occurred while loading the game.")}</p>
                    <button 
                      type="button"
                      className="btn btn-primary" 
                      onClick={handleExit}
                    >
                      {t("dementia.backToGames", "Back to Games")}
                    </button>
                  </div>
                </div>
              }
            >
              <div className="container-fluid py-4">
                <CurrentComp onFinish={handleFinish} onExit={handleExit} />
              </div>
            </ErrorBoundary>
          </div>
        )}

        <ViewResult
          showModal={showResultsModal}
          onClose={closeResultsModal}
          loadingAssessment={loadingAssessment}
          assessmentError={assessmentError}
          riskAssessment={riskAssessment}
          onRetry={handleViewResults}
        />
      </div>
    </ErrorBoundary>
  );
}
