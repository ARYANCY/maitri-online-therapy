import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import {
  DIFFICULTY,
  generateGrid,
  checkMatch,
  getMatchScore,
  prepareMemoryMatchResult
} from "./game-algo-js/memoryMatch";

export default function MemoryMatch({ onFinish, onExit, ageGroup = "20-30" }) {
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

  const intervalRef = useRef(null);
  const gameStartRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
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
    try {
      const newGrid = generateGrid(DIFFICULTY[level].pairs);
      if (!newGrid || newGrid.length === 0) {
        throw new Error("Failed to generate grid");
      }
      setGrid(newGrid);
    } catch (error) {
      console.error("Error generating grid:", error);
      return;
    }
    setFlipped([]);
    setMatched([]);
    setTotalScore(0);
    setTimer(0);
    setTotalTime(0);
    setShowResult(false);
    gameStartRef.current = Date.now();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        setTimer((t) => t + 1);
        setTotalTime((tt) => tt + 1);
      }
    }, 1000);
  };

  const handleFlip = (index) => {
    if (flipped.includes(index) || matched.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (checkMatch(grid, first, second)) {
        setMatched((prev) => [...prev, first, second]);
        setTotalScore((prev) => prev + getMatchScore());
      }
      setTimeout(() => setFlipped([]), 700);
    }
  };

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onExit?.();
  }, [onExit]);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExit();
      } else if (e.key === "Backspace" && flipped.length > 0 && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setFlipped(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipped.length, handleExit]);

  useEffect(() => {
    if (matched.length === grid.length && grid.length > 0 && difficulty) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (round < maxRounds) {
        try {
          const newGrid = generateGrid(DIFFICULTY[difficulty].pairs);
          if (!newGrid || newGrid.length === 0) {
            throw new Error("Failed to generate grid");
          }
          setRound((prev) => prev + 1);
          setGrid(newGrid);
          setMatched([]);
          setFlipped([]);
          setTimer(0);
          if (isMountedRef.current) {
            intervalRef.current = setInterval(() => {
              if (isMountedRef.current) {
                setTimer((t) => t + 1);
                setTotalTime((tt) => tt + 1);
              }
            }, 1000);
          }
        } catch (error) {
          console.error("Error in round transition:", error);
        }
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (isMountedRef.current) {
          setShowResult(true);
        }
      }
    }
  }, [matched.length, grid.length, difficulty, round, maxRounds]);

  const handleNext = useCallback((retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowResult(false);
    if (retry) {
      startGame(difficulty);
    } else {
      try {
        const result = prepareMemoryMatchResult(totalScore, totalTime, difficulty, maxRounds, matched.length, flipped.length, ageGroup);
        onFinish?.(result);
      } catch (error) {
        console.error("Error preparing result:", error);
      }
    }
  }, [totalScore, totalTime, difficulty, maxRounds, matched.length, flipped.length, ageGroup, onFinish]);

  // Auto-start game with medium difficulty
  useEffect(() => {
    if (difficulty === "medium" && round === 1 && !showResult) {
      startGame("medium");
    }
  }, []);

  return (
    <div className="container-fluid py-4" style={{ position: 'relative' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <h2 className="h4 mb-0 fw-bold">
                  {t("dementia.games.memory")}
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

              <div className="d-flex justify-content-center flex-wrap gap-3" style={{maxWidth: '600px', margin: '0 auto'}}>
                {grid.map((item, idx) => {
                  const isFlipped = flipped.includes(idx);
                  const isMatched = matched.includes(idx);
                  const isVisible = isFlipped || isMatched;
                  return (
                    <button
                      key={idx}
                      className={`btn ${isMatched ? 'bg-success text-white' : isVisible ? 'bg-info text-white' : 'bg-secondary text-white'} border-0`}
                      style={{
                        width: '100px',
                        height: '100px',
                        minWidth: '100px',
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: isMatched ? '0 4px 12px rgba(34, 197, 94, 0.4)' : '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                      onClick={() => handleFlip(idx)}
                      disabled={isMatched || flipped.length >= 2}
                    >
                      {isVisible ? item : "?"}
                    </button>
                  );
                })}
              </div>
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
            matches: Math.floor(matched.length / 2),
            attempts: Math.floor(matched.length / 2) + Math.floor(flipped.length / 2)
          }}
          onNext={handleNext}
          onRetry={() => handleNext(true)}
        />
      )}
    </div>
  );
}
