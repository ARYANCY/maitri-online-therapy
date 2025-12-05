import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ResultPopup from "./ResultPopup";
import {
  DIFFICULTY,
  generateStimulus,
  calculateRoundScore,
  getShuffledColors,
  getColorStyle,
  getTextColor,
  prepareStroopTestResult
} from "./game-algo-js/stroopTest";

export default function StroopTest({ onFinish, onExit, ageGroup = "20-30" }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [timer, setTimer] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [shuffledColors, setShuffledColors] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

  const intervalRef = useRef(null);
  const gameStartRef = useRef(0);

  const initRound = () => {
    if (!difficulty) return;

    const { word, color } = generateStimulus(difficulty);
    setCurrentWord(word);
    setCurrentColor(color);
    setTimer(0);
    setShuffledColors(getShuffledColors(difficulty));

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startGame = (level) => {
    setDifficulty(level);
    setRound(1);
    setMaxRounds(DIFFICULTY[level].rounds);
    setTotalScore(0);
    setShowResult(false);
    setTotalTime(0);
    setCurrentWord("");
    setCurrentColor("");
    setShuffledColors([]);
    gameStartRef.current = Date.now();
  };

  useEffect(() => {
    if (difficulty && !currentWord) {
      initRound();
    }
  }, [difficulty, currentWord]);

  const handleChoice = (color) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const score = calculateRoundScore(color, currentColor, timer);
    setTotalScore((prev) => prev + score);

    if (round < maxRounds) {
      setRound((prev) => prev + 1);
      setCurrentWord("");
      setCurrentColor("");
      setTimeout(() => {
        initRound();
      }, 300);
    } else {
      const finalTime = Math.floor((Date.now() - gameStartRef.current) / 1000);
      setTotalTime(finalTime);
      setShowResult(true);
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExit]);

  const handleNext = (retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowResult(false);
    if (retry) {
      startGame(difficulty);
    } else {
      const result = prepareStroopTestResult(totalScore, totalTime, difficulty, maxRounds, ageGroup);
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
                <h2 className="h3 mb-3 fw-bold">{t("dementia.games.stroopTest", "Stroop Test")}</h2>
                <p className="text-muted mb-3">
                  {t("dementia.stroopTest.description", "Test your cognitive flexibility by identifying the color of words, not the text itself.")}
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
                    <span className="badge bg-primary ms-2">({t("dementia.stroopTest.easyInfo", "3 colors, 5 rounds")})</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("medium")}
                  >
                    {t("dementia.medium", "Medium")}
                    <span className="badge bg-primary ms-2">({t("dementia.stroopTest.mediumInfo", "4 colors, 7 rounds")})</span>
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => startGame("hard")}
                  >
                    {t("dementia.hard", "Hard")}
                    <span className="badge bg-primary ms-2">({t("dementia.stroopTest.hardInfo", "5 colors, 10 rounds")})</span>
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
              <h2 className="h4 mb-0 fw-bold">{t("dementia.games.stroopTest", "Stroop Test")}</h2>
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
              <p className="mb-0 fw-bold">
                {t("dementia.stroopInstruction", "Click the COLOR of the word, NOT the text!")}
              </p>
            </div>

            {currentWord && currentColor && shuffledColors.length > 0 ? (
              <>
                <div className="text-center mb-4">
                  <div
                    className="d-inline-block p-4 rounded bg-light"
                    style={{
                      color: getTextColor(currentColor),
                      fontSize: "3rem",
                      fontWeight: "bold",
                      minWidth: "200px"
                    }}
                  >
                    {currentWord.toUpperCase()}
                  </div>
                  <p className="text-muted mt-3 small fst-italic">
                    {t("dementia.stroopHint", "What color is this word?")}
                  </p>
                </div>

                <div className="d-flex justify-content-center flex-wrap gap-3 mb-4">
                  {shuffledColors.map((color, idx) => (
                    <button
                      key={`${color}-${idx}`}
                      className="stroop-color-btn btn btn-lg"
                    style={{
                      ...getColorStyle(color),
                      color: "#fff",
                      border: "3px solid rgba(255, 255, 255, 0.3)",
                      minWidth: "120px",
                      minHeight: "80px",
                      fontSize: "1rem",
                      fontWeight: "600"
                    }}
                      onClick={() => handleChoice(color)}
                    >
                      {color.toUpperCase()}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">
                  {t("dementia.loading", "Loading game...")}
                </p>
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
          }}
          onNext={handleNext}
          onRetry={() => handleNext(true)}
        />
      )}
    </div>
  );
}