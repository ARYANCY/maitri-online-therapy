import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ClockTest from "./game-components/ClockTest";
import ColorSequence from "./game-components/ColorSequence";
import DementiaChecker from "./game-components/dementiaChecker";
import DigitSpan from "./game-components/DigitSpan";
import Memory from "./game-components/MemoryMatch";
import NBack from "./game-components/NBack";
import ReactionTime from "./game-components/ReactionTimeTest";
import StroopTest from "./game-components/StroopTest";
import API from "../utils/axiosClient";
import "../css/game/game.css";

const LS_PROGRESS = "mini_game_progress";

export default function Game() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(null);
  const [results, setResults] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_PROGRESS) || "{}").results || []; } catch { return []; }
  });
  const [completedKeys, setCompletedKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_PROGRESS) || "{}").completed || []; } catch { return []; }
  });

  const games = useMemo(() => ([
    { key: "clock_test", title: t("dementia.games.clockTest"), component: ClockTest, i18nKey: "clockTest" },
    { key: "color_sequence", title: t("dementia.games.colorSequence"), component: ColorSequence, i18nKey: "colorSequence" },
    { key: "dementia_checker", title: t("dementia.games.textRecall"), component: DementiaChecker, i18nKey: "textRecall" },
    { key: "digit_span", title: t("dementia.games.digitSpan"), component: DigitSpan, i18nKey: "digitSpan" },
    { key: "memory", title: t("dementia.games.memory"), component: Memory, i18nKey: "memory" },
    { key: "n_back", title: t("dementia.games.nBack"), component: NBack, i18nKey: "nBack" },
    { key: "reaction_time", title: t("dementia.games.reactionTime"), component: ReactionTime, i18nKey: "reactionTime" },
    { key: "stroop_test", title: t("dementia.games.stroopTest"), component: StroopTest, i18nKey: "stroopTest" },
  ]), [t]);

  useEffect(() => {
    localStorage.setItem(LS_PROGRESS, JSON.stringify({ results, completed: completedKeys }));
  }, [results, completedKeys]);

  const handleFinish = (payload) => {
    const key = payload?.key || current?.key;
    const score = payload?.score ?? 0;
    const detail = payload?.detail ?? null;
    const time = payload?.time ?? detail?.time ?? 0;
    const found = key ? games.find(g => g.key === key) : null;
    const title = found?.title || key || "Game";
    const resultEntry = { 
      key, 
      title, 
      score, 
      time,
      detail,
      timestamp: Date.now()
    };
    setResults(prev => [...prev, resultEntry]);
    if (key) setCompletedKeys(prev => Array.from(new Set([...prev, key])));
    setCurrent(null);
  };

  const handleExit = () => setCurrent(null);

  const resetProgress = () => {
    setResults([]);
    setCompletedKeys([]);
    localStorage.removeItem(LS_PROGRESS);
    setRiskAssessment(null);
  };

  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const handleViewResults = async () => {
    if (results.length < 5) return;
    
    setLoadingAssessment(true);
    setShowResultsModal(true);
    
    try {
      const gameResults = results.slice(-5).map(r => ({
        key: r.key,
        title: r.title,
        score: r.score || 0,
        time: r.time || 0,
        detail: r.detail || {}
      }));
      
      const response = await API.dementia.submitGameResults({ gameResults });
      
      if (response && response.success !== undefined) {
        setRiskAssessment(response);
      } else if (response) {
        setRiskAssessment({ success: true, ...response });
      } else {
        throw new Error("Empty response from server");
      }
    } catch (error) {
      let errorMessage = t("dementia.failedAssessment");
      if (error.response?.data?.error) errorMessage = error.response.data.error;
      else if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.message) errorMessage = error.message;
      else if (typeof error === 'string') errorMessage = error;
      
      setRiskAssessment({ success: false, error: errorMessage });
    } finally {
      setLoadingAssessment(false);
    }
  };

  const currentConf = current ? games.find(g => g.key === current.key) : null;
  const CurrentComp = currentConf?.component || null;
  const canViewResults = results.length >= 5;

  return (
    <div className="game-wrapper">
      <header className="game-header">
        <h2>{t("dementia.title", "Cognitive Games")}</h2>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap: "wrap" }}>
          <span className="badge bg-info">{t("dementia.completedCount", { count: results.length })}</span>
          {canViewResults && (
            <button className="btn btn-success" onClick={handleViewResults} disabled={loadingAssessment}>
              {loadingAssessment ? t("dementia.calculating") : t("dementia.viewResults")}
            </button>
          )}
          <button className="btn btn-outline-danger" onClick={resetProgress}>{t("dementia.reset")}</button>
        </div>
      </header>

      {!current && (
        <div className="game-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
          {games.map(g => (
            <div key={g.key} className="game-card" style={{ padding:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <h4 style={{ margin:0, fontSize:"1.1rem" }}>{g.title}</h4>
                {completedKeys.includes(g.key) && <span className="badge bg-success">{t("dementia.completed")}</span>}
              </div>
              <p style={{ fontSize:"0.85rem", color:"#666", marginBottom:8, lineHeight:"1.4" }}>
                {t(`dementia.games.descriptions.${g.i18nKey || g.key}`)}
              </p>
              <h4 style={{ fontSize:"0.9rem", marginTop:8, marginBottom:4, color:"#333", fontWeight:"600" }}>
                {t("dementia.howItHelps", "How it helps:")}
              </h4>
              <p style={{ fontSize:"0.8rem", color:"#555", marginBottom:12, lineHeight:"1.4" }}>
                {t(`dementia.games.benefits.${g.i18nKey || g.key}`)}
              </p>
              <div style={{ marginTop:12 }}>
                <button className="btn btn-primary" onClick={()=> setCurrent({ key: g.key })}>{t("dementia.play")}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {CurrentComp && (
        <div className="game-card" style={{ marginTop: 12 }}>
          <CurrentComp onFinish={handleFinish} onExit={handleExit} />
        </div>
      )}

      {showResultsModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setShowResultsModal(false)}>
          <div className="game-card" style={{
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            position: "relative"
          }} onClick={(e) => e.stopPropagation()}>
            <button style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666"
            }} onClick={() => setShowResultsModal(false)}>×</button>

            <h2 style={{ marginTop: 0 }}>{t("dementia.riskAssessmentResults")}</h2>

            {loadingAssessment ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>{t("dementia.calculatingAssessment")}</p>
              </div>
            ) : riskAssessment?.success ? (
              <div>
                {/* Keep the same risk assessment display as before */}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#dc3545" }}>
                <p>{riskAssessment?.error || t("dementia.failedAssessment")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
