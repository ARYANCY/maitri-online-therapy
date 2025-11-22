import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/MemoryMatch.css";

// Difficulty settings
const DIFFICULTY = {
  easy: { rounds: 5, pairs: 3 },
  medium: { rounds: 7, pairs: 6 },
  hard: { rounds: 10, pairs: 9 },
};

// Shuffle helper
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

export default function MemoryMatch({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [grid, setGrid] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [timer, setTimer] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const intervalRef = useRef(null);
  const gameStartRef = useRef(0);

  const generateGrid = useCallback((pairs) => {
    const items = Array.from({ length: pairs }, (_, i) => i + 1);
    const double = shuffleArray([...items, ...items]);
    return double;
  }, []);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    const newGrid = generateGrid(DIFFICULTY[level].pairs);
    setGrid(newGrid);
    setFlipped([]);
    setMatched([]);
    setTotalScore(0);
    setTimer(0);
    setShowResult(false);
    gameStartRef.current = Date.now();

    intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  const handleFlip = (index) => {
    if (flipped.includes(index) || matched.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (grid[first] === grid[second]) {
        setMatched((prev) => [...prev, first, second]);
        setTotalScore((prev) => prev + 10);
      }
      setTimeout(() => setFlipped([]), 700);
    }
  };

  useEffect(() => {
    if (matched.length === grid.length && grid.length > 0) {
      clearInterval(intervalRef.current);
      if (round < maxRounds) {
        setRound((prev) => prev + 1);
        const newGrid = generateGrid(DIFFICULTY[difficulty].pairs);
        setGrid(newGrid);
        setMatched([]);
        setFlipped([]);
        setTimer(0);
        intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
      } else {
        setShowResult(true);
      }
    }
  }, [matched, grid, difficulty, round, maxRounds, generateGrid]);

  const handleNext = (retry = false) => {
    setShowResult(false);
    if (retry) startGame(difficulty);
    else
      onFinish?.({
        key: "memory_match",
        score: totalScore,
        time: timer,
        detail: { rounds: maxRounds, difficulty, time: timer },
      });
  };

  if (!difficulty) {
    return (
      <div className="memory-menu">
        <h2>{t("dementia.games.memory")}</h2>
        <p>{t("dementia.selectDifficulty")}</p>
        <div className="memory-difficulty">
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
    <div className="memory-wrapper">
      {/* Game Name Headline */}
      <h2 style={{ textAlign: "center", marginBottom: "16px", fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
        {t("dementia.games.memory")}
      </h2>
      
      {/* Header */}
      <div className="memory-header">
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

      {/* Grid */}
      <div className="memory-grid">
        {grid.map((item, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          return (
            <button
              key={idx}
              className={`memory-cell ${isFlipped ? "flipped" : ""}`}
              onClick={() => handleFlip(idx)}
            >
              {isFlipped ? item : "?"}
            </button>
          );
        })}
      </div>

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
