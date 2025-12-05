import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import "../../css/game/SymbolMatch.css";


const SYMBOLS = {
  easy: ["★", "●", "▲", "■", "◆", "♥"],
  medium: ["★", "●", "▲", "■", "◆", "♥", "♦", "♠", "♣", "☀", "☁", "☂"],
  hard: ["★", "●", "▲", "■", "◆", "♥", "♦", "♠", "♣", "☀", "☁", "☂", "☃", "☄", "☎", "☏", "☐", "☑", "☒", "☓"]
};

const DIFFICULTY = {
  easy: { rounds: 5, pairs: 4, timeLimit: 120 },
  medium: { rounds: 7, pairs: 6, timeLimit: 180 },
  hard: { rounds: 10, pairs: 9, timeLimit: 240 },
};

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function SymbolMatch({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  const generateGrid = useCallback((pairs, level) => {
    const symbolSet = SYMBOLS[level];
    const selectedSymbols = symbolSet.slice(0, pairs);
    const pairsArray = [...selectedSymbols, ...selectedSymbols];
    return shuffleArray(pairsArray);
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
      
      if (grid[first] === grid[second]) {
        
        setTimeout(() => {
          setMatched((prev) => [...prev, first, second]);
          setTotalScore((prev) => prev + 20);
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
  }, [matched, grid, difficulty, round, maxRounds, generateGrid, isProcessing]);

  const handleNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowResult(false);
    onFinish?.({
      key: "symbol_match",
      score: totalScore,
      time: totalTime,
      detail: {
        rounds: maxRounds,
        difficulty,
        time: totalTime,
        averageScore: Math.round(totalScore / maxRounds),
        matches: Math.floor(matched.length / 2),
        attempts,
        accuracy: attempts > 0 ? Math.round((Math.floor(matched.length / 2) / attempts) * 100) : 0
      },
    });
  };

  if (!difficulty) {
    return (
      <div className="symbol-match-menu">
        <div className="menu-header">
          <h2>{t("dementia.games.symbolMatch", "Symbol Matching")}</h2>
          <p className="menu-description">
            {t("dementia.symbolMatchDescription", "Test your visual memory and pattern recognition by matching pairs of symbols. This assessment evaluates your working memory and attention to detail.")}
          </p>
        </div>
        <div className="difficulty-selector">
          <h3>{t("dementia.selectDifficulty", "Select Difficulty")}</h3>
          <div className="difficulty-buttons">
            <button 
              className="difficulty-btn easy" 
              onClick={() => startGame("easy")}
            >
              <span className="difficulty-label">{t("dementia.easy", "Easy")}</span>
              <span className="difficulty-info">{DIFFICULTY.easy.pairs} pairs • {DIFFICULTY.easy.rounds} rounds</span>
            </button>
            <button 
              className="difficulty-btn medium" 
              onClick={() => startGame("medium")}
            >
              <span className="difficulty-label">{t("dementia.medium", "Medium")}</span>
              <span className="difficulty-info">{DIFFICULTY.medium.pairs} pairs • {DIFFICULTY.medium.rounds} rounds</span>
            </button>
            <button 
              className="difficulty-btn hard" 
              onClick={() => startGame("hard")}
            >
              <span className="difficulty-label">{t("dementia.hard", "Hard")}</span>
              <span className="difficulty-info">{DIFFICULTY.hard.pairs} pairs • {DIFFICULTY.hard.rounds} rounds</span>
            </button>
          </div>
        </div>
        <button className="btn-exit-menu" onClick={onExit}>
          {t("dementia.exit", "Exit")}
        </button>
      </div>
    );
  }

  const progress = grid.length > 0 ? Math.round((matched.length / grid.length) * 100) : 0;

  return (
    <div className="symbol-match-wrapper">
      
      <h2 className="game-title">
        {t("dementia.games.symbolMatch", "Symbol Matching")}
      </h2>

      
      {showInstructions && (
        <div className="instructions-overlay" onClick={() => setShowInstructions(false)}>
          <div className="instructions-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-instructions" onClick={() => setShowInstructions(false)}>×</button>
            <h3>{t("dementia.howToPlay", "How to Play")}</h3>
            <ul>
              <li>{t("dementia.instruction1", "Click on cards to reveal symbols")}</li>
              <li>{t("dementia.instruction2", "Match pairs of identical symbols")}</li>
              <li>{t("dementia.instruction3", "Complete all rounds to finish")}</li>
              <li>{t("dementia.instruction4", "Score points for each successful match")}</li>
            </ul>
            <button className="btn-start-playing" onClick={() => setShowInstructions(false)}>
              {t("dementia.startPlaying", "Start Playing")}
            </button>
          </div>
        </div>
      )}

      
      <div className="symbol-match-header">
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">{t("dementia.round", "Round")}</span>
            <span className="stat-value">{round} / {maxRounds}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t("dementia.score", "Score")}</span>
            <span className="stat-value">{totalScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t("dementia.timer", "Time")}</span>
            <span className="stat-value">{timer}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t("dementia.attempts", "Attempts")}</span>
            <span className="stat-value">{attempts}</span>
          </div>
        </div>
        <button className="btn-exit-game" onClick={onExit}>
          {t("dementia.exit", "Exit")}
        </button>
      </div>

      
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">{progress}% {t("dementia.complete", "Complete")}</span>
      </div>

      
      <div className="symbol-match-grid" style={{ 
        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(grid.length))}, 1fr)`,
        maxWidth: `${Math.ceil(Math.sqrt(grid.length)) * 100}px`
      }}>
        {grid.map((symbol, idx) => {
          const isFlipped = flipped.includes(idx);
          const isMatched = matched.includes(idx);
          const isVisible = isFlipped || isMatched;
          
          return (
            <button
              key={idx}
              className={`symbol-card ${isMatched ? "matched" : ""} ${isFlipped ? "flipped" : ""} ${isProcessing && isFlipped ? "processing" : ""}`}
              onClick={() => handleFlip(idx)}
              disabled={isProcessing || isMatched}
              aria-label={isVisible ? `Symbol ${symbol}` : "Hidden card"}
            >
              <div className="card-back">
                <span className="card-icon">?</span>
              </div>
              <div className="card-front">
                <span className="symbol-display">{symbol}</span>
              </div>
            </button>
          );
        })}
      </div>

      
      {matched.length === grid.length && grid.length > 0 && round < maxRounds && (
        <div className="round-complete">
          <div className="round-complete-content">
            <span className="complete-icon">✓</span>
            <span>{t("dementia.roundComplete", "Round Complete!")}</span>
          </div>
        </div>
      )}

      
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

