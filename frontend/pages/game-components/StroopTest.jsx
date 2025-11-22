import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/StroopTest.css";

const DIFFICULTY = {
  easy: { rounds: 5, colors: ["red", "green", "blue"] },
  medium: { rounds: 7, colors: ["red", "green", "blue", "yellow"] },
  hard: { rounds: 10, colors: ["red", "green", "blue", "yellow", "purple"] },
};

// Shuffle helper
const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

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
  const [phase, setPhase] = useState("show"); // show/input

  const intervalRef = useRef(null);
  const gameStartRef = useRef(0);

  const initRound = useCallback(() => {
    const colors = DIFFICULTY[difficulty].colors;
    const word = colors[Math.floor(Math.random() * colors.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    setCurrentWord(word);
    setCurrentColor(color);
    setPhase("input");
    setTimer(0);
    intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  }, [difficulty]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    gameStartRef.current = Date.now();
    initRound();
  };

  const handleChoice = (color) => {
    if (phase !== "input") return;
    clearInterval(intervalRef.current);
    // Score: 10 if correct, 0 if wrong, minus 1 per extra second
    const baseScore = color === currentColor ? 10 : 0;
    const timePenalty = Math.min(timer, 10); // max 10 pts penalty
    const score = Math.max(0, baseScore - timePenalty);
    setTotalScore((prev) => prev + score);

    if (round < maxRounds) {
      setRound((prev) => prev + 1);
      initRound();
    } else {
      const finalTime = Math.floor((Date.now() - gameStartRef.current) / 1000);
      setTimer(finalTime);
      setShowResult(true);
    }
  };

  const handleNext = (retry = false) => {
    setShowResult(false);
    if (retry) startGame(difficulty);
    else
      onFinish?.({
        key: "stroop_test",
        score: totalScore,
        time: timer,
        detail: { rounds: maxRounds, difficulty, time: timer },
      });
  };

  if (!difficulty) {
    return (
      <div className="stroop-menu">
        <h2>{t("dementia.games.stroopTest")}</h2>
        <p>{t("dementia.selectDifficulty")}</p>
        <div className="stroop-difficulty">
          <button onClick={() => startGame("easy")}>{t("dementia.easy")}</button>
          <button onClick={() => startGame("medium")}>{t("dementia.medium")}</button>
          <button onClick={() => startGame("hard")}>{t("dementia.hard")}</button>
        </div>
        <button className="btn btn-outline-secondary" onClick={onExit}>
          {t("dementia.exit")}
        </button>
      </div>
    );
  }

  return (
    <div className="stroop-wrapper">
      {/* Game Name Headline */}
      <h2 style={{ textAlign: "center", marginBottom: "16px", fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
        {t("dementia.games.stroopTest")}
      </h2>
      
      {/* Header */}
      <div className="stroop-header">
        <div>
          <div>
            {t("dementia.round")} {round} / {maxRounds}
          </div>
          <div>{t("dementia.score")}: {totalScore}</div>
        </div>
        <button className="btn-exit" onClick={onExit}>
          {t("dementia.exit")}
        </button>
      </div>

      {/* Instructions */}
      {phase === "input" && (
        <div className="stroop-instructions">
          <p>Click the color of the word, not the text!</p>
          <p style={{ color: currentColor, fontSize: "32px" }}>{currentWord}</p>
          <p>Timer: {timer}s</p>
        </div>
      )}

      {/* Choice buttons */}
      {phase === "input" && (
        <div className="stroop-grid">
          {shuffle(DIFFICULTY[difficulty].colors).map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color, color: "#fff" }}
              onClick={() => handleChoice(color)}
            >
              {color.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Result Popup */}
      {showResult && (
        <ResultPopup
          score={totalScore}
          time={timer}
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
  );
}
