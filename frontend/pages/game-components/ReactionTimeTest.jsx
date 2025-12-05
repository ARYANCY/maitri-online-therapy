import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/ReactionTimeTest.css";

const DIFFICULTY = {
  easy: { rounds: 5, minDelay: 2000, maxDelay: 4000 },
  medium: { rounds: 7, minDelay: 1000, maxDelay: 3000 },
  hard: { rounds: 10, minDelay: 500, maxDelay: 2000 },
};

export default function ReactionTimeTest({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isGreen, setIsGreen] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [lastReactionTime, setLastReactionTime] = useState(null);
  const [tooEarly, setTooEarly] = useState(false);
  const [error, setError] = useState(null);

  const startTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const gameStartRef = useRef(0);

  const handleExit = useCallback(() => {
    try {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onExit?.();
    } catch (err) {
      console.error("Error in handleExit:", err);
    }
  }, [onExit]);

  const startRound = useCallback((level = null) => {
    try {
      const currentDifficulty = level || difficulty;
      if (!currentDifficulty) {
        return;
      }
      
      setIsGreen(false);
      setTooEarly(false);
      setLastReactionTime(null);
      setError(null);
      
      const { minDelay, maxDelay } = DIFFICULTY[currentDifficulty];
      if (!minDelay || !maxDelay) {
        setError("Invalid difficulty settings");
        return;
      }

      const delay = Math.random() * (maxDelay - minDelay) + minDelay;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        try {
          setIsGreen(true);
          startTimeRef.current = Date.now();
        } catch (err) {
          setError(err.message || "Failed to start round");
          console.error("Error in timeout:", err);
        }
      }, delay);
    } catch (err) {
      setError(err.message || "Failed to start round");
      console.error("Error in startRound:", err);
    }
  }, [difficulty]);

  const handleClick = useCallback(() => {
    try {
      if (!isGreen) {
        if (difficulty) {
          setTooEarly(true);
          setTimeout(() => setTooEarly(false), 1500);
        }
        return;
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      const reactionTime = Date.now() - startTimeRef.current;
      if (reactionTime < 0) {
        setError("Invalid reaction time");
        return;
      }

      const roundScore = Math.max(0, 1000 - reactionTime);
      
      setReactionTimes((prev) => [...prev, reactionTime]);
      setLastReactionTime(reactionTime);
      setScore((prev) => prev + roundScore);
      setIsGreen(false);

      if (round < maxRounds) {
        setRound((prev) => prev + 1);
        setTimeout(() => startRound(), 1000);
      } else {
        const finalTime = Math.floor((Date.now() - gameStartRef.current) / 1000);
        setTotalTime(finalTime);
        setShowResult(true);
      }
    } catch (err) {
      setError(err.message || "Error handling click");
      console.error("Error in handleClick:", err);
    }
  }, [isGreen, difficulty, round, maxRounds, startRound]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      try {
        if (e.code === "Space" && difficulty && !showResult) {
          e.preventDefault();
          handleClick();
        } else if (e.key === "Escape") {
          handleExit();
        }
      } catch (err) {
        console.error("Error in keypress handler:", err);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [difficulty, showResult, handleClick, handleExit]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startGame = (level) => {
    try {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      if (!DIFFICULTY[level]) {
        setError("Invalid difficulty level");
        return;
      }
      
      setDifficulty(level);
      setRound(1);
      setMaxRounds(DIFFICULTY[level].rounds);
      setScore(0);
      setTotalTime(0);
      setShowResult(false);
      setIsGreen(false);
      setTooEarly(false);
      setReactionTimes([]);
      setLastReactionTime(null);
      setError(null);
      gameStartRef.current = Date.now();
      
      setTimeout(() => startRound(level), 300);
    } catch (err) {
      setError(err.message || "Failed to start game");
      console.error("Error in startGame:", err);
    }
  };

  const handleNext = (retry = false) => {
    try {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShowResult(false);
      if (retry) {
        startGame(difficulty);
      } else {
        const avgReactionTime = reactionTimes.length > 0
          ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
          : 0;
        
        onFinish?.({
          key: "reaction_time",
          score,
          time: totalTime,
          detail: {
            rounds: maxRounds,
            difficulty,
            time: totalTime,
            averageScore: Math.round(score / maxRounds),
            averageReactionTime: avgReactionTime,
            bestReactionTime: reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0,
            reactionTimes: reactionTimes,
          },
        });
      }
    } catch (err) {
      setError(err.message || "Error in handleNext");
      console.error("Error in handleNext:", err);
    }
  };

  const avgReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const getBoxStyle = () => {
    if (tooEarly) {
      return {
        backgroundColor: "#dc2626",
        borderColor: "#b91c1c",
      };
    }
    if (isGreen) {
      return {
        backgroundColor: "#16a34a",
        borderColor: "#15803d",
      };
    }
    return {
      backgroundColor: "#f0ad4e",
      borderColor: "#e09d3d",
    };
  };

  if (!difficulty) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center p-4">
                <h2 className="h3 mb-3 fw-bold">{t("dementia.games.reactionTime")}</h2>
                <p className="text-muted mb-4">{t("dementia.selectDifficulty")}</p>
        {error && (
                  <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}
                <div className="d-flex flex-column gap-3 mb-4">
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("easy")}
                  >
                    {t("dementia.easy")}
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("medium")}
                  >
                    {t("dementia.medium")}
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("hard")}
                  >
                    {t("dementia.hard")}
                  </button>
        </div>
                <button className="btn btn-outline-secondary w-100" onClick={handleExit}>
          {t("dementia.exit")}
        </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ position: 'relative' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <h2 className="h4 mb-0 fw-bold">
        {t("dementia.games.reactionTime")}
      </h2>
                <button className="btn btn-light btn-sm" onClick={handleExit}>
                  {t("dementia.exit")}
                </button>
              </div>
            </div>
            <div className="card-body">
      {error && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
                  <span>{error}</span>
                  <button className="btn btn-sm btn-danger" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

              <div className="row g-3 mb-4">
                <div className="col-4 col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="small text-muted mb-1">{t("dementia.round")}</div>
                    <div className="h5 mb-0 fw-bold">{round} / {maxRounds}</div>
                  </div>
                </div>
                <div className="col-4 col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="small text-muted mb-1">{t("dementia.score")}</div>
                    <div className="h5 mb-0 fw-bold text-success">{Math.round(score)}</div>
          </div>
          </div>
          {avgReactionTime > 0 && (
                  <div className="col-4 col-md-4">
                    <div className="text-center p-3 bg-light rounded">
                      <div className="small text-muted mb-1">{t("dementia.avgReactionTime", "Avg")}</div>
                      <div className="h5 mb-0 fw-bold text-primary">{avgReactionTime}ms</div>
                    </div>
            </div>
          )}
      </div>

      {tooEarly && (
                <div className="alert alert-danger text-center mb-4">
                  <strong>{t("dementia.tooEarly", "Too early! Wait for GREEN")}</strong>
        </div>
      )}

      {lastReactionTime !== null && !tooEarly && !isGreen && (
                <div className="alert alert-success text-center mb-4">
                  <strong>{t("dementia.reactionTime", "Reaction Time")}: {lastReactionTime}ms</strong>
        </div>
      )}

              <div className="text-center mb-4">
      <div
                  className="rounded d-flex align-items-center justify-content-center mx-auto"
        onClick={handleClick}
        style={{
          ...getBoxStyle(),
                    width: '300px',
                    height: '300px',
                    cursor: 'pointer',
          transition: "background-color 0.3s ease, border-color 0.3s ease",
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    border: '4px solid',
                    borderColor: tooEarly ? '#b91c1c' : isGreen ? '#15803d' : '#e09d3d'
        }}
      >
                  <p className="h3 mb-0 fw-bold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                    {isGreen ? "CLICK NOW!" : tooEarly ? "TOO EARLY!" : "Wait for GREEN"}
                  </p>
                </div>
      </div>

              <div className="alert alert-info text-center">
                <p className="mb-0">{t("dementia.reactionInstruction", "Click the box or press SPACEBAR when it turns green")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResult && (
        <ResultPopup
          score={Math.round(score)}
          time={totalTime}
          detail={{
            rounds: maxRounds,
            difficulty,
            averageScore: Math.round(score / maxRounds),
            averageReactionTime: avgReactionTime,
            bestReactionTime: reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0,
          }}
          onNext={handleNext}
          onRetry={() => handleNext(true)}
        />
      )}
    </div>
  );
}