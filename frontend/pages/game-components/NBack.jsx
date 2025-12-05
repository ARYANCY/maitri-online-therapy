import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import {
  DIFFICULTY,
  SEQUENCE_LENGTH,
  generateSequence,
  calculateScore,
  prepareNBackResult
} from "./game-algo-js/nBack";

export default function NBack({ onFinish, onExit, ageGroup = "20-30" }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [userInputs, setUserInputs] = useState([]);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [phase, setPhase] = useState("show");
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [timePausedAt, setTimePausedAt] = useState(0);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const sequenceIntervalRef = useRef(null);
  const sequenceRef = useRef([]);

  const initRound = useCallback((levelOverride = null) => {
    try {
      const currentDifficulty = levelOverride || difficulty;
      if (!currentDifficulty) {
        setError("Difficulty not set");
        return;
      }
      
      setError(null);
      const { level } = DIFFICULTY[currentDifficulty];
      const newSequence = generateSequence(SEQUENCE_LENGTH);
      
      sequenceRef.current = newSequence;
      setSequence(newSequence);
      setUserInputs([]);
      setPhase("show");
      setTimer(0);
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimePausedAt(Date.now());

      if (sequenceIntervalRef.current) clearInterval(sequenceIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setCurrentIndex(0);
      
      let index = 1;
      sequenceIntervalRef.current = setInterval(() => {
        const currentSeq = sequenceRef.current;
        if (index < currentSeq.length) {
          setCurrentIndex(index);
          index++;
        } else {
          clearInterval(sequenceIntervalRef.current);
          setPhase("input");
          setCurrentIndex(-1);
          setTimer(0);
          const resumeTime = Date.now();
          const pausedDuration = resumeTime - (timePausedAt || Date.now());
          setAccumulatedTime(prev => prev + pausedDuration);
          intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
        }
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to initialize round");
      console.error("Error in initRound:", err);
    }
  }, [difficulty]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sequenceIntervalRef.current) clearInterval(sequenceIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "show" && sequence.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
    }
  }, [phase, sequence.length, currentIndex]);

  const startGame = (level) => {
    if (!DIFFICULTY[level]) {
      setError("Invalid difficulty level");
      return;
    }
    
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setGameStartTime(Date.now());
    setTotalTime(0);
    setAccumulatedTime(0);
    setTimePausedAt(Date.now());
    setShowResult(false);
    setSequence([]);
    setUserInputs([]);
    setCurrentIndex(-1);
    setPhase("show");
    setError(null);
    setTimeout(() => initRound(level), 200);
  };

  const handleInput = (value) => {
    if (phase !== "input") return;
    setUserInputs((prev) => [...prev, value]);
  };


  const submit = () => {
    try {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sequenceIntervalRef.current) clearInterval(sequenceIntervalRef.current);
      
      const level = DIFFICULTY[difficulty].level;
      const result = calculateScore(sequence, userInputs, level);
      setTotalScore((prev) => prev + result.score);

      const currentTime = Date.now();
      const activeTime = currentTime - (timePausedAt || gameStartTime);
      const finalAccumulated = accumulatedTime + activeTime;
      
      if (round < maxRounds) {
        setAccumulatedTime(finalAccumulated);
        setTimeout(() => {
          setRound((prev) => prev + 1);
          initRound();
        }, 500);
      } else {
        const finalTime = Math.floor(finalAccumulated / 1000);
        setTotalTime(finalTime);
        setShowResult(true);
      }
    } catch (err) {
      console.error("Error in submit:", err);
    }
  };

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (sequenceIntervalRef.current) clearInterval(sequenceIntervalRef.current);
    onExit?.();
  }, [onExit]);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExit();
      } else if (e.key === "Backspace" && phase === "input" && userInputs.length > 0 && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setUserInputs(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, userInputs.length, handleExit]);

  const handleNext = (retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (sequenceIntervalRef.current) clearInterval(sequenceIntervalRef.current);
    setShowResult(false);
    if (retry) {
      startGame(difficulty);
    } else {
      const currentTime = Date.now();
      const activeTime = currentTime - (timePausedAt || gameStartTime);
      const finalAccumulated = accumulatedTime + activeTime;
      const totalTime = Math.floor(finalAccumulated / 1000);
      const level = DIFFICULTY[difficulty].level;
      const lastRoundScore = calculateScore(sequence, userInputs, level);
      const result = prepareNBackResult(totalScore, totalTime, difficulty, maxRounds, lastRoundScore, ageGroup);
      onFinish?.(result);
    }
  };

  if (!difficulty) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center p-4">
                <h2 className="h3 mb-3 fw-bold">{t("dementia.games.nBack")}</h2>
                <p className="text-muted mb-4">{t("dementia.selectDifficulty")}</p>
                <div className="d-flex flex-column gap-3 mb-4">
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("easy")}
                  >
                    {t("dementia.easy")} <span className="badge bg-primary ms-2">1-Back</span>
          </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("medium")}
                  >
                    {t("dementia.medium")} <span className="badge bg-primary ms-2">2-Back</span>
          </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("hard")}
                  >
                    {t("dementia.hard")} <span className="badge bg-primary ms-2">3-Back</span>
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

  const nLevel = DIFFICULTY[difficulty].level;
  const currentNumber = sequence[currentIndex];

  return (
    <div className="container-fluid py-4" style={{ position: 'relative' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0 fw-bold">{t("dementia.games.nBack")}</h2>
              <button className="btn btn-light btn-sm" onClick={handleExit}>
                {t("dementia.exit")}
              </button>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
                  <span><strong>Error:</strong> {error}</span>
                  <button className="btn btn-sm btn-danger" onClick={() => setError(null)}>
                    Dismiss
                  </button>
                </div>
              )}

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.round")}</div>
                      <div className="h5 mb-0 fw-bold">{round} / {maxRounds}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.score")}</div>
                      <div className="h5 mb-0 fw-bold text-success">{totalScore}</div>
                    </div>
                  </div>
                </div>
                {phase === "input" && (
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body text-center">
                        <div className="small text-muted mb-1">{t("dementia.timer")}</div>
                        <div className="h5 mb-0 fw-bold text-primary">{timer}s</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

      {phase === "show" && (
                <div className="text-center mb-4">
                  <div className="alert alert-info mb-4">
                    <p className="mb-2 fw-bold fs-5">
                      👀 {t("dementia.nbackWatchSequence", "Watch the sequence carefully!")}
            </p>
                    <p className="mb-0">
              {t("dementia.nbackInstruction", {
                n: nLevel,
                defaultValue: `Remember the number that appeared ${nLevel} step${nLevel > 1 ? "s" : ""} back!`,
              })}
            </p>
          </div>
          {sequence.length === 0 && (
                    <div className="py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-3 text-muted">Loading sequence...</p>
            </div>
          )}
          {sequence.length > 0 && currentIndex >= 0 && currentIndex < sequence.length && (
                    <div>
                      <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold mb-3 mx-auto" style={{width: '200px', height: '200px', fontSize: '5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'}}>
                        {sequence[currentIndex]}
                      </div>
                      <p className="text-muted">
                {t("dementia.nbackPosition", "Position")}: {currentIndex + 1} / {sequence.length}
                      </p>
            </div>
          )}
        </div>
      )}

      {phase === "input" && sequence.length > 0 && (
                <div className="text-center">
                  <div className="alert alert-warning mb-4">
                    <p className="mb-2 fw-bold fs-5">
                      ✏️ {t("dementia.nbackEnterNumbers", "Enter the numbers you remember:")}
            </p>
                    <p className="mb-0">
              {t("dementia.nbackInputInstruction", {
                n: nLevel,
                defaultValue: `For each position, enter the number that appeared ${nLevel} step${nLevel > 1 ? "s" : ""} before.`,
              })}
            </p>
          </div>

                  <div className="mb-4">
                    <div className="d-flex flex-column gap-3 align-items-center">
              {Array.from({ length: Math.max(0, sequence.length - nLevel) }).map((_, idx) => {
                const position = idx + nLevel;
                const userInput = userInputs[idx];
                return (
                          <div key={idx} className="d-flex align-items-center gap-3 w-100" style={{maxWidth: '400px'}}>
                            <span className="fw-bold">#{position + 1}:</span>
                    <input
                      type="number"
                      id={`nback-input-${idx}`}
                      name={`nback-input-${idx}`}
                      min="1"
                      max="9"
                      value={userInput || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === "" ? "" : Number(value);
                        if (value === "" || (numValue >= 1 && numValue <= 9)) {
                          const newInputs = [...userInputs];
                          newInputs[idx] = numValue;
                          setUserInputs(newInputs);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && phase === "input") {
                          e.preventDefault();
                          
                          const nextIdx = idx + 1;
                          if (nextIdx < sequence.length - nLevel) {
                            const nextInput = document.getElementById(`nback-input-${nextIdx}`);
                            if (nextInput) {
                              nextInput.focus();
                            }
                          } else {
                            
                            submit();
                          }
                        }
                      }}
                              className="form-control text-center"
                      placeholder="?"
                              style={{maxWidth: '100px', fontSize: '1.5rem'}}
                    />
                  </div>
                );
              })}
            </div>
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
            ...(sequence.length > 0 && userInputs.length > 0 ? calculateScore(sequence, userInputs, nLevel) : { score: 0, correct: 0, total: 0 }),
          }}
          onNext={handleNext}
          onRetry={() => handleNext(true)}
        />
      )}
    </div>
  );
}