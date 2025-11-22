import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/ColorSequence.css";

const DIFFICULTY = {
  easy: { rounds: 5, sequenceLength: 3, colors: ["red", "green", "blue"] },
  medium: { rounds: 7, sequenceLength: 4, colors: ["red", "green", "blue", "yellow"] },
  hard: { rounds: 10, sequenceLength: 5, colors: ["red", "green", "blue", "yellow", "purple"] },
};

// Shuffle helper
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

export default function ColorSequence({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [timer, setTimer] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [phase, setPhase] = useState("show"); // show sequence / user input
  const [showResult, setShowResult] = useState(false);

  const intervalRef = useRef(null);
  const gameStartRef = useRef(0);

  const generateSequence = useCallback(() => {
    const colors = DIFFICULTY[difficulty].colors;
    const length = DIFFICULTY[difficulty].sequenceLength;
    const seq = Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);
    setSequence(seq);
    setUserSequence([]);
    setPhase("show");
  }, [difficulty]);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setTimer(0);
    setShowResult(false);
    gameStartRef.current = Date.now();
    generateSequence();
  };

  // Show sequence briefly, then allow user input
  useEffect(() => {
    if (phase === "show") {
      const timeout = setTimeout(() => setPhase("input"), 1000 * sequence.length);
      return () => clearTimeout(timeout);
    }
  }, [phase, sequence]);

  useEffect(() => {
    if (phase === "input" && userSequence.length === sequence.length) {
      // Check score
      let score = 0;
      userSequence.forEach((color, idx) => {
        if (color === sequence[idx]) score += 10;
      });
      setTotalScore((prev) => prev + score);

      if (round < maxRounds) {
        setRound((prev) => prev + 1);
        generateSequence();
      } else {
        setShowResult(true);
      }
    }
  }, [userSequence, sequence, round, maxRounds, generateSequence]);

  const handleUserClick = (color) => {
    if (phase !== "input") return;
    setUserSequence((prev) => [...prev, color]);
  };

  const handleNext = (retry = false) => {
    setShowResult(false);
    if (retry) startGame(difficulty);
    else
      onFinish?.({
        key: "color_sequence",
        score: totalScore,
        time: timer,
        detail: { rounds: maxRounds, difficulty, time: timer },
      });
  };

  if (!difficulty) {
    return (
      <div className="colorseq-menu">
        <h2>{t("dementia.games.colorSequence")}</h2>
        <p>{t("dementia.selectDifficulty")}</p>
        <div className="colorseq-difficulty">
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
    <div className="colorseq-wrapper">
      {/* Game Name Headline */}
      <h2 style={{ textAlign: "center", marginBottom: "16px", fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
        {t("dementia.games.colorSequence")}
      </h2>
      
      {/* Header */}
      <div className="colorseq-header">
        <div>
          <div>
            {t("dementia.round")} {round} / {maxRounds}
          </div>
          <div>{t("dementia.score")}: {totalScore}</div>
          <div>{t("dementia.timer")}: {timer}s</div>
        </div>
        <button className="btn-exit" onClick={onExit}>
          {t("dementia.exit")}
        </button>
      </div>

      {/* Instructions */}
      <div className="colorseq-instructions">
        {phase === "show" ? (
          <p>Memorize this sequence:</p>
        ) : (
          <p>Click the colors in the same order!</p>
        )}
        <div className="colorseq-display">
          {sequence.map((color, idx) => (
            <div
              key={idx}
              className={`colorseq-block ${phase === "show" ? color : "hidden"}`}
            ></div>
          ))}
        </div>
      </div>

      {/* User input buttons */}
      {phase === "input" && (
        <div className="colorseq-grid">
          {shuffleArray(DIFFICULTY[difficulty].colors).map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color, color: "#fff" }}
              onClick={() => handleUserClick(color)}
            >
              {color.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Result */}
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
