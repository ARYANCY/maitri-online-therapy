import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Stage, Layer, Line } from "react-konva";
import ResultPopup from "./ResultPopup";
import { 
  CANVAS_SIZE, 
  CLOCK_RADIUS, 
  CLOCK_CENTER,
  getRandomTargetTime,
  formatTime,
  analyzeClockDrawing as analyzeClockDrawingAlgo,
  prepareClockDrawingResult
} from "./game-algo-js/clockDrawing";

export default function ClockDrawing({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState("draw"); 
  const [lines, setLines] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [targetTime, setTargetTime] = useState({ hour: 11, minute: 10 });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZE);
  const [isReady, setIsReady] = useState(false);

  const stageRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  
  const isReadyRef = useRef(false);
  const lastCanvasSizeRef = useRef(CANVAS_SIZE);
  
  useEffect(() => {
    const randomTime = getRandomTargetTime();
    setTargetTime(randomTime);

    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newSize = Math.max(300, Math.min(500, containerWidth - 40));
        
        if (newSize !== lastCanvasSizeRef.current) {
          lastCanvasSizeRef.current = newSize;
          setCanvasSize(newSize);
        }
      }
      
      if (!isReadyRef.current) {
        isReadyRef.current = true;
        setIsReady(true);
      }
    };

    const initTimer = setTimeout(updateCanvasSize, 50);
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(initTimer);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  
  useEffect(() => {
    if (hasStarted && !showResult) {
      intervalRef.current = setInterval(() => {
        setTotalTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasStarted, showResult]);

  const handleMouseDown = (e) => {
    if (!hasStarted) {
      setHasStarted(true);
      setGameStartTime(Date.now());
    }
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], mode }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    
    if (lastLine) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      setLines([...lines.slice(0, -1), lastLine]);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e) => {
    e.evt.preventDefault();
    if (!hasStarted) {
      setHasStarted(true);
      setGameStartTime(Date.now());
    }
    setIsDrawing(true);
    const touch = e.evt.touches[0];
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], mode }]);
  };

  const handleTouchMove = (e) => {
    e.evt.preventDefault();
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    
    if (lastLine) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      setLines([...lines.slice(0, -1), lastLine]);
    }
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setLines([]);
  };

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onExit?.();
  }, [onExit]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExit();
      } else if (e.key === "Backspace" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setLines(prev => {
          if (prev.length > 0) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExit]);

  
  const analyzeClockDrawing = useCallback(() => {
    return analyzeClockDrawingAlgo(lines, targetTime);
  }, [lines, targetTime]);

  const submitDrawing = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const analysis = analyzeClockDrawing();
    setAnalysisResult(analysis);
    setScore(analysis.score);
    setShowResult(true);
  };

  const handleNext = (retry = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowResult(false);
    if (retry) {
      setLines([]);
      setHasStarted(false);
      setTotalTime(0);
      setScore(0);
      setGameStartTime(0);
      const randomTime = getRandomTargetTime();
      setTargetTime(randomTime);
    } else {
      const finalAnalysis = analysisResult || analyzeClockDrawing();
      const result = prepareClockDrawingResult(finalAnalysis, targetTime, totalTime);
      onFinish?.(result);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ position: 'relative' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0 fw-bold">{t("dementia.games.clockDrawing", "Clock Drawing Test")}</h2>
              <button className="btn btn-light btn-sm" onClick={handleExit}>
                {t("dementia.exit", "Exit")}
              </button>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.timer", "Time")}</div>
                      <div className="h5 mb-0 fw-bold text-primary">
                        {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.instruction", "Instruction")}</div>
                      <div className="small fw-bold">
                        {t("dementia.clockDrawing.instruction", "Draw a clock showing")} {formatTime(targetTime)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <div className="small text-muted mb-1">{t("dementia.mode", "Mode")}</div>
                      <div className="h6 mb-0 fw-bold">{mode === "draw" ? t("dementia.clockDrawing.draw", "Draw") : t("dementia.clockDrawing.erase", "Erase")}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info text-center mb-4">
                <p className="mb-0 fw-bold">
                  {t("dementia.clockDrawing.description", "Draw a clock face with all numbers (1-12) and set the time to")} {formatTime(targetTime)}
                </p>
              </div>

              <div 
                ref={containerRef}
                className="d-flex justify-content-center align-items-center mb-4"
                style={{ 
                  width: '100%', 
                  maxWidth: '500px', 
                  margin: '0 auto',
                  minHeight: '500px',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}
              >
                  {!isReady ? (
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted">{t("dementia.loading", "Loading canvas...")}</p>
                    </div>
                  ) : (
                    <div style={{ 
                      border: '2px solid #e0e0e0', 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      width: `${canvasSize}px`,
                      height: `${canvasSize}px`,
                      position: 'relative'
                    }}>
                      <Stage
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        ref={stageRef}
                        style={{ 
                          display: 'block',
                          width: `${canvasSize}px`,
                          height: `${canvasSize}px`,
                          backgroundColor: '#ffffff',
                          cursor: mode === "draw" ? "crosshair" : "pointer"
                        }}
                      >
                        <Layer>
                          
                          {lines.map((line, i) => (
                            <Line
                              key={i}
                              points={line.points}
                              stroke={line.mode === "erase" ? "#ffffff" : "#000000"}
                              strokeWidth={line.mode === "erase" ? 20 : 3}
                              tension={0.5}
                              lineCap="round"
                              lineJoin="round"
                              globalCompositeOperation={line.mode === "erase" ? "destination-out" : "source-over"}
                            />
                          ))}
                        </Layer>
                      </Stage>
                    </div>
                  )}
              </div>

              <div className="d-flex flex-wrap gap-3 justify-content-center align-items-center mb-4">
                <button
                  className={`btn ${mode === "draw" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setMode("draw")}
                >
                  {t("dementia.clockDrawing.draw", "Draw")}
                </button>
                <button
                  className={`btn ${mode === "erase" ? "btn-warning" : "btn-outline-warning"}`}
                  onClick={() => setMode("erase")}
                >
                  {t("dementia.clockDrawing.erase", "Erase")}
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={clearCanvas}
                >
                  {t("dementia.clockDrawing.clear", "Clear All")}
                </button>
                <button
                  className="btn btn-success btn-lg"
                  onClick={submitDrawing}
                  disabled={lines.length === 0}
                >
                  {t("dementia.submitAnswer", "Submit")}
                </button>
              </div>

              <div className="alert alert-secondary">
                <p className="mb-0 small">
                  <strong>{t("dementia.clockDrawing.tips", "Tips:")}</strong>{" "}
                  {t("dementia.clockDrawing.tipsText", "Draw a circle for the clock face, add numbers 1-12 around it, and draw two hands pointing to the correct time.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResult && analysisResult && (
        <ResultPopup
          score={score}
          time={totalTime}
          detail={{
            hasCircle: analysisResult.details.hasCircle,
            hasNumbers: analysisResult.details.hasNumbers,
            hasHands: analysisResult.details.hasHands,
            handPlacement: analysisResult.details.handPlacement,
            numberCount: analysisResult.details.numberCount,
            targetTime: formatTime(targetTime),
          }}
          onNext={handleNext}
          onRetry={() => handleNext(true)}
        />
      )}
    </div>
  );
}

