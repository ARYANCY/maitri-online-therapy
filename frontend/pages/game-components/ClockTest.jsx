import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/ClockTest.css";

const DIFFICULTY = {
  easy: { rounds: 5, maxHour: 12, maxMinute: 59 },
  medium: { rounds: 7, maxHour: 12, maxMinute: 59 },
  hard: { rounds: 10, maxHour: 12, maxMinute: 59 },
};

export default function ClockTest({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [timer, setTimer] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [targetTime, setTargetTime] = useState({ hour: 0, minute: 0 });
  const [userTime, setUserTime] = useState({ hour: "", minute: "" });
  const [showResult, setShowResult] = useState(false);

  const intervalRef = useRef(null);
  const gameStartRef = useRef(0);

  const generateTargetTime = (level) => {
    const hour = Math.floor(Math.random() * DIFFICULTY[level].maxHour) + 1;
    const minute = Math.floor(Math.random() * (DIFFICULTY[level].maxMinute + 1));
    setTargetTime({ hour, minute });
    setUserTime({ hour: "", minute: "" });
  };

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setTimer(0);
    setShowResult(false);
    gameStartRef.current = Date.now();
    generateTargetTime(level);
    intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleSubmit = () => {
    // Calculate score: 10 pts for exact match, 5 pts for close (±1 hour/min)
    let score = 0;
    const hourDiff = Math.abs(userTime.hour - targetTime.hour);
    const minuteDiff = Math.abs(userTime.minute - targetTime.minute);

    if (hourDiff === 0 && minuteDiff === 0) score = 10;
    else if (hourDiff <= 1 && minuteDiff <= 5) score = 5;

    setTotalScore((prev) => prev + score);

    if (round < maxRounds) {
      setRound((prev) => prev + 1);
      generateTargetTime(difficulty);
    } else {
      clearInterval(intervalRef.current);
      setShowResult(true);
    }
  };

  const handleNext = (retry = false) => {
    setShowResult(false);
    if (retry) startGame(difficulty);
    else
      onFinish?.({
        key: "clock_test",
        score: totalScore,
        time: timer,
        detail: { rounds: maxRounds, difficulty, time: timer },
      });
  };

  if (!difficulty) {
    return (
      <div className="clock-menu">
        <h2>{t("dementia.games.clockTest")}</h2>
        <p>{t("dementia.selectDifficulty")}</p>
        <div className="clock-difficulty">
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
    <div className="clock-wrapper">
      {/* Game Name Headline */}
      <h2 style={{ textAlign: "center", marginBottom: "16px", fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
        {t("dementia.games.clockTest")}
      </h2>
      
      {/* Header */}
      <div className="clock-header">
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

      {/* Target Time */}
      <div className="clock-instructions">
        <p>Set the clock to this time:</p>
        <h3>
          {targetTime.hour.toString().padStart(2, "0")}:
          {targetTime.minute.toString().padStart(2, "0")}
        </h3>
      </div>

      {/* Input */}
      <div className="clock-input">
        <label>
          Hour:{" "}
          <input
            type="number"
            min="1"
            max="12"
            value={userTime.hour}
            onChange={(e) => setUserTime({ ...userTime, hour: Number(e.target.value) })}
          />
        </label>
        <label>
          Minute:{" "}
          <input
            type="number"
            min="0"
            max="59"
            value={userTime.minute}
            onChange={(e) => setUserTime({ ...userTime, minute: Number(e.target.value) })}
          />
        </label>
      </div>

      <button className="btn-submit" onClick={handleSubmit}>
        {t("dementia.submit")}
      </button>

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
