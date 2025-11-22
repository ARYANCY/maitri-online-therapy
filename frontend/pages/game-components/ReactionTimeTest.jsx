import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/ReactionTimeTest.css";

const DIFFICULTY = {
  easy: { rounds: 5, minDelay: 1000, maxDelay: 3000 },
  medium: { rounds: 7, minDelay: 500, maxDelay: 2500 },
  hard: { rounds: 10, minDelay: 300, maxDelay: 2000 },
};

export default function ReactionTimeTest({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState("wait"); // wait/go
  const [buttonText, setButtonText] = useState("Start");

  const startTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const gameStartRef = useRef(0);

  const initRound = useCallback(() => {
    setPhase("wait");
    setButtonText("Wait for GREEN");
    const { minDelay, maxDelay } = DIFFICULTY[difficulty];
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    timeoutRef.current = setTimeout(() => {
      setPhase("go");
      setButtonText("CLICK NOW!");
      startTimeRef.current = Date.now();
    }, delay);
  }, [difficulty]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setScore(0);
    setTimer(0);
    gameStartRef.current = Date.now();
    initRound();
  };

  const handleClick = () => {
    if (phase !== "go") return; // ignore early clicks
    const reactionTime = Date.now() - startTimeRef.current;
    const roundScore = Math.max(0, 1000 - reactionTime); // faster = higher score
    setScore((prev) => prev + roundScore);

    if (round < maxRounds) {
      setRound((prev) => prev + 1);
      initRound();
    } else {
      const totalTime = Math.floor((Date.now() - gameStartRef.current) / 1000);
      setTimer(totalTime);
      setShowResult(true);
    }
  };

  const handleNext = (retry = false) => {
    setShowResult(false);
    if (retry) startGame(difficulty);
    else
      onFinish?.({
        key: "reaction_time",
        score,
        time: timer,
        detail: { rounds: maxRounds, difficulty, time: timer },
      });
  };

  if (!difficulty) {
    return (
      <div className="reaction-menu">
        <h2>{t("dementia.games.reactionTime")}</h2>
        <p>{t("dementia.selectDifficulty")}</p>
        <div className="reaction-difficulty">
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
    <div className="reaction-wrapper">
      {/* Game Name Headline */}
      <h2 style={{ textAlign: "center", marginBottom: "16px", fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
        {t("dementia.games.reactionTime")}
      </h2>
      
      <div className="reaction-header">
        <div>
          <div>
            {t("dementia.round")} {round} / {maxRounds}
          </div>
          <div>{t("dementia.score")}: {Math.round(score)}</div>
        </div>
        <button className="btn-exit" onClick={onExit}>
          {t("dementia.exit")}
        </button>
      </div>

      <div
        className={`reaction-box ${phase === "go" ? "go" : "wait"}`}
        onClick={handleClick}
      >
        <p>{buttonText}</p>
      </div>

      {showResult && (
        <ResultPopup
          score={Math.round(score)}
          time={timer}
          detail={{
            rounds: maxRounds,
            difficulty,
            averageScore: Math.round(score / maxRounds),
          }}
          onNext={handleNext}
          onRetry={() => handleNext(true)}
        />
      )}
    </div>
  );
}
