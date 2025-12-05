import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/PatternRecall.css";
import "../../css/game/GameComponentLayout.css";

const DIFFICULTY = {
  easy: { 
    rounds: 4, 
    sequenceLength: 3, 
    colors: ["red", "green", "blue", "yellow"],
    showDuration: 800,
    inputTimeout: 15000
  },
  medium: { 
    rounds: 6, 
    sequenceLength: 4, 
    colors: ["red", "green", "blue", "yellow", "purple"],
    showDuration: 700,
    inputTimeout: 12000
  },
  hard: { 
    rounds: 8, 
    sequenceLength: 5, 
    colors: ["red", "green", "blue", "yellow", "purple", "orange"],
    showDuration: 600,
    inputTimeout: 10000
  },
};

export default function PatternRecall({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(4);
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [timer, setTimer] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [phase, setPhase] = useState("show"); 
  const [showResult, setShowResult] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);

  const intervalRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const inputTimeoutRef = useRef(null);
  const gameStartRef = useRef(0);
  const sequenceRef = useRef([]);
  const isShowingSequenceRef = useRef(false);

  const getColorStyle = (color) => {
    const colorMap = {
      red: "#dc2626",
      green: "#16a34a",
      blue: "#2563eb",
      yellow: "#eab308",
      purple: "#9333ea",
      orange: "#ea580c"
    };
    return { backgroundColor: colorMap[color] || color };
  };

  const getColorName = (color) => {
    const names = {
      red: t("dementia.patternRecall.red", "Red"),
      green: t("dementia.patternRecall.green", "Green"),
      blue: t("dementia.patternRecall.blue", "Blue"),
      yellow: t("dementia.patternRecall.yellow", "Yellow"),
      purple: t("dementia.patternRecall.purple", "Purple"),
      orange: t("dementia.patternRecall.orange", "Orange")
    };
    return names[color] || color;
  };

  const generateSequence = useCallback(() => {
    if (!difficulty) return;
    const colors = DIFFICULTY[difficulty].colors;
    const length = DIFFICULTY[difficulty].sequenceLength;
    const seq = Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);
    setSequence(seq);
    sequenceRef.current = seq;
    setUserSequence([]);
    setPhase("show");
    setActiveIndex(-1);
    setError(false);
    isShowingSequenceRef.current = false;
  }, [difficulty]);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setTimer(0);
    setShowResult(false);
    setGameStartTime(Date.now());
    gameStartRef.current = Date.now();
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    
    setTimeout(() => {
      generateSequence();
    }, 100);
  };

  
  useEffect(() => {
    if (phase === "show" && sequence.length > 0 && difficulty && !isShowingSequenceRef.current) {
      isShowingSequenceRef.current = true;
      let currentIndex = 0;
      const showDuration = DIFFICULTY[difficulty].showDuration;
      
      const showSequence = () => {
        if (currentIndex < sequence.length) {
          setActiveIndex(currentIndex);
          setTimeout(() => {
            setActiveIndex(-1);
            currentIndex++;
            if (currentIndex < sequence.length) {
              setTimeout(showSequence, showDuration / 2);
            } else {
              
              setTimeout(() => {
                setPhase("input");
                setActiveIndex(-1);
                isShowingSequenceRef.current = false;
                
                
                if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
                inputTimeoutRef.current = setTimeout(() => {
                  
                  handleRoundComplete(false);
                }, DIFFICULTY[difficulty].inputTimeout);
              }, 500);
            }
          }, showDuration);
        }
      };
      
      showSequence();
    }
    
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    };
  }, [phase, sequence.length, difficulty]);

  const handleRoundComplete = useCallback((isCorrect) => {
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    
    if (isCorrect) {
      const roundScore = sequence.length * 10;
      setTotalScore((prev) => prev + roundScore);
    }
    
    setPhase("complete");
    
    setTimeout(() => {
      if (round < maxRounds) {
        setRound((prev) => prev + 1);
        generateSequence();
      } else {
        
        if (intervalRef.current) clearInterval(intervalRef.current);
        setShowResult(true);
      }
    }, 1500);
  }, [round, maxRounds, sequence.length, generateSequence]);

  
  useEffect(() => {
    if (phase === "input" && userSequence.length === sequence.length && sequence.length > 0) {
      const isCorrect = userSequence.every((color, idx) => color === sequence[idx]);
      setError(!isCorrect);
      handleRoundComplete(isCorrect);
    }
  }, [userSequence, sequence, phase, handleRoundComplete]);

  const handleUserClick = (color) => {
    if (phase !== "input" || userSequence.length >= sequence.length) return;
    
    const newSequence = [...userSequence, color];
    setUserSequence(newSequence);
    
    
    if (newSequence.length <= sequence.length) {
      const isCorrect = newSequence[newSequence.length - 1] === sequence[newSequence.length - 1];
      if (!isCorrect) {
        setError(true);
        setTimeout(() => {
          handleRoundComplete(false);
        }, 500);
      }
    }
  };

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    onExit?.();
  }, [onExit]);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExit();
      } else if (e.key === "Backspace" && phase === "input" && userSequence.length > 0 && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setUserSequence(prev => prev.slice(0, -1));
        setError(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, userSequence.length, handleExit]);

  const handleNext = (retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    setShowResult(false);
    if (retry) {
      startGame(difficulty);
    } else {
      const totalTime = Math.floor((Date.now() - gameStartRef.current) / 1000);
      onFinish?.({
        key: "pattern_recall",
        score: totalScore,
        time: totalTime,
        detail: { 
          rounds: maxRounds, 
          difficulty, 
          completedRounds: round,
          averageScore: Math.round(totalScore / maxRounds),
          accuracy: Math.round((totalScore / (maxRounds * sequence.length * 10)) * 100)
        },
      });
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    };
  }, []);

  if (!difficulty) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center p-4">
                <h2 className="h3 mb-3 fw-bold">{t("dementia.games.patternRecall", "Pattern Recall")}</h2>
                <p className="text-muted mb-3">
                  {t("dementia.patternRecall.description", "Test your memory by repeating color sequences. Watch the pattern and then click the colors in the same order.")}
                </p>
                <p className="small text-muted mb-4">
                  {t("dementia.selectDifficulty", "Select a difficulty level:")}
                </p>
                <div className="d-flex flex-column gap-3 mb-4">
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("easy")}
                  >
                    {t("dementia.easy", "Easy")}
                    <span className="badge bg-primary ms-2">({t("dementia.patternRecall.easyInfo", "3 colors, 4 rounds")})</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("medium")}
                  >
                    {t("dementia.medium", "Medium")}
                    <span className="badge bg-primary ms-2">({t("dementia.patternRecall.mediumInfo", "4 colors, 6 rounds")})</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("hard")}
                  >
                    {t("dementia.hard", "Hard")}
                    <span className="badge bg-primary ms-2">({t("dementia.patternRecall.hardInfo", "5 colors, 8 rounds")})</span>
                  </button>
                </div>
                <button className="btn btn-outline-secondary w-100" onClick={handleExit}>
                  {t("dementia.exit", "Exit")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-component-wrapper" style={{ position: 'relative' }}>
      <div className="game-component-container">
        <div className="game-component-card">
          <div className="game-component-header">
            <h2>{t("dementia.games.patternRecall", "Pattern Recall")}</h2>
            <button className="btn btn-light btn-sm" onClick={handleExit}>
              {t("dementia.exit", "Exit")}
            </button>
          </div>
          <div className="game-component-body">
            <div className="game-stats-row">
              <div className="game-stat-box">
                <div className="game-stat-label">{t("dementia.round", "Round")}</div>
                <div className="game-stat-value">{round} / {maxRounds}</div>
              </div>
              <div className="game-stat-box">
                <div className="game-stat-label">{t("dementia.score", "Score")}</div>
                <div className="game-stat-value" style={{ color: "#22c55e" }}>{totalScore}</div>
              </div>
              <div className="game-stat-box">
                <div className="game-stat-label">{t("dementia.timer", "Timer")}</div>
                <div className="game-stat-value" style={{ color: "#667eea" }}>{timer}s</div>
              </div>
            </div>

            <div className="alert alert-info text-center mb-4">
              {phase === "show" && (
                <p className="mb-0 fw-bold">
                  {t("dementia.patternRecall.watchSequence", "Watch the sequence carefully...")}
                </p>
              )}
              {phase === "input" && (
                <p className="mb-0 fw-bold">
                  {t("dementia.patternRecall.repeatSequence", "Now repeat the sequence by clicking the colors in order!")}
                </p>
              )}
              {phase === "complete" && (
                <p className={`mb-0 fw-bold ${error ? "text-danger" : "text-success"}`}>
                  {error 
                    ? t("dementia.patternRecall.incorrect", "Incorrect sequence. Moving to next round...")
                    : t("dementia.patternRecall.correct", "Correct! Well done!")}
                </p>
              )}
            </div>

            
            <div className="patternrecall-display">
              {sequence.map((color, idx) => (
                <div
                  key={idx}
                  className={`patternrecall-block ${
                    phase === "show" && activeIndex === idx ? "active" : ""
                  } ${phase === "show" ? "" : "hidden"}`}
                  style={phase === "show" ? getColorStyle(color) : {}}
                >
                  {phase === "show" && activeIndex === idx && (
                    <span className="patternrecall-block-label">{getColorName(color)}</span>
                  )}
                </div>
              ))}
            </div>

            
            {phase === "input" && (
              <div className="patternrecall-input-section">
                <p className="patternrecall-user-sequence-label">
                  {t("dementia.patternRecall.yourSequence", "Your sequence:")}
                </p>
                <div className="patternrecall-user-sequence">
                  {Array.from({ length: sequence.length }).map((_, idx) => {
                    const color = userSequence[idx];
                    return (
                      <div
                        key={idx}
                        className={`patternrecall-block patternrecall-user-block ${
                          color ? "filled" : "empty"
                        } ${error && idx === userSequence.length - 1 ? "error" : ""}`}
                        style={color ? getColorStyle(color) : {}}
                      >
                        {!color && <span className="patternrecall-placeholder">?</span>}
                        {color && <span className="patternrecall-block-label-small">{getColorName(color)}</span>}
                      </div>
                    );
                  })}
                </div>
                
                <div className="patternrecall-grid">
                  {DIFFICULTY[difficulty].colors.map((color, idx) => (
                    <button
                      key={`${color}-${idx}`}
                      className="patternrecall-color-btn"
                      style={getColorStyle(color)}
                      onClick={() => handleUserClick(color)}
                      disabled={userSequence.length >= sequence.length || phase !== "input"}
                    >
                      <span className="patternrecall-btn-label">{getColorName(color)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showResult && (
          <ResultPopup
            score={totalScore}
            time={timer}
            detail={{
              rounds: maxRounds,
              difficulty,
              completedRounds: round,
              averageScore: Math.round(totalScore / maxRounds),
              accuracy: Math.round((totalScore / (maxRounds * sequence.length * 10)) * 100)
            }}
            onNext={() => handleNext(false)}
          />
        )}
      </div>
    </div>
  );
}
