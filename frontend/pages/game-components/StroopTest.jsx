import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/StroopTest.css";
import "../../css/game/GameComponentLayout.css";

const DIFFICULTY = {
  easy: { rounds: 5, colors: ["red", "green", "blue"] },
  medium: { rounds: 7, colors: ["red", "green", "blue", "yellow"] },
  hard: { rounds: 10, colors: ["red", "green", "blue", "yellow", "purple"] },
};

const shuffle = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function StroopTest({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [timer, setTimer] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [shuffledColors, setShuffledColors] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

  const intervalRef = useRef(null);
  const gameStartRef = useRef(0);

  const getColorStyle = (color) => {
    const colorMap = {
      red: "#dc2626",
      green: "#16a34a",
      blue: "#2563eb",
      yellow: "#eab308",
      purple: "#9333ea",
    };
    return {
      backgroundColor: colorMap[color] || color,
      color: "#fff",
      border: "3px solid rgba(255, 255, 255, 0.3)",
    };
  };

  const getTextColor = (color) => {
    const colorMap = {
      red: "#dc2626",
      green: "#16a34a",
      blue: "#2563eb",
      yellow: "#eab308",
      purple: "#9333ea",
    };
    return colorMap[color] || color;
  };

  const initRound = () => {
    if (!difficulty) return;
    const colors = DIFFICULTY[difficulty].colors;
    if (!colors || colors.length === 0) return;

    const word = colors[Math.floor(Math.random() * colors.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    setCurrentWord(word);
    setCurrentColor(color);
    setTimer(0);
    setShuffledColors(shuffle([...colors]));

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setShowResult(false);
    setTotalTime(0);
    setCurrentWord("");
    setCurrentColor("");
    setShuffledColors([]);
    gameStartRef.current = Date.now();
  };

  useEffect(() => {
    if (difficulty && !currentWord) {
      initRound();
    }
  }, [difficulty, currentWord]);

  const handleChoice = (color) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const baseScore = color === currentColor ? 10 : 0;
    const timePenalty = Math.min(timer, 10);
    const score = Math.max(0, baseScore - timePenalty);
    setTotalScore((prev) => prev + score);

    if (round < maxRounds) {
      setRound((prev) => prev + 1);
      setCurrentWord("");
      setCurrentColor("");
      setTimeout(() => {
        initRound();
      }, 300);
    } else {
      const finalTime = Math.floor((Date.now() - gameStartRef.current) / 1000);
      setTotalTime(finalTime);
      setShowResult(true);
    }
  };

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onExit?.();
  }, [onExit]);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExit]);

  const handleNext = (retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowResult(false);
    if (retry) {
      startGame(difficulty);
    } else {
      onFinish?.({
        key: "stroop_test",
        score: totalScore,
        time: totalTime,
        detail: {
          rounds: maxRounds,
          difficulty,
          time: totalTime,
          averageScore: Math.round(totalScore / maxRounds),
        },
      });
    }
  };

  if (!difficulty) {
    return (
      <div className="game-component-wrapper">
        <div className="game-component-container">
          <div className="game-component-card">
            <div className="game-component-body">
              <div className="text-center p-4">
                <h2 className="h3 mb-3 fw-bold">{t("dementia.games.stroopTest", "Stroop Test")}</h2>
                <p className="text-muted mb-3">
                  {t("dementia.stroopTest.description", "Test your cognitive flexibility by identifying the color of words, not the text itself.")}
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
                    <span className="badge bg-primary ms-2">({t("dementia.stroopTest.easyInfo", "3 colors, 5 rounds")})</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("medium")}
                  >
                    {t("dementia.medium", "Medium")}
                    <span className="badge bg-primary ms-2">({t("dementia.stroopTest.mediumInfo", "4 colors, 7 rounds")})</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("hard")}
                  >
                    {t("dementia.hard", "Hard")}
                    <span className="badge bg-primary ms-2">({t("dementia.stroopTest.hardInfo", "5 colors, 10 rounds")})</span>
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
            <h2>{t("dementia.games.stroopTest", "Stroop Test")}</h2>
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
              <p className="mb-0 fw-bold">
                {t("dementia.stroopInstruction", "Click the COLOR of the word, NOT the text!")}
              </p>
            </div>

            {currentWord && currentColor && shuffledColors.length > 0 ? (
              <>
                <div className="stroop-word-display text-center mb-4">
                  <div
                    className="stroop-word"
                    style={{
                      color: getTextColor(currentColor),
                      fontSize: "3rem",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      padding: "2rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      display: "inline-block",
                      minWidth: "200px"
                    }}
                  >
                    {currentWord.toUpperCase()}
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      marginTop: "1rem",
                      fontStyle: "italic",
                    }}
                  >
                    {t("dementia.stroopHint", "What color is this word?")}
                  </p>
                </div>

                <div className="stroop-grid d-flex justify-content-center flex-wrap gap-3 mb-4">
                  {shuffledColors.map((color, idx) => (
                    <button
                      key={`${color}-${idx}`}
                      className="stroop-color-btn btn btn-lg"
                      style={{
                        ...getColorStyle(color),
                        minWidth: "120px",
                        minHeight: "80px",
                        fontSize: "1rem",
                        fontWeight: "600"
                      }}
                      onClick={() => handleChoice(color)}
                    >
                      {color.toUpperCase()}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">
                  {t("dementia.loading", "Loading game...")}
                </p>
              </div>
            )}
          </div>
        </div>

        {showResult && (
          <ResultPopup
            score={totalScore}
            time={totalTime}
            detail={{
              rounds: maxRounds,
              difficulty,
              averageScore: Math.round(totalScore / maxRounds),
            }}
            onNext={handleNext}
            onRetry={() => handleNext(true)}
          />
        )}
      </div>
    </div>
  );
}