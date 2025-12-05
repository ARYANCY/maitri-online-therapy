import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Stage, Layer, Line } from "react-konva";
import ResultPopup from "./ResultPopup";
import "../../css/game/ClockDrawing.css";
import "../../css/game/GameComponentLayout.css";

const CANVAS_SIZE = 500;
const CLOCK_RADIUS = 200;
const CLOCK_CENTER = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

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

  
  // Track if component is mounted and ready status to prevent infinite loops
  const isReadyRef = useRef(false);
  const lastCanvasSizeRef = useRef(CANVAS_SIZE);
  
  useEffect(() => {
    // Set random target time once on mount
    const times = [
      { hour: 11, minute: 10 },
      { hour: 3, minute: 0 },
      { hour: 2, minute: 45 },
    ];
    const randomTime = times[Math.floor(Math.random() * times.length)];
    setTargetTime(randomTime);

    // Update canvas size only if it actually changed
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newSize = Math.max(300, Math.min(500, containerWidth - 40));
        
        // Only update state if size actually changed
        if (newSize !== lastCanvasSizeRef.current) {
          lastCanvasSizeRef.current = newSize;
          setCanvasSize(newSize);
        }
      }
      
      // Only set ready once
      if (!isReadyRef.current) {
        isReadyRef.current = true;
        setIsReady(true);
      }
    };

    // Initial setup with small delay
    const initTimer = setTimeout(updateCanvasSize, 50);
    
    // Debounce resize events
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
    if (lines.length === 0) {
      return {
        score: 0,
        details: {
          hasCircle: false,
          hasNumbers: false,
          hasHands: false,
          handPlacement: false,
          numberPlacement: false,
          overallQuality: 0,
        },
      };
    }

    
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");
    
    
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    lines.forEach((line) => {
      if (line.points.length < 4) return;
      ctx.beginPath();
      ctx.moveTo(line.points[0], line.points[1]);
      for (let i = 2; i < line.points.length; i += 2) {
        ctx.lineTo(line.points[i], line.points[i + 1]);
      }
      if (line.mode === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 20;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = 3;
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    });

    
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const data = imageData.data;

    
    const centerX = CLOCK_CENTER.x;
    const centerY = CLOCK_CENTER.y;
    let hasCircle = false;
    let circleQuality = 0;
    
    
    for (let angle = 0; angle < 360; angle += 10) {
      const rad = (angle * Math.PI) / 180;
      const x = centerX + CLOCK_RADIUS * Math.cos(rad);
      const y = centerY + CLOCK_RADIUS * Math.sin(rad);
      const idx = (Math.floor(y) * CANVAS_SIZE + Math.floor(x)) * 4;
      if (idx >= 0 && idx < data.length) {
        const alpha = data[idx + 3];
        if (alpha > 0) {
          circleQuality++;
        }
      }
    }
    hasCircle = circleQuality > 20; 

    
    
    let hasNumbers = false;
    let numberCount = 0;
    
    
    for (let hour = 1; hour <= 12; hour++) {
      const angle = ((hour % 12) * 30 - 90) * (Math.PI / 180);
      const radius = CLOCK_RADIUS * 0.85;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      
      let hasMark = false;
      for (let dx = -15; dx <= 15; dx++) {
        for (let dy = -15; dy <= 15; dy++) {
          const checkX = Math.floor(x + dx);
          const checkY = Math.floor(y + dy);
          if (checkX >= 0 && checkX < CANVAS_SIZE && checkY >= 0 && checkY < CANVAS_SIZE) {
            const idx = (checkY * CANVAS_SIZE + checkX) * 4;
            if (idx >= 0 && idx < data.length) {
              const alpha = data[idx + 3];
              if (alpha > 50) {
                hasMark = true;
                break;
              }
            }
          }
        }
        if (hasMark) break;
      }
      if (hasMark) numberCount++;
    }
    hasNumbers = numberCount >= 8; 

    
    let hasHands = false;
    let handPlacement = false;
    
    
    const centerRadius = 20;
    let linesFromCenter = 0;
    
    
    const hourAngle = ((targetTime.hour % 12) * 30 + targetTime.minute * 0.5 - 90) * (Math.PI / 180);
    const minuteAngle = (targetTime.minute * 6 - 90) * (Math.PI / 180);
    
    
    let hourHandPresent = false;
    for (let r = centerRadius; r < CLOCK_RADIUS * 0.6; r += 10) {
      const x = centerX + r * Math.cos(hourAngle);
      const y = centerY + r * Math.sin(hourAngle);
      const idx = (Math.floor(y) * CANVAS_SIZE + Math.floor(x)) * 4;
      if (idx >= 0 && idx < data.length) {
        const alpha = data[idx + 3];
        if (alpha > 50) {
          hourHandPresent = true;
          break;
        }
      }
    }
    
    
    let minuteHandPresent = false;
    for (let r = centerRadius; r < CLOCK_RADIUS * 0.8; r += 10) {
      const x = centerX + r * Math.cos(minuteAngle);
      const y = centerY + r * Math.sin(minuteAngle);
      const idx = (Math.floor(y) * CANVAS_SIZE + Math.floor(x)) * 4;
      if (idx >= 0 && idx < data.length) {
        const alpha = data[idx + 3];
        if (alpha > 50) {
          minuteHandPresent = true;
          break;
        }
      }
    }
    
    hasHands = hourHandPresent || minuteHandPresent;
    handPlacement = hourHandPresent && minuteHandPresent;

    
    let qualityScore = 0;
    if (hasCircle) qualityScore += 25;
    if (hasNumbers) qualityScore += 30;
    if (hasHands) qualityScore += 25;
    if (handPlacement) qualityScore += 20;
    
    
    if (numberCount >= 12) qualityScore += 5;
    else if (numberCount >= 10) qualityScore += 3;

    return {
      score: Math.min(100, qualityScore),
      details: {
        hasCircle,
        hasNumbers,
        hasHands,
        handPlacement,
        numberPlacement: numberCount >= 10,
        numberCount,
        overallQuality: qualityScore,
      },
    };
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
      const times = [
        { hour: 11, minute: 10 },
        { hour: 3, minute: 0 },
        { hour: 2, minute: 45 },
      ];
      const randomTime = times[Math.floor(Math.random() * times.length)];
      setTargetTime(randomTime);
    } else {
      const finalAnalysis = analysisResult || analyzeClockDrawing();
      onFinish?.({
        key: "clock_drawing",
        score: finalAnalysis.score,
        time: totalTime,
        detail: {
          ...finalAnalysis.details,
          targetTime: `${targetTime.hour}:${targetTime.minute.toString().padStart(2, "0")}`,
          totalTime,
        },
      });
    }
  };

  return (
    <div className="clock-drawing-container game-component-wrapper" style={{ position: 'relative' }}>
      <div className="game-component-container">
        <div className="game-component-card">
          <div className="game-component-header">
            <h2>{t("dementia.games.clockDrawing", "Clock Drawing Test")}</h2>
            <button className="btn btn-light btn-sm" onClick={handleExit}>
              {t("dementia.exit", "Exit")}
            </button>
          </div>
          <div className="game-component-body">
            <div className="game-stats-row">
              <div className="game-stat-box">
                <div className="game-stat-label">{t("dementia.timer", "Time")}</div>
                <div className="game-stat-value" style={{ color: "#667eea" }}>
                  {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, "0")}
                </div>
              </div>
              <div className="game-stat-box">
                <div className="game-stat-label">{t("dementia.instruction", "Instruction")}</div>
                <div className="game-stat-value" style={{ fontSize: "1rem" }}>
                  {t("dementia.clockDrawing.instruction", "Draw a clock showing")} {targetTime.hour}:{targetTime.minute.toString().padStart(2, "0")}
                </div>
              </div>
              <div className="game-stat-box">
                <div className="game-stat-label">{t("dementia.mode", "Mode")}</div>
                <div className="game-stat-value">{mode === "draw" ? t("dementia.clockDrawing.draw", "Draw") : t("dementia.clockDrawing.erase", "Erase")}</div>
              </div>
            </div>

                <div className="alert alert-info text-center mb-4">
                  <p className="mb-0 fw-bold">
                    {t("dementia.clockDrawing.description", "Draw a clock face with all numbers (1-12) and set the time to")} {targetTime.hour}:{targetTime.minute.toString().padStart(2, "0")}
                  </p>
                </div>

                <div 
                  ref={containerRef}
                  className="clock-canvas-wrapper" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    width: '100%', 
                    maxWidth: '500px', 
                    margin: '1.5rem auto',
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

                <div className="clock-controls mt-4">
                  <div className="d-flex flex-wrap gap-3 justify-content-center align-items-center">
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
                </div>

                <div className="alert alert-secondary mt-4">
                  <p className="mb-0 small">
                    <strong>{t("dementia.clockDrawing.tips", "Tips:")}</strong>{" "}
                    {t("dementia.clockDrawing.tipsText", "Draw a circle for the clock face, add numbers 1-12 around it, and draw two hands pointing to the correct time.")}
                  </p>
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
              targetTime: `${targetTime.hour}:${targetTime.minute.toString().padStart(2, "0")}`,
            }}
            onNext={handleNext}
            onRetry={() => handleNext(true)}
          />
        )}
      </div>
    </div>
  );
}

