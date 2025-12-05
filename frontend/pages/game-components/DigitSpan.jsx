import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/DigitSpan.css";
import "../../css/game/GameComponentLayout.css";

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
  const [phase, setPhase] = useState("show");
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const initRound = useCallback((levelOverride = null) => {
    const currentDifficulty = levelOverride || difficulty;
    if (!currentDifficulty) return;
    const { length } = DIFFICULTY[currentDifficulty];
    const newSequence = Array.from({ length }, () =>
      Math.floor(Math.random() * 9) + 1
    );
    setSequence(newSequence);
    setUserInput("");
    setPhase("show");
    setTimer(0);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPhase("input");
      setTimer(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }, 2000);
  }, [difficulty]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startGame = (level) => {
    if (!DIFFICULTY[level]) {
      console.error("Invalid difficulty level:", level);
      return;
    }
    
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setGameStartTime(Date.now());
    setTotalTime(0);
    setShowResult(false);
    setPhase("show");
    setTimeout(() => initRound(level), 100);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setUserInput(value);
  };

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onExit?.();
  }, [onExit]);

  const handleUndo = useCallback(() => {
    if (phase === "input" && userInput.length > 0) {
      setUserInput(prev => prev.slice(0, -1));
    }
  }, [phase, userInput]);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExit();
      } else if (e.key === "Backspace" && phase === "input" && userInput.length > 0 && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setUserInput(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, userInput, handleExit]);

  const calculateScore = () => {
    if (!userInput || !sequence.length) return 0;
    const userDigits = userInput.split("").map(Number);
    let correct = 0;
    for (let i = 0; i < Math.min(userDigits.length, sequence.length); i++) {
      if (userDigits[i] === sequence[i]) {
        correct++;
      }
    }
    return correct * 10;
  };

  const submit = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const score = calculateScore();
    setTotalScore((prev) => prev + score);

    if (round < maxRounds) {
      setTimeout(() => {
        setRound((prev) => prev + 1);
        initRound();
      }, 500);
    } else {
      const finalTime = Math.floor((Date.now() - gameStartTime) / 1000);
      setTotalTime(finalTime);
      setShowResult(true);
    }
  };

  const handleNext = (retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowResult(false);
    if (retry) {
      startGame(difficulty);
    } else {
      onFinish?.({
        key: "digit_span",
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
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center p-4">
                <h2 className="h3 mb-3 fw-bold">{t("dementia.games.digitSpan")}</h2>
                <p className="text-muted mb-4">{t("dementia.selectDifficulty")}</p>
                <div className="d-flex flex-column gap-3 mb-4">
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("easy")}
                  >
                    {t("dementia.easy")} <span className="badge bg-primary ms-2">3 {t("dementia.digits", "digits")}</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("medium")}
                  >
                    {t("dementia.medium")} <span className="badge bg-primary ms-2">5 {t("dementia.digits", "digits")}</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("hard")}
                  >
                    {t("dementia.hard")} <span className="badge bg-primary ms-2">7 {t("dementia.digits", "digits")}</span>
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
    <div className="game-component-wrapper" style={{ position: 'relative' }}>
      <div className="game-component-container">
        <div className="game-component-card">
          <div className="game-component-header">
            <h2>{t("dementia.games.digitSpan")}</h2>
            <button className="btn btn-light btn-sm" onClick={handleExit}>
              {t("dementia.exit")}
            </button>
          </div>
          <div className="game-component-body">
            <div className="game-stats-row">
              <div className="game-stat-box">
                <div className="game-stat-label">{t("dementia.round")}</div>
                <div className="game-stat-value">{round} / {maxRounds}</div>
              </div>
              <div className="game-stat-box">
                <div className="game-stat-label">{t("dementia.score")}</div>
                <div className="game-stat-value" style={{ color: "#22c55e" }}>{totalScore}</div>
              </div>
              {phase === "input" && (
                <div className="game-stat-box">
                  <div className="game-stat-label">{t("dementia.timer")}</div>
                  <div className="game-stat-value" style={{ color: "#667eea" }}>{timer}s</div>
                </div>
              )}
            </div>

              {phase === "show" && sequence.length > 0 && (
                <div className="text-center mb-4">
                  <div className="alert alert-info mb-4">
                    <p className="mb-0 fw-bold fs-5">
                      👀 {t("dementia.digitMemorize", "Memorize the sequence!")}
                    </p>
                  </div>
                  <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
                    {sequence.map((digit, idx) => (
                      <div
                        key={idx}
                        className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: '80px',
                          height: '80px',
                          minWidth: '80px',
                          fontSize: '2rem',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        {digit}
                      </div>
                    ))}
                  </div>
                  <p className="text-muted small">
                    {t("dementia.digitSequenceWillHide", "The sequence will disappear in a moment...")}
                  </p>
                </div>
              )}

              {phase === "input" && (
                <div className="text-center">
                  <div className="alert alert-warning mb-4">
                    <p className="mb-0 fw-bold fs-5">
                      ✏️ {t("dementia.digitEnterSequence", "Enter the sequence you remember:")}
                    </p>
                  </div>
                  <div className="mb-4">
                    <input
                      type="text"
                      id="digit-span-input"
                      name="digit-span-input"
                      className="form-control form-control-lg text-center"
                      value={userInput}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && phase === "input" && userInput.trim()) {
                          e.preventDefault();
                          submit();
                        } else if (e.key === "Backspace" && userInput.length > 0) {
                          
                        }
                      }}
                      maxLength={DIFFICULTY[difficulty].length}
                      placeholder={t("dementia.digitInputPlaceholder", "Enter digits...")}
                      autoFocus
                      style={{ fontSize: '2rem', letterSpacing: '0.5rem', maxWidth: '400px', margin: '0 auto' }}
                    />
                  </div>
                  <div className="mb-4">
                    <button className="btn btn-primary btn-lg" onClick={submit}>
                      {t("dementia.submitAnswer")}
                    </button>
                  </div>
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
              correct: Math.round(totalScore / 10),
              total: maxRounds * DIFFICULTY[difficulty].length,
            }}
            onNext={handleNext}
            onRetry={() => handleNext(true)}
          />
        )}
      </div>
    </div>
  );
}