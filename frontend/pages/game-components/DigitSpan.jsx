import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/DigitSpan.css";

const DIFFICULTY = {
  easy: { length: 3, rounds: 5 },
  medium: { length: 5, rounds: 7 },
  hard: { length: 7, rounds: 10 },
};

export default function DigitSpan({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState("");
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
    const { length } = DIFFICULTY[difficulty];
    const newSequence = Array.from({ length }, () =>
      Math.floor(Math.random() * 9)
    );
    setSequence(newSequence);
    setUserInput("");
    setPhase("show");

    timeoutRef.current = setTimeout(() => {
      setPhase("input");
      setTimer(0);
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }, 1500);
  }, [difficulty]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setGameStartTime(Date.now());
    setTotalTime(0);
    initRound();
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const calculateScore = () => {
    const correct = userInput
      .split("")
      .filter((num, idx) => parseInt(num) === sequence[idx]).length;
    return correct * 10;
  };

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
        key: "digit_span",
        score: totalScore,
        time: totalTime,
        detail: { rounds: maxRounds, difficulty, time: totalTime },
      });
  };

  if (!difficulty) {
    return (
      <div className="digit-menu">
        <h2>{t("dementia.games.digitSpan")}</h2>
        <p>{t("dementia.selectDifficulty")}</p>
        <div className="digit-difficulty">
          <button onClick={() => startGame("easy")}>{t("dementia.easy")} (3 {t("dementia.digits", "digits")})</button>
          <button onClick={() => startGame("medium")}>{t("dementia.medium")} (5 {t("dementia.digits", "digits")})</button>
          <button onClick={() => startGame("hard")}>{t("dementia.hard")} (7 {t("dementia.digits", "digits")})</button>
        </div>
        <button className="btn btn-outline-secondary" onClick={onExit}>
          {t("dementia.exit")}
        </button>
      </div>
    );
  }

  return (
    <div className="digit-wrapper">
      {/* Game Name Headline */}
      <h2 style={{ textAlign: "center", marginBottom: "16px", fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
        {t("dementia.games.digitSpan")}
      </h2>
      
      <div className="digit-header">
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

      {phase === "show" && (
        <div className="digit-instructions show-phase">
          <p>👀 Memorize the sequence!</p>
          <p>{sequence.join(" ")}</p>
        </div>
      )}

      {phase === "input" && (
        <div className="digit-instructions input-phase">
          <p>✏️ Enter the sequence you remember:</p>
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            maxLength={DIFFICULTY[difficulty].length}
          />
          <p>Timer: {timer}s</p>
        </div>
      )}

      {phase === "input" && (
        <div className="digit-actions">
          <button className="btn-submit" onClick={submit}>
            {t("dementia.submitAnswer")}
          </button>
        </div>
      )}

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
