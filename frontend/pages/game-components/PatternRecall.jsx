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
  const [timer, setTimer] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [phase, setPhase] = useState("show"); 
  const [showResult, setShowResult] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [timePausedAt, setTimePausedAt] = useState(0);

  const intervalRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const inputTimeoutRef = useRef(null);
  const gameStartRef = useRef(0);
  const sequenceRef = useRef([]);
  const isShowingSequenceRef = useRef(false);

  const generateNewSequence = useCallback(() => {
    if (!difficulty) return;
    const seq = generateSequence(difficulty);
    setSequence(seq);
    sequenceRef.current = seq;
    setUserSequence([]);
    setPhase("show");
    setActiveIndex(-1);
    setError(false);
    isShowingSequenceRef.current = false;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimePausedAt(Date.now());
  }, [difficulty]);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setTimer(0);
    setShowResult(false);
    setGameStartTime(Date.now());
    setAccumulatedTime(0);
    setTimePausedAt(Date.now());
    gameStartRef.current = Date.now();
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setTimeout(() => {
      generateNewSequence();
    }, 100);
  };

  
  useEffect(() => {
    if (phase === "show" && sequence.length > 0 && difficulty && !isShowingSequenceRef.current) {
      isShowingSequenceRef.current = true;
      let currentIndex = 0;
      const showDuration = DIFFICULTY[difficulty].showDuration;
      
      const showSequence = () => {
        if (currentIndex < sequence.length) {
          setActiveIndex(currentIndex);
          setTimeout(() => {
            setActiveIndex(-1);
            currentIndex++;
            if (currentIndex < sequence.length) {
              setTimeout(showSequence, showDuration / 2);
            } else {
              
              setTimeout(() => {
                setPhase("input");
                setActiveIndex(-1);
                isShowingSequenceRef.current = false;
                
                const resumeTime = Date.now();
                const pausedDuration = resumeTime - timePausedAt;
                setAccumulatedTime(prev => prev + pausedDuration);
                
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = setInterval(() => {
                  setTimer((t) => t + 1);
                }, 1000);
                
                if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
                inputTimeoutRef.current = setTimeout(() => {
                  
                  handleRoundComplete(false);
                }, DIFFICULTY[difficulty].inputTimeout);
              }, 500);
            }
          }, showDuration);
        }
      };
      
      showSequence();
    }
    
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    };
  }, [phase, sequence.length, difficulty]);

  const handleRoundComplete = useCallback((isCorrect) => {
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const currentTime = Date.now();
    const activeTime = currentTime - (timePausedAt || gameStartTime);
    const finalAccumulated = accumulatedTime + activeTime;
    setAccumulatedTime(finalAccumulated);
    
    if (isCorrect) {
      const roundScore = calculateRoundScore(sequence.length);
      setTotalScore((prev) => prev + roundScore);
    }
    
    setPhase("complete");
    
    setTimeout(() => {
      if (round < maxRounds) {
        setRound((prev) => prev + 1);
        generateNewSequence();
      } else {
        const finalTime = Math.floor(finalAccumulated / 1000);
        setTotalTime(finalTime);
        setShowResult(true);
      }
    }, 1500);
  }, [round, maxRounds, sequence.length, generateNewSequence, accumulatedTime, timePausedAt, gameStartTime]);

  
  useEffect(() => {
    if (phase === "input" && userSequence.length === sequence.length && sequence.length > 0) {
      const isCorrect = checkSequence(userSequence, sequence);
      setError(!isCorrect);
      handleRoundComplete(isCorrect);
    }
  }, [userSequence, sequence, phase, handleRoundComplete]);

  const handleUserClick = (color) => {
    if (phase !== "input" || userSequence.length >= sequence.length) return;
    
    const newSequence = [...userSequence, color];
    setUserSequence(newSequence);
    
    
    if (newSequence.length <= sequence.length) {
      const isCorrect = isLatestInputCorrect(newSequence, sequence);
      if (!isCorrect) {
        setError(true);
        setTimeout(() => {
          handleRoundComplete(false);
        }, 500);
      }
    }
  };

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    onExit?.();
  }, [onExit]);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExit();
      } else if (e.key === "Backspace" && phase === "input" && userSequence.length > 0 && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setUserSequence(prev => prev.slice(0, -1));
        setError(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, userSequence.length, handleExit]);

  const handleNext = (retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    setShowResult(false);
    if (retry) {
      startGame(difficulty);
    } else {
      const currentTime = Date.now();
      const activeTime = currentTime - (timePausedAt || gameStartTime);
      const finalAccumulated = accumulatedTime + activeTime;
      const totalTime = Math.floor(finalAccumulated / 1000);
      const result = preparePatternRecallResult(totalScore, totalTime, difficulty, maxRounds, round, sequence.length, ageGroup);
      onFinish?.(result);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    };
  }, []);

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
                <div className="col-md-4">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.timer", "Timer")}</div>
                      <div className="h5 mb-0 fw-bold text-primary">{timer}s</div>
                    </div>
                  </div>
                </div>
              </div>

            <div className="alert alert-info text-center mb-4">
              {phase === "show" && (
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

              <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
                {sequence.map((color, idx) => (
                  <div
                    key={idx}
                    className={`rounded d-flex align-items-center justify-content-center fw-bold ${
                      phase === "show" && activeIndex === idx ? "" : phase === "show" ? "opacity-50" : "d-none"
                    }`}
                    style={{
                      ...(phase === "show" ? getColorStyle(color) : {}),
                      width: '100px',
                      height: '100px',
                      minWidth: '100px',
                      color: 'white',
                      fontSize: '1.2rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {phase === "show" && activeIndex === idx && (
                      <span className="text-white">{getColorName(color, t)}</span>
                    )}
                  </div>
                ))}
              </div>

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
                    {DIFFICULTY[difficulty].colors.map((color, idx) => (
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
          time={timer}
          detail={{
            rounds: maxRounds,
            difficulty,
            completedRounds: round,
            averageScore: Math.round(totalScore / maxRounds),
            accuracy: Math.round((totalScore / (maxRounds * sequence.length * 10)) * 100)
          }}
          onNext={() => handleNext(false)}
        />
      )}
    </div>
  );
}
