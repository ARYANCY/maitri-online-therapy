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
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [showInstructions]);

  useEffect(() => {
    if (current) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [current]);

  // Games array is static - no need for dependencies
  // Title and icon are computed dynamically via getGameTitle/getGameIcon
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
  }, []); // No dependencies - games structure is static
  
  // Compute titles and icons dynamically for rendering
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
        const key = payload?.key || current?.key;
        if (!key) {
          console.warn("No game key provided in finish payload");
          return;
        }

        const score = payload?.score ?? 0;
        const detail = payload?.detail ?? null;
        const time = payload?.time ?? detail?.time ?? 0;
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
            console.warn("Failed to clear assessment cache:", err);
          }
          return newResults;
        });
        setCompletedKeys((prev) => Array.from(new Set([...prev, key])));
        setCurrent(null);
      } catch (err) {
        console.error("Error handling game finish:", err);
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
      <div className="game-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: "400px", padding: "2rem" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading games...</span>
          </div>
          <p className="text-muted fs-5">Loading games...</p>
        </div>
      </div>
    );
  }

    return (
      <ErrorBoundary
        fallback={
          <div className="game-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: "400px", padding: "2rem" }}>
            <div className="text-center">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Error Loading Games</h4>
                <p>Something went wrong. Please refresh the page.</p>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        }
      >
        <div className="game-wrapper">
        
        {!current && (
          <>
          <header className="game-header" role="banner">
            <h2>{t("dementia.title", "Cognitive Games")}</h2>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span className="badge bg-info" style={{ fontSize: "1rem", padding: "0.625rem 1.25rem" }}>
                {t("dementia.completedCount", { count: results.length })}
              </span>
              {canViewResults && (
                <button
                  type="button"
                  className="btn btn-success"
                    onClick={handleViewResults}
                  disabled={loadingAssessment || isSubmittingRef.current}
                  style={{ fontSize: "1rem", padding: "0.875rem 1.5rem" }}
                >
                    {loadingAssessment ? t("dementia.calculating", "Calculating...") : t("dementia.viewResults", "View Results")}
                </button>
              )}
              {!canViewResults && results.length > 0 && (
                  <span className="badge bg-info" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
                    {t("dementia.gamesRemaining", { count: MIN_GAMES_FOR_ASSESSMENT - results.length })}{" "}
                  {t("dementia.gamesRemainingText", "more games needed")}
                </span>
              )}
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={resetProgress}
                style={{ fontSize: "1rem", padding: "0.875rem 1.5rem" }}
              >
                {t("dementia.reset", "Reset")}
              </button>
            </div>
          </header>

          
          <div className="card mb-4 mt-4">
            <div className="card-header bg-warning text-dark">
              <h3 className="h5 mb-0">⚠️ {t("dementia.importantDisclaimer", "Important Disclaimer")}</h3>
            </div>
            <div className="card-body">
              <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                <strong>{t("dementia.disclaimerTitle", "Assessment Purpose")}:</strong> {t("dementia.disclaimerText1", "These cognitive assessments are designed for screening and self-assessment purposes only. They are based on validated neuropsychological testing paradigms but are NOT intended to replace professional medical evaluation, diagnosis, or treatment.")}
              </p>
              <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                <strong>{t("dementia.disclaimerTitle2", "Clinical Interpretation")}:</strong> {t("dementia.disclaimerText2", "Results should be interpreted by qualified healthcare professionals in conjunction with comprehensive clinical assessment, medical history, and appropriate diagnostic testing. Scores may be influenced by factors such as fatigue, stress, medication effects, or temporary health conditions.")}
              </p>
              <p className="mb-0" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                <strong>{t("dementia.disclaimerTitle3", "Not a Diagnosis")}:</strong> {t("dementia.disclaimerText3", "The platform does not provide medical diagnosis, treatment recommendations, or clinical decision-making support. Always consult licensed healthcare professionals for any medical concerns or before making health-related decisions.")}
              </p>
            </div>
          </div>

          
          <div className="row g-4 mb-4" role="main">
            {games.map((g) => (
              <div key={g.key} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="fs-1" aria-hidden="true" style={{lineHeight: 1}}>
                        {getGameIcon(g)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <h4 className="h5 mb-0 fw-bold">{getGameTitle(g)}</h4>
                          {completedKeys.includes(g.key) && (
                              <span className="badge bg-success">
                              {t("dementia.completed", "Completed")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted mb-3 flex-grow-1">
                      {t(`dementia.games.descriptions.${g.i18nKey || g.key}`)}
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary w-100 mt-auto"
                      onClick={() => handleGameClick(g)}
                    >
                      {t("dementia.play", "Play")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          
          <div className="card mb-4 mt-4">
            <div className="card-header bg-primary text-white">
              <h3 className="h5 mb-0">📊 {t("dementia.howScoringWorks", "How Results Are Scored & Evaluated")}</h3>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5 className="mb-3">{t("dementia.gameBasedScoring", "Game-Based Assessment Scoring")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("dementia.cognitiveScoringExplanation", "Cognitive metrics are calculated from your performance in various cognitive games. Each game is designed to assess specific cognitive domains based on validated neuropsychological testing paradigms. Your raw scores from each game are normalized by difficulty level (easy, moderate, hard) to ensure fair comparison. The formula used is: Normalized Score = (Raw Score / Maximum Possible Score for Difficulty) × 100. This normalization accounts for different difficulty multipliers (easy: 1.0x, moderate: 1.5x, hard: 2.0x) and ensures that scores are comparable across games and difficulty levels.")}
                </p>
                
                <h5 className="mb-3 mt-4">{t("dementia.domainMapping", "Game-to-Domain Mapping")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("dementia.domainMappingExplanation", "Each game maps to specific cognitive domains with clinical justification: Digit Span and N-Back primarily test Memory (working memory capacity). Pattern Recall and Memory Match assess Memory and Attention. Reaction Time measures Attention and Processing Speed. Stroop Test evaluates Executive Function (cognitive flexibility and inhibition). Clock Drawing tests Executive Function, Orientation, and Visuospatial abilities. Text Recall (Dementia Checker) assesses Memory and Language. Each game contributes to domain scores with weighted importance based on which cognitive function it primarily tests.")}
                </p>
                
                <h5 className="mb-3 mt-4">{t("dementia.weightedRiskCalculation", "Weighted Risk Score Calculation")}</h5>
                <p className="mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("dementia.weightedRiskExplanation", "The final cognitive risk score uses a weighted domain model based on clinical research: Memory (30% weight) - main early dementia marker, Language (20%) - word-finding issues appear early, Attention (20%) - executive decline affects attention, Orientation (15%) - moderate impact, Executive Function (15%) - important but typically late-stage. The formula calculates: Weighted Risk Score = Σ(Domain Risk × Domain Weight), where Domain Risk = 1 - (Domain Score / 10). Higher domain scores (0-10 scale) indicate better cognitive function, resulting in lower risk scores (0-1 scale). Risk levels are determined as: High (≥70%), Moderate (40-69%), Low (<40%).")}
                </p>
              </div>
            </div>
          </div>

          
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h3 className="h5 mb-0">🎮 {t("dementia.whatEachGameTests", "What Each Game Tests")}</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🔢 {t("dementia.digitSpanGame", "Digit Span")}</h6>
                  <p className="small mb-2">{t("dementia.digitSpanGameDesc", "Tests working memory capacity by requiring you to remember and recall sequences of digits. Measures immediate memory span, which is a key indicator of cognitive health. Early Alzheimer's disease affects short-term recall, making this test sensitive to early cognitive decline.")}</p>
                  <span className="badge bg-info text-dark">{t("dementia.primaryDomain", "Primary Domain")}: Memory (80%)</span>
                  <span className="badge bg-secondary ms-2">{t("dementia.secondaryDomain", "Secondary")}: Attention (20%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🔄 {t("dementia.nBackGame", "N-Back")}</h6>
                  <p className="small mb-2">{t("dementia.nBackGameDesc", "Evaluates working memory and executive function by requiring you to identify items that appeared N steps back in a sequence. Tests your ability to maintain and update information in working memory, which is sensitive to Mild Cognitive Impairment (MCI) decline.")}</p>
                  <span className="badge bg-info text-dark">{t("dementia.primaryDomain", "Primary Domain")}: Memory (60%)</span>
                  <span className="badge bg-secondary ms-2">{t("dementia.secondaryDomain", "Secondary")}: Executive (40%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🔁 {t("dementia.patternRecallGame", "Pattern Recall")}</h6>
                  <p className="small mb-2">{t("dementia.patternRecallGameDesc", "Tests visual memory and sequential processing by requiring you to remember and reproduce visual patterns. Evaluates memory encoding and retrieval deficits, which are critical cognitive functions that decline in early-stage dementia.")}</p>
                  <span className="badge bg-info text-dark">{t("dementia.primaryDomain", "Primary Domain")}: Memory (70%)</span>
                  <span className="badge bg-secondary ms-2">{t("dementia.secondaryDomain", "Secondary")}: Attention (30%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🧩 {t("dementia.memoryMatchGame", "Memory Match")}</h6>
                  <p className="small mb-2">{t("dementia.memoryMatchGameDesc", "Assesses associative memory by requiring you to match pairs of cards by remembering their positions. Tests hippocampal-dependent memory systems, which are strongly affected in early Alzheimer's disease. Identifies visual memory deficits and spatial processing issues.")}</p>
                  <span className="badge bg-info text-dark">{t("dementia.primaryDomain", "Primary Domain")}: Memory (75%)</span>
                  <span className="badge bg-secondary ms-2">{t("dementia.secondaryDomain", "Secondary")}: Executive (25%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">⚡ {t("dementia.reactionTimeGame", "Reaction Time")}</h6>
                  <p className="small mb-2">{t("dementia.reactionTimeGameDesc", "Measures processing speed and attention by requiring quick responses to visual stimuli. Detects slowed cognitive processing, which is an early indicator of cognitive decline. Tracks average reaction time, variability, and slowest 10% responses.")}</p>
                  <span className="badge bg-info text-dark">{t("dementia.primaryDomain", "Primary Domain")}: Attention (70%)</span>
                  <span className="badge bg-secondary ms-2">{t("dementia.secondaryDomain", "Secondary")}: Executive (30%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🎨 {t("dementia.colorSequenceGame", "Color Sequence")}</h6>
                  <p className="small mb-2">{t("dementia.colorSequenceGameDesc", "Tests sequential memory by requiring you to remember and repeat color sequences in order. Evaluates working memory and executive function components that are affected in early dementia. Measures ability to maintain sequences in memory.")}</p>
                  <span className="badge bg-info text-dark">{t("dementia.primaryDomain", "Primary Domain")}: Memory (60%)</span>
                  <span className="badge bg-secondary ms-2">{t("dementia.secondaryDomain", "Secondary")}: Executive (40%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🎯 {t("dementia.stroopTestGame", "Stroop Test")}</h6>
                  <p className="small mb-2">{t("dementia.stroopTestGameDesc", "Assesses cognitive flexibility and inhibition by requiring you to identify color names while ignoring conflicting text colors. Measures executive function and cognitive control, which are impaired in dementia patients. Tests ability to inhibit automatic responses.")}</p>
                  <span className="badge bg-info text-dark">{t("dementia.primaryDomain", "Primary Domain")}: Executive (80%)</span>
                  <span className="badge bg-secondary ms-2">{t("dementia.secondaryDomain", "Secondary")}: Attention (20%)</span>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="fw-bold">🕐 {t("dementia.clockDrawingGame", "Clock Drawing")}</h6>
                  <p className="small mb-2">{t("dementia.clockDrawingGameDesc", "A widely used screening tool for dementia that assesses multiple cognitive domains including visuospatial skills, executive function, attention, and semantic memory. This is a clinically validated test (CDT) used in MMSE, MoCA, and other assessments. Impairments in clock drawing are strong indicators of cognitive decline.")}</p>
                  <span className="badge bg-info text-dark">{t("dementia.primaryDomain", "Primary Domain")}: Executive (50%)</span>
                  <span className="badge bg-secondary ms-2">{t("dementia.secondaryDomain", "Secondary")}: Orientation (30%) + Memory (20%)</span>
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
            <header 
              className="game-header" 
            style={{
                padding: "1rem 2rem",
              background: "var(--cloud-white-pure)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1.5rem", margin: 0 }}>
                {currentConf ? getGameTitle(currentConf) : t("dementia.title", "Cognitive Games")}
              </h2>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleExit}
                style={{ fontSize: "1rem", padding: "0.875rem 1.5rem" }}
              >
                {t("dementia.backToGames", "Back to Games")} (ESC)
              </button>
            </header>
            
              <ErrorBoundary
                fallback={
                <div style={{ padding: "2rem", textAlign: "center", minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p>{t("dementia.gameError", "An error occurred while loading the game.")}</p>
                    <button 
                      type="button"
                      className="btn btn-primary" 
                      onClick={handleExit}
                    >
                      {t("dementia.backToGames", "Back to Games")}
                    </button>
                  </div>
                }
              >
              <div className="game-component-wrapper">
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
