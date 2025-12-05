import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import {
  DIFFICULTY,
  getColorStyle,
  generateSequence,
  calculateRoundScore,
  isSequenceComplete,
  prepareColorSequenceResult
} from "./game-algo-js/colorSequence";

export default function ColorSequence({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [timer, setTimer] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [phase, setPhase] = useState("show");
  const [showResult, setShowResult] = useState(false);
  const [shuffledColors, setShuffledColors] = useState([]);

  const intervalRef = useRef(null);
  const gameStartRef = useRef(0);

  const generateNewSequence = useCallback(() => {
    if (!difficulty) return;
    const { sequence, shuffledColors } = generateSequence(difficulty);
    setSequence(sequence);
    setUserSequence([]);
    setPhase("show");
    setShuffledColors(shuffledColors);
  }, [difficulty]);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setTimer(0);
    setShowResult(false);
    gameStartRef.current = Date.now();
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    
    setTimeout(() => {
      const { sequence, shuffledColors } = generateSequence(level);
      setSequence(sequence);
      setUserSequence([]);
      setPhase("show");
      setShuffledColors(shuffledColors);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "show" && sequence.length > 0) {
      const timeout = setTimeout(() => {
        setPhase("input");
        if (difficulty && shuffledColors.length === 0) {
          const { shuffledColors: newShuffled } = generateSequence(difficulty);
          setShuffledColors(newShuffled);
        }
      }, 1000 * sequence.length);
      return () => clearTimeout(timeout);
    }
  }, [phase, sequence.length, difficulty, shuffledColors.length]);

  useEffect(() => {
    if (phase === "input" && isSequenceComplete(userSequence, sequence)) {
      const score = calculateRoundScore(userSequence, sequence);
      setTotalScore((prev) => prev + score);

      if (round < maxRounds) {
        setTimeout(() => {
          setRound((prev) => prev + 1);
          generateNewSequence();
        }, 500);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setShowResult(true);
      }
    }
  }, [userSequence, sequence, round, maxRounds, generateNewSequence, phase]);

  const handleUserClick = (color) => {
    if (phase !== "input" || userSequence.length >= sequence.length) return;
    setUserSequence((prev) => [...prev, color]);
  };

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onExit?.();
  }, [onExit]);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExit();
      } else if (e.key === "Backspace" && phase === "input" && userSequence.length > 0 && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setUserSequence(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, userSequence.length, handleExit]);

  const handleNext = (retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowResult(false);
    if (retry) {
      startGame(difficulty);
    } else {
      const result = prepareColorSequenceResult(totalScore, timer, difficulty, maxRounds);
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
                <h2 className="h3 mb-3 fw-bold">{t("dementia.games.colorSequence")}</h2>
                <p className="text-muted mb-4">{t("dementia.selectDifficulty")}</p>
                <div className="d-flex flex-column gap-3 mb-4">
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("easy")}
                  >
                    {t("dementia.easy")}
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("medium")}
                  >
                    {t("dementia.medium")}
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("hard")}
                  >
                    {t("dementia.hard")}
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
    <div className="container-fluid py-4" style={{ position: 'relative' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <h2 className="h4 mb-0 fw-bold">
        {t("dementia.games.colorSequence")}
      </h2>
                <button className="btn btn-light btn-sm" onClick={handleExit}>
          {t("dementia.exit")}
        </button>
      </div>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-4">
                <div className="col-4 col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="small text-muted mb-1">{t("dementia.round")}</div>
                    <div className="h5 mb-0 fw-bold">{round} / {maxRounds}</div>
                  </div>
                </div>
                <div className="col-4 col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="small text-muted mb-1">{t("dementia.score")}</div>
                    <div className="h5 mb-0 fw-bold text-success">{totalScore}</div>
                  </div>
                </div>
                <div className="col-4 col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="small text-muted mb-1">{t("dementia.timer")}</div>
                    <div className="h5 mb-0 fw-bold text-primary">{timer}s</div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info text-center mb-4">
        {phase === "show" ? (
                  <p className="mb-0 fw-bold">
            {t("dementia.colorSequence.memorizeSequence", "Memorize this sequence:")}
          </p>
        ) : (
                  <p className="mb-0 fw-bold">
            {t("dementia.colorSequence.clickColorsOrder", "Click the colors in the same order!")}
          </p>
        )}
              </div>

              {phase === "show" && (
                <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
          {sequence.map((color, idx) => (
            <div
              key={idx}
                      className="rounded"
                      style={{
                        ...getColorStyle(color),
                        width: '80px',
                        height: '80px',
                        minWidth: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
            ></div>
          ))}
        </div>
              )}

              {phase === "input" && shuffledColors.length > 0 && (
                <div className="mb-4">
                  <p className="text-center fw-bold mb-3">{t("dementia.colorSequence.yourSequence", "Your sequence:")}</p>
                  <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
                    {Array.from({ length: sequence.length }).map((_, idx) => {
                      const color = userSequence[idx];
                      return (
                        <div
                          key={idx}
                          className="rounded d-flex align-items-center justify-content-center"
                          style={{
                            ...(color ? getColorStyle(color) : { backgroundColor: '#e9ecef', border: '2px dashed #adb5bd' }),
                            width: '80px',
                            height: '80px',
                            minWidth: '80px',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: color ? 'white' : '#6c757d',
                            textShadow: color ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
                          }}
                        >
                          {!color && "?"}
                        </div>
                      );
                    })}
      </div>

                  <div className="d-flex justify-content-center gap-3 flex-wrap">
          {shuffledColors.map((color, idx) => (
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
                          fontSize: '1.1rem',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          border: 'none',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}
              onClick={() => handleUserClick(color)}
              disabled={userSequence.length >= sequence.length}
            >
              {color.toUpperCase()}
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
            averageScore: Math.round(totalScore / maxRounds),
          }}
          onNext={handleNext}
          onRetry={() => handleNext(true)}
        />
      )}
    </div>
  );
}
