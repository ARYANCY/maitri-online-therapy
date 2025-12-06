import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import {
  DIFFICULTY,
  getColorStyle,
  getColorName,
  generateSequence,
  checkSequence,
  isLatestInputCorrect,
  calculateRoundScore,
  preparePatternRecallResult
} from "./game-algo-js/patternRecall";

export default function PatternRecall({ onFinish, onExit, ageGroup = "20-30" }) {
  const { t } = useTranslation();
  
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(4);
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const intervalRef = useRef(null);
  const sequenceTimeoutRef = useRef(null);
  const inputTimeoutRef = useRef(null);
  const gameStartTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const accumulatedPausedTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
      if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    };
  }, []);

  const startGame = useCallback((level) => {
    if (!DIFFICULTY[level]) {
      console.error("Invalid difficulty:", level);
      return;
    }

    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setTimer(0);
    setTotalTime(0);
    setShowResult(false);
    setError(false);
    setUserSequence([]);
    setActiveIndex(-1);
    gameStartTimeRef.current = Date.now();
    accumulatedPausedTimeRef.current = 0;
    pausedTimeRef.current = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);

    setTimeout(() => {
      if (isMountedRef.current) {
        startRound(level);
      }
    }, 100);
  }, []);

  const startRound = useCallback((levelOverride = null) => {
    const currentLevel = levelOverride || difficulty;
    if (!currentLevel || !DIFFICULTY[currentLevel]) return;

    try {
      const newSequence = generateSequence(currentLevel);
      if (!newSequence || newSequence.length === 0) {
        throw new Error("Failed to generate sequence");
      }

      setSequence(newSequence);
      setUserSequence([]);
      setError(false);
      setActiveIndex(-1);
      setPhase("showing");
      setTimer(0);

      if (intervalRef.current) clearInterval(intervalRef.current);
      pausedTimeRef.current = Date.now();

      showSequence(newSequence, currentLevel);
    } catch (error) {
      console.error("Error starting round:", error);
    }
  }, [difficulty]);

  const showSequence = useCallback((seq, level) => {
    if (!seq || seq.length === 0) return;

    const showDuration = DIFFICULTY[level]?.showDuration || 800;
    let currentIdx = 0;

    const showNext = () => {
      if (!isMountedRef.current || currentIdx >= seq.length) {
        if (isMountedRef.current) {
          setActiveIndex(-1);
          setTimeout(() => {
            if (isMountedRef.current) {
              setPhase("input");
              const resumeTime = Date.now();
              const pausedDuration = resumeTime - pausedTimeRef.current;
              accumulatedPausedTimeRef.current += pausedDuration;
              pausedTimeRef.current = 0;
              gameStartTimeRef.current = Date.now();

              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => {
                if (isMountedRef.current) {
                  setTimer((prev) => prev + 1);
                }
              }, 1000);

              const inputTimeout = DIFFICULTY[level]?.inputTimeout || 15000;
              if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
              inputTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                  handleRoundComplete(false);
                }
              }, inputTimeout);
            }
          }, 500);
        }
        return;
      }

      if (isMountedRef.current) {
        setActiveIndex(currentIdx);
      }

      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setActiveIndex(-1);
          currentIdx++;
          setTimeout(showNext, showDuration / 2);
        }
      }, showDuration);
    };

    setTimeout(() => {
      if (isMountedRef.current) {
        showNext();
      }
    }, 200);
  }, []);

  const handleUserClick = useCallback((color) => {
    if (phase !== "input" || userSequence.length >= sequence.length) return;

    const newSequence = [...userSequence, color];
    setUserSequence(newSequence);
    setError(false);

    if (newSequence.length <= sequence.length) {
      const isCorrect = isLatestInputCorrect(newSequence, sequence);
      if (!isCorrect) {
        setError(true);
        setTimeout(() => {
          if (isMountedRef.current) {
            handleRoundComplete(false);
          }
        }, 500);
        return;
      }

      if (newSequence.length === sequence.length) {
        const isFullCorrect = checkSequence(newSequence, sequence);
        if (isFullCorrect) {
          handleRoundComplete(true);
        } else {
          setError(true);
          setTimeout(() => {
            if (isMountedRef.current) {
              handleRoundComplete(false);
            }
          }, 500);
        }
      }
    }
  }, [phase, userSequence, sequence]);

  const handleRoundComplete = useCallback((isCorrect) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);

    const currentTime = Date.now();
    const activeTime = currentTime - gameStartTimeRef.current;
    const finalTime = Math.floor((accumulatedPausedTimeRef.current + activeTime) / 1000);
    setTotalTime(finalTime);

    if (isCorrect) {
      const roundScore = calculateRoundScore(sequence.length);
      setTotalScore((prev) => prev + roundScore);
    }

    setPhase("complete");

    setTimeout(() => {
      if (!isMountedRef.current) return;

      if (round < maxRounds) {
        setRound((prev) => prev + 1);
        startRound();
      } else {
        setShowResult(true);
      }
    }, 1500);
  }, [round, maxRounds, sequence.length, startRound]);

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    onExit?.();
  }, [onExit]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExit();
      } else if (e.key === "Backspace" && phase === "input" && userSequence.length > 0 && 
                 document.activeElement?.tagName !== "INPUT" && 
                 document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setUserSequence((prev) => prev.slice(0, -1));
        setError(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, userSequence.length, handleExit]);

  const handleNext = useCallback((retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    
    setShowResult(false);
    if (retry) {
      startGame(difficulty);
    } else {
      const result = preparePatternRecallResult(
        totalScore,
        totalTime,
        difficulty,
        maxRounds,
        round,
        sequence.length,
        ageGroup
      );
      onFinish?.(result);
    }
  }, [totalScore, totalTime, difficulty, maxRounds, round, sequence.length, ageGroup, onFinish, startGame]);

  if (!difficulty) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center p-4">
                <h2 className="h3 mb-3 fw-bold">{t("dementia.games.patternRecall", "Pattern Recall")}</h2>
                <p className="text-muted mb-3">
                  {t("dementia.patternRecall.description", "Test your memory by repeating color sequences. Watch the pattern and then click the colors in the same order.")}
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
                    <span className="badge bg-primary ms-2">({t("dementia.patternRecall.easyInfo", "3 colors, 4 rounds")})</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("medium")}
                  >
                    {t("dementia.medium", "Medium")}
                    <span className="badge bg-primary ms-2">({t("dementia.patternRecall.mediumInfo", "4 colors, 6 rounds")})</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("hard")}
                  >
                    {t("dementia.hard", "Hard")}
                    <span className="badge bg-primary ms-2">({t("dementia.patternRecall.hardInfo", "5 colors, 8 rounds")})</span>
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
    <div className="container-fluid py-4" style={{ position: 'relative' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0 fw-bold">{t("dementia.games.patternRecall", "Pattern Recall")}</h2>
              <button className="btn btn-light btn-sm" onClick={handleExit}>
                {t("dementia.exit", "Exit")}
              </button>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.round", "Round")}</div>
                      <div className="h5 mb-0 fw-bold">{round} / {maxRounds}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.score", "Score")}</div>
                      <div className="h5 mb-0 fw-bold text-success">{totalScore}</div>
                    </div>
                  </div>
                </div>
                {phase === "input" && (
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body text-center">
                        <div className="small text-muted mb-1">{t("dementia.timer", "Timer")}</div>
                        <div className="h5 mb-0 fw-bold text-primary">{timer}s</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="alert alert-info text-center mb-4">
                {phase === "showing" && (
                  <p className="mb-0 fw-bold">
                    {t("dementia.patternRecall.watchSequence", "Watch the sequence carefully...")}
                  </p>
                )}
                {phase === "input" && (
                  <p className="mb-0 fw-bold">
                    {t("dementia.patternRecall.repeatSequence", "Now repeat the sequence by clicking the colors in order!")}
                  </p>
                )}
                {phase === "complete" && (
                  <p className={`mb-0 fw-bold ${error ? "text-danger" : "text-success"}`}>
                    {error 
                      ? t("dementia.patternRecall.incorrect", "Incorrect sequence. Moving to next round...")
                      : t("dementia.patternRecall.correct", "Correct! Well done!")}
                  </p>
                )}
              </div>

              {phase === "showing" && sequence.length > 0 && (
                <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
                  {sequence.map((color, idx) => (
                    <div
                      key={idx}
                      className={`rounded d-flex align-items-center justify-content-center fw-bold ${
                        activeIndex === idx ? "" : "opacity-25"
                      }`}
                      style={{
                        ...getColorStyle(color),
                        width: '100px',
                        height: '100px',
                        minWidth: '100px',
                        color: 'white',
                        fontSize: '1.2rem',
                        transition: 'all 0.3s ease',
                        border: activeIndex === idx ? '3px solid white' : 'none',
                        transform: activeIndex === idx ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: activeIndex === idx ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      {activeIndex === idx && (
                        <span className="text-white fw-bold">{getColorName(color, t)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {phase === "input" && (
                <div>
                  <p className="text-center fw-bold mb-3">
                    {t("dementia.patternRecall.yourSequence", "Your sequence:")}
                  </p>
                  <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
                    {Array.from({ length: sequence.length }).map((_, idx) => {
                      const color = userSequence[idx];
                      return (
                        <div
                          key={idx}
                          className={`rounded d-flex align-items-center justify-content-center ${
                            error && idx === userSequence.length - 1 ? "border border-danger border-3" : ""
                          }`}
                          style={{
                            ...(color ? getColorStyle(color) : { backgroundColor: '#e9ecef', border: '2px dashed #adb5bd' }),
                            width: '80px',
                            height: '80px',
                            minWidth: '80px',
                            color: color ? 'white' : '#6c757d',
                            fontSize: '0.9rem'
                          }}
                        >
                          {!color && <span>?</span>}
                          {color && <span className="text-white small">{getColorName(color, t)}</span>}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    {DIFFICULTY[difficulty]?.colors?.map((color, idx) => (
                      <button
                        key={`${color}-${idx}`}
                        className="btn rounded"
                        style={{
                          ...getColorStyle(color),
                          width: '100px',
                          height: '100px',
                          minWidth: '100px',
                          color: 'white',
                          fontWeight: 'bold',
                          border: 'none'
                        }}
                        onClick={() => handleUserClick(color)}
                        disabled={userSequence.length >= sequence.length || phase !== "input"}
                      >
                        {getColorName(color, t)}
                      </button>
                    ))}
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
            completedRounds: round,
            averageScore: Math.round(totalScore / maxRounds),
            accuracy: Math.round((totalScore / (maxRounds * sequence.length * 10)) * 100)
          }}
          onNext={() => handleNext(false)}
          onRetry={() => handleNext(true)}
        />
      )}
    </div>
  );
}

