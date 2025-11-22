import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/NBack.css";

const DIFFICULTY = {
  easy: { level: 1, rounds: 5 },
  medium: { level: 2, rounds: 7 },
  hard: { level: 3, rounds: 10 },
};

export default function NBack({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [userInputs, setUserInputs] = useState([]);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [phase, setPhase] = useState("show"); // show/input
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Initialize round
  const initRound = useCallback(() => {
    const { level } = DIFFICULTY[difficulty];
    const newSequence = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 9)
    );
    setSequence(newSequence);
    setUserInputs([]);
    setPhase("show");

    timeoutRef.current = setTimeout(() => {
      setPhase("input");
      setTimer(0);
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }, 1500);
  }, [difficulty]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  // Start game
  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setGameStartTime(Date.now());
    setTotalTime(0);
    initRound();
  };

  // Handle user input
  const handleInput = (value) => {
    if (phase !== "input") return;
    setUserInputs((prev) => [...prev, value]);
  };

  // Calculate N-back score
  const calculateScore = () => {
    const level = DIFFICULTY[difficulty].level;
    let score = 0;
    for (let i = level; i < sequence.length; i++) {
      if (sequence[i] === userInputs[i]) score += 10;
    }
    return score;
  };

  // Submit answer
  const submit = () => {
    clearInterval(intervalRef.current);
    const score = calculateScore();
    setTotalScore((prev) => prev + score);

    if (round < maxRounds) {
      setRound((prev) => prev + 1);
      initRound();
    } else {
      const finalTime = Math.floor((Date.now() - gameStartTime) / 1000);
      setTotalTime(finalTime);
      setShowResult(true);
    }
  };

  const handleNext = (retry = false) => {
    setShowResult(false);
    if (retry) startGame(difficulty);
    else
      onFinish?.({
        key: "n_back",
        score: totalScore,
        time: totalTime,
        detail: { rounds: maxRounds, difficulty, time: totalTime },
      });
  };

  if (!difficulty) {
    return (
      <div className="nback-menu">
        <h2>{t("dementia.games.nBack")}</h2>
        <p>{t("dementia.selectDifficulty")}</p>
        <div className="nback-difficulty">
          <button onClick={() => startGame("easy")}>{t("dementia.easy")} (1-Back)</button>
          <button onClick={() => startGame("medium")}>{t("dementia.medium")} (2-Back)</button>
          <button onClick={() => startGame("hard")}>{t("dementia.hard")} (3-Back)</button>
        </div>
        <button className="btn btn-outline-secondary" onClick={onExit}>
          {t("dementia.exit")}
        </button>
      </div>
    );
  }

  return (
    <div className="nback-wrapper">
      {/* Game Name Headline */}
      <h2 style={{ textAlign: "center", marginBottom: "16px", fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
        {t("dementia.games.nBack")}
      </h2>
      
      {/* Header */}
      <div className="nback-header">
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
      {phase === "show" && (
        <div className="nback-instructions show-phase">
          <p>👀 Watch the sequence carefully!</p>
        </div>
      )}
      {phase === "input" && (
        <div className="nback-instructions input-phase">
          <p>✏️ Input the numbers you remember at each step.</p>
          <p>Timer: {timer}s</p>
        </div>
      )}

      {/* Input Buttons */}
      {phase === "input" && (
        <div className="nback-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <button key={i} onClick={() => handleInput(i)}>
              {i}
            </button>
          ))}
        </div>
      )}

      {/* Submit */}
      {phase === "input" && (
        <div className="nback-actions">
          <button className="btn-submit" onClick={submit}>
            {t("dementia.submitAnswer")}
          </button>
        </div>
      )}

      {/* Result Popup */}
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
  );
}
