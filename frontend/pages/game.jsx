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
import { AGE_GROUPS, getAgeGroupLabel } from "./game-components/game-algo-js/ageNormalization";

const LS_PROGRESS = "mini_game_progress";
const LS_ASSESSMENT = "mini_game_assessment";
const LS_AGE_GROUP = "mini_game_age_group";
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
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(LS_PROGRESS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed?.results) ? parsed.results : [];
        }
      }
      return [];
    } catch (err) {
      console.warn("[Game] Failed to load progress:", err);
      return [];
    }
  });
  const [completedKeys, setCompletedKeys] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(LS_PROGRESS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed?.completed) ? parsed.completed : [];
        }
      }
      return [];
    } catch (err) {
      console.warn("[Game] Failed to load completed games:", err);
      return [];
    }
  });
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [assessmentError, setAssessmentError] = useState(null);
  const [ageGroup, setAgeGroup] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(LS_AGE_GROUP);
        if (stored && AGE_GROUPS[stored]) {
          return stored;
        }
      }
      return "20-30";
    } catch (err) {
      console.warn("[Game] Failed to load age group:", err);
      return "20-30";
    }
  });

  // Auto scroll to top when component mounts or state changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [showInstructions, current, selectedGame]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          LS_PROGRESS,
          JSON.stringify({ results, completed: completedKeys })
        );
      }
    } catch (err) {
      console.warn("[Game] Failed to save progress:", err);
      if (err.name === 'QuotaExceededError') {
        console.error("[Game] Storage quota exceeded. Clearing old data...");
        try {
          const limitedResults = results.slice(-10);
          localStorage.setItem(
            LS_PROGRESS,
            JSON.stringify({ results: limitedResults, completed: completedKeys })
          );
        } catch (retryErr) {
          console.error("[Game] Failed to save limited progress:", retryErr);
        }
      }
    }
  }, [results, completedKeys]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && ageGroup) {
        localStorage.setItem(LS_AGE_GROUP, ageGroup);
      }
    } catch (err) {
      console.warn("[Game] Failed to save age group:", err);
    }
  }, [ageGroup]);

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
        const title = found ? getGameTitle(found) : key || t("dementia.game", "Game");

        const resultEntry = {
          key,
          title,
          score,
          time,
          detail: {
            ...detail,
            ageGroup: ageGroup
          },
          ageGroup: ageGroup,
          timestamp: Date.now(),
        };

        setResults((prev) => {
          const newResults = [...prev, resultEntry];
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.removeItem(LS_ASSESSMENT);
            }
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
    [current, games, getGameTitle, ageGroup, t]
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
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(LS_PROGRESS);
          localStorage.removeItem(LS_ASSESSMENT);
        }
      } catch (err) {
        console.warn("[Game] Failed to clear progress:", err);
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
        ageGroup: r.ageGroup || ageGroup,
      }));

      const resultsHash = generateResultsHash(results);
      
      let cachedAssessment = null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const cached = localStorage.getItem(LS_ASSESSMENT);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.resultsHash === resultsHash && parsed.assessment) {
              cachedAssessment = parsed.assessment;
            }
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

      const response = await API.dementia.submitGameResults({ 
        gameResults,
        ageGroup: ageGroup
      });
      
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
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(LS_ASSESSMENT, JSON.stringify({
              resultsHash: resultsHash,
              assessment: assessmentData,
              timestamp: Date.now()
            }));
          }
        } catch (err) {
          console.warn("[Game] Failed to cache assessment:", err);
          if (err.name === 'QuotaExceededError') {
            console.error("[Game] Storage quota exceeded. Cannot cache assessment.");
          }
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
            <span className="visually-hidden">{t("dementia.loadingGames", "Loading games...")}</span>
          </div>
          <p className="text-muted fs-5 mt-3">{t("dementia.loadingGames", "Loading games...")}</p>
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
              <h4 className="alert-heading">⚠️ {t("dementia.errorLoadingGames", "Error Loading Games")}</h4>
              <p className="mb-3">{t("dementia.errorMessage", "Something went wrong. Please refresh the page.")}</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                {t("dementia.refreshPage", "Refresh Page")}
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="container-fluid py-3 px-3" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {!current && (
          <>
            <div className="text-center mb-4">
              <h1 className="h2 fw-bold mb-2">
                {t("dementia.title", "Cognitive Games")}
              </h1>
              <p className="text-muted mb-3" style={{ maxWidth: "800px", margin: "0 auto" }}>
                {t("dementia.subtitle", "Engage with scientifically-designed cognitive assessments that evaluate key mental functions including memory, attention, language, and executive skills. Complete multiple games to receive a comprehensive AI-powered risk assessment and personalized insights into your cognitive health.")}
              </p>
              
              <div className="row g-2 mb-3">
                <div className="col-6 col-md-3">
                  <div className="card">
                    <div className="card-body text-center">
                      <div className="text-muted small">{t("dementia.gamesCompleted", "Games Completed")}</div>
                      <div className="h4 mb-0 text-primary">{results.length}</div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card">
                    <div className="card-body">
                      <label htmlFor="age-group-select" className="form-label small mb-1">
                        {t("dementia.ageGroup", "Age Group")}
                      </label>
                      <select
                        id="age-group-select"
                        className="form-select form-select-sm"
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                      >
                        {Object.entries(AGE_GROUPS).map(([key, value]) => (
                          <option key={key} value={key}>
                            {getAgeGroupLabel(key)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {canViewResults ? (
                  <div className="col-6 col-md-3">
                    <div className="card">
                      <div className="card-body p-2">
                        <button
                          type="button"
                          className="btn btn-success w-100"
                          onClick={handleViewResults}
                          disabled={loadingAssessment || isSubmittingRef.current}
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
                      </div>
                    </div>
                  </div>
                ) : results.length > 0 && (
                  <div className="col-6 col-md-3">
                    <div className="card border-warning">
                      <div className="card-body text-center p-2">
                        <div className="text-warning small">
                          {t("dementia.gamesRemaining", { count: MIN_GAMES_FOR_ASSESSMENT - results.length })}{" "}
                          {t("dementia.gamesRemainingText", "more games needed")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="col-6 col-md-3">
                  <div className="card">
                    <div className="card-body p-2">
                      <button
                        type="button"
                        className="btn btn-danger w-100"
                        onClick={resetProgress}
                      >
                        🔄 {t("dementia.reset", "Reset")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-warning mb-3">
              <h5 className="alert-heading">{t("dementia.importantDisclaimer", "Important Disclaimer")}</h5>
              <p className="mb-2 small">
                <strong>{t("dementia.assessmentPurpose", "Assessment Purpose")}:</strong> {t("dementia.assessmentPurposeText", "These cognitive assessments are designed for screening and self-assessment purposes only. They are based on validated neuropsychological testing paradigms but are NOT intended to replace professional medical evaluation, diagnosis, or treatment.")}
              </p>
              <p className="mb-2 small">
                <strong>{t("dementia.clinicalInterpretation", "Clinical Interpretation")}:</strong> {t("dementia.clinicalInterpretationText", "Results should be interpreted by qualified healthcare professionals in conjunction with comprehensive clinical assessment, medical history, and appropriate diagnostic testing.")}
              </p>
              <p className="mb-0 small">
                <strong>{t("dementia.notADiagnosis", "Not a Diagnosis")}:</strong> {t("dementia.notADiagnosisText", "The platform does not provide medical diagnosis, treatment recommendations, or clinical decision-making support. Always consult licensed healthcare professionals for any medical concerns.")}
              </p>
            </div>

            <div className="row g-3 mb-4">
              {games.map((g) => (
                <div key={g.key} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className={`card h-100 ${completedKeys.includes(g.key) ? 'border-success' : ''}`}>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="fs-2">{getGameIcon(g)}</div>
                        {completedKeys.includes(g.key) && (
                          <span className="badge bg-success">
                            ✓ {t("dementia.completed", "Completed")}
                          </span>
                        )}
                      </div>
                      
                      <h5 className="card-title mb-2">{getGameTitle(g)}</h5>
                      
                      <p className="card-text text-muted small mb-3 flex-grow-1">
                        {t(`dementia.games.descriptions.${g.i18nKey || g.key}`, "Test your cognitive abilities with this engaging game.")}
                      </p>
                      
                      <button
                        type="button"
                        className={`btn w-100 mt-auto ${completedKeys.includes(g.key) ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleGameClick(g)}
                      >
                        {completedKeys.includes(g.key) ? "🔄" : "▶️"} {t("dementia.play", "Play")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-lg-6">
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">📊 {t("dementia.howScoringWorks", "How Results Are Scored & Evaluated")}</h5>
                  </div>
                  <div className="card-body">
                    <h6 className="fw-bold">{t("dementia.gameBasedScoring", "Game-Based Assessment Scoring")}</h6>
                    <p className="small text-muted mb-3">
                      {t("dementia.gameBasedScoringText", "Cognitive metrics are calculated from your performance in various cognitive games. Each game is designed to assess specific cognitive domains based on validated neuropsychological testing paradigms.")}
                    </p>
                    <h6 className="fw-bold">{t("dementia.weightedRiskScore", "Weighted Risk Score Calculation")}</h6>
                    <p className="small text-muted mb-0">
                      {t("dementia.weightedRiskScoreText", "The final cognitive risk score uses a weighted domain model: Memory (35%), Language (20%), Attention (20%), Orientation (12.5%), Executive Function (12.5%).")}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-12 col-lg-6">
                <div className="card">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">🎮 {t("dementia.whatEachGameTests", "What Each Game Tests")}</h5>
                  </div>
                  <div className="card-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <div className="small">
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">🎨 {t("dementia.games.colorSequence", "Color Sequence")}</h6>
                        <p className="text-muted mb-1 small">{t("dementia.gameInfo.colorSequence", "Tests visual working memory and pattern recognition")}</p>
                        <span className="badge bg-info me-1">{t("dementia.domainMemory", "Memory")} (70%)</span>
                        <span className="badge bg-secondary">{t("dementia.domainAttention", "Attention")} (30%)</span>
                      </div>
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">🔢 {t("dementia.games.digitSpan", "Digit Span")}</h6>
                        <p className="text-muted mb-1 small">{t("dementia.gameInfo.digitSpan", "Tests working memory capacity")}</p>
                        <span className="badge bg-info me-1">{t("dementia.domainMemory", "Memory")} (80%)</span>
                        <span className="badge bg-secondary">{t("dementia.domainAttention", "Attention")} (20%)</span>
                      </div>
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">🧩 {t("dementia.games.memory", "Memory Match")}</h6>
                        <p className="text-muted mb-1 small">{t("dementia.gameInfo.memory", "Assesses associative memory")}</p>
                        <span className="badge bg-info me-1">{t("dementia.domainMemory", "Memory")} (75%)</span>
                        <span className="badge bg-secondary">{t("dementia.domainExecutive", "Executive")} (25%)</span>
                      </div>
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">🔄 {t("dementia.games.nBack", "N-Back")}</h6>
                        <p className="text-muted mb-1 small">{t("dementia.gameInfo.nBack", "Evaluates working memory and attention")}</p>
                        <span className="badge bg-info me-1">{t("dementia.domainMemory", "Memory")} (60%)</span>
                        <span className="badge bg-secondary">{t("dementia.domainAttention", "Attention")} (40%)</span>
                      </div>
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">⚡ {t("dementia.games.reactionTime", "Reaction Time")}</h6>
                        <p className="text-muted mb-1 small">{t("dementia.gameInfo.reactionTime", "Measures processing speed and attention")}</p>
                        <span className="badge bg-info me-1">{t("dementia.domainAttention", "Attention")} (85%)</span>
                        <span className="badge bg-secondary">{t("dementia.domainExecutive", "Executive")} (15%)</span>
                      </div>
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">🎯 {t("dementia.games.stroopTest", "Stroop Test")}</h6>
                        <p className="text-muted mb-1 small">{t("dementia.gameInfo.stroopTest", "Assesses cognitive flexibility")}</p>
                        <span className="badge bg-info me-1">{t("dementia.domainExecutive", "Executive")} (80%)</span>
                        <span className="badge bg-secondary">{t("dementia.domainAttention", "Attention")} (20%)</span>
                      </div>
                      <div className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">🔁 {t("dementia.games.patternRecall", "Pattern Recall")}</h6>
                        <p className="text-muted mb-1 small">{t("dementia.gameInfo.patternRecall", "Tests visual memory and pattern recognition")}</p>
                        <span className="badge bg-info me-1">{t("dementia.domainMemory", "Memory")} (70%)</span>
                        <span className="badge bg-secondary">{t("dementia.domainAttention", "Attention")} (30%)</span>
                      </div>
                      <div className="mb-0">
                        <h6 className="fw-bold mb-1">🕐 {t("dementia.games.clockDrawing", "Clock Drawing")}</h6>
                        <p className="text-muted mb-1 small">{t("dementia.gameInfo.clockDrawing", "Tests multiple cognitive domains")}</p>
                        <span className="badge bg-info me-1">{t("dementia.domainExecutive", "Executive")} (50%)</span>
                        <span className="badge bg-secondary">{t("dementia.domainOrientation", "Orientation")} (30%)</span>
                        <span className="badge bg-secondary">{t("dementia.domainMemory", "Memory")} (20%)</span>
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
            <div className="card mb-3">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <h4 className="mb-0">
                    {currentConf ? getGameTitle(currentConf) : t("dementia.title", "Cognitive Games")}
                  </h4>
                  <span className="badge bg-light text-dark">
                    {getAgeGroupLabel(ageGroup)}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={handleExit}
                >
                  ← {t("dementia.backToGames", "Back to Games")} (ESC)
                </button>
              </div>
            </div>
            
            <ErrorBoundary
              fallback={
                <div className="card">
                  <div className="card-body text-center">
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
              <div className="card">
                <div className="card-body">
                  <CurrentComp onFinish={handleFinish} onExit={handleExit} ageGroup={ageGroup} />
                </div>
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
