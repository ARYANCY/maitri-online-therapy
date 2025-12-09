import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import {
  SYMBOLS,
  DIFFICULTY,
  generateGrid,
  checkMatch,
  getMatchScore,
  prepareSymbolMatchResult
} from "./game-algo-js/symbolMatch";

export default function SymbolMatch({ onFinish, onExit, ageGroup = "20-30" }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState("medium");
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [grid, setGrid] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [timer, setTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const intervalRef = useRef(null);
  const gameStartRef = useRef(0);
  const flipTimeoutRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    const newGrid = generateGrid(DIFFICULTY[level].pairs, level);
    setGrid(newGrid);
    setFlipped([]);
    setMatched([]);
    setTotalScore(0);
    setTimer(0);
    setTotalTime(0);
    setAttempts(0);
    setShowResult(false);
    setShowInstructions(false);
    setIsProcessing(false);
    gameStartRef.current = Date.now();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((t) => t + 1);
      setTotalTime((tt) => tt + 1);
    }, 1000);
  };

  const handleFlip = (index) => {
    if (isProcessing || flipped.includes(index) || matched.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setAttempts((prev) => prev + 1);
      const [first, second] = newFlipped;
      
      if (checkMatch(grid, first, second)) {
        
        setTimeout(() => {
          setMatched((prev) => [...prev, first, second]);
          setTotalScore((prev) => prev + getMatchScore());
          setFlipped([]);
          setIsProcessing(false);
        }, 500);
      } else {
        
        flipTimeoutRef.current = setTimeout(() => {
          setFlipped([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (matched.length === grid.length && grid.length > 0 && !isProcessing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (round < maxRounds) {
        setTimeout(() => {
          setRound((prev) => prev + 1);
          const newGrid = generateGrid(DIFFICULTY[difficulty].pairs, difficulty);
          setGrid(newGrid);
          setMatched([]);
          setFlipped([]);
          setTimer(0);
          setIsProcessing(false);
          intervalRef.current = setInterval(() => {
            setTimer((t) => t + 1);
            setTotalTime((tt) => tt + 1);
          }, 1000);
        }, 1000);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => setShowResult(true), 500);
      }
    }
      }, [matched, grid, difficulty, round, maxRounds, isProcessing]);

  const handleNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowResult(false);
    const result = prepareSymbolMatchResult(totalScore, totalTime, difficulty, maxRounds, matched.length, attempts, ageGroup);
    onFinish?.(result);
  };

  // Auto-start game with medium difficulty
  useEffect(() => {
    if (difficulty === "medium" && round === 1 && !showResult) {
      startGame("medium");
    }
  }, []);

  const progress = grid.length > 0 ? Math.round((matched.length / grid.length) * 100) : 0;

  return (
    <div className="container-fluid py-3">
      {showInstructions && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10020, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowInstructions(false)}>
          <div className="card shadow-lg" style={{ maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0">{t("dementia.howToPlay", "How to Play")}</h3>
              <button className="btn-close btn-close-white" onClick={() => setShowInstructions(false)}></button>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>{t("dementia.instruction1", "Click on cards to reveal symbols")}</li>
                <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>{t("dementia.instruction2", "Match pairs of identical symbols")}</li>
                <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>{t("dementia.instruction3", "Complete all rounds to finish")}</li>
                <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>{t("dementia.instruction4", "Score points for each successful match")}</li>
              </ul>
              <button className="btn btn-primary w-100" onClick={() => setShowInstructions(false)}>
                {t("dementia.startPlaying", "Start Playing")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0 fw-bold">{t("dementia.games.symbolMatch", "Symbol Matching")}</h2>
              <button className="btn btn-light btn-sm" onClick={onExit}>
                {t("dementia.exit", "Exit")}
              </button>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.round", "Round")}</div>
                      <div className="h6 mb-0 fw-bold">{round} / {maxRounds}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.score", "Score")}</div>
                      <div className="h6 mb-0 fw-bold text-success">{totalScore}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.timer", "Time")}</div>
                      <div className="h6 mb-0 fw-bold text-primary">{timer}s</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.attempts", "Attempts")}</div>
                      <div className="h6 mb-0 fw-bold">{attempts}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="progress" style={{ height: '25px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${progress}%` }}
                  >
                    {progress}%
                  </div>
                </div>
                <div className="text-center mt-2 small text-muted">{t("dementia.complete", "Complete")}</div>
              </div>

              <div className="d-flex justify-content-center flex-wrap gap-3 mb-4" style={{ 
                maxWidth: `${Math.ceil(Math.sqrt(grid.length)) * 110}px`,
                margin: '0 auto'
              }}>
                {grid.map((symbol, idx) => {
                  const isFlipped = flipped.includes(idx);
                  const isMatched = matched.includes(idx);
                  const isVisible = isFlipped || isMatched;
                  
                  return (
                    <button
                      key={idx}
                      className={`btn ${isMatched ? 'bg-success text-white' : isVisible ? 'bg-info text-white' : 'bg-secondary text-white'} border-0 position-relative`}
                      style={{
                        width: '100px',
                        height: '100px',
                        minWidth: '100px',
                        fontSize: '2rem',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden'
                      }}
                      onClick={() => handleFlip(idx)}
                      disabled={isProcessing || isMatched}
                      aria-label={isVisible ? `Symbol ${symbol}` : "Hidden card"}
                    >
                      {isVisible ? symbol : "?"}
                    </button>
                  );
                })}
              </div>

              {matched.length === grid.length && grid.length > 0 && round < maxRounds && (
                <div className="alert alert-success text-center">
                  <i className="bi bi-check-circle me-2"></i>
                  <strong>{t("dementia.roundComplete", "Round Complete!")}</strong>
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
            time: totalTime,
            averageScore: Math.round(totalScore / maxRounds),
            matches: Math.floor(matched.length / 2),
            attempts,
            accuracy: attempts > 0 ? Math.round((Math.floor(matched.length / 2) / attempts) * 100) : 0
          }}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

