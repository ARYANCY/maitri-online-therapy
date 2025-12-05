/**
 * Clock Drawing Test Algorithm
 * Analyzes user's clock drawing for cognitive assessment
 */

export const CANVAS_SIZE = 500;
export const CLOCK_RADIUS = 200;
export const CLOCK_CENTER = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

/**
 * Available target times for the clock drawing test
 */
export const TARGET_TIMES = [
  { hour: 11, minute: 10 },
  { hour: 3, minute: 0 },
  { hour: 2, minute: 45 },
];

/**
 * Get a random target time
 * @returns {Object} - Random target time {hour, minute}
 */
export const getRandomTargetTime = () => {
  return TARGET_TIMES[Math.floor(Math.random() * TARGET_TIMES.length)];
};

/**
 * Format time for display
 * @param {Object} time - Time object {hour, minute}
 * @returns {string} - Formatted time string
 */
export const formatTime = (time) => {
  return `${time.hour}:${time.minute.toString().padStart(2, "0")}`;
};

/**
 * Render lines to canvas and get image data
 * @param {Array} lines - Array of line objects
 * @returns {ImageData} - Canvas image data
 */
export const renderLinesToCanvas = (lines) => {
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

  return ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

/**
 * Check if there is content at given position
 * @param {Uint8ClampedArray} data - Image data array
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} - True if there is content
 */
const hasContentAt = (data, x, y) => {
  const idx = (Math.floor(y) * CANVAS_SIZE + Math.floor(x)) * 4;
  if (idx >= 0 && idx < data.length) {
    return data[idx + 3] > 0;
  }
  return false;
};

/**
 * Check if there is content in an area
 * @param {Uint8ClampedArray} data - Image data array
 * @param {number} centerX - Center X
 * @param {number} centerY - Center Y
 * @param {number} radius - Search radius
 * @param {number} threshold - Alpha threshold
 * @returns {boolean} - True if content found
 */
const hasContentInArea = (data, centerX, centerY, radius, threshold = 50) => {
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const checkX = Math.floor(centerX + dx);
      const checkY = Math.floor(centerY + dy);
      if (checkX >= 0 && checkX < CANVAS_SIZE && checkY >= 0 && checkY < CANVAS_SIZE) {
        const idx = (checkY * CANVAS_SIZE + checkX) * 4;
        if (idx >= 0 && idx < data.length && data[idx + 3] > threshold) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * Analyze circle quality
 * @param {Uint8ClampedArray} data - Image data array
 * @returns {Object} - Circle analysis results
 */
const analyzeCircle = (data) => {
  const centerX = CLOCK_CENTER.x;
  const centerY = CLOCK_CENTER.y;
  let circleQuality = 0;
  
  for (let angle = 0; angle < 360; angle += 10) {
    const rad = (angle * Math.PI) / 180;
    const x = centerX + CLOCK_RADIUS * Math.cos(rad);
    const y = centerY + CLOCK_RADIUS * Math.sin(rad);
    if (hasContentAt(data, x, y)) {
      circleQuality++;
    }
  }
  
  return {
    hasCircle: circleQuality > 20,
    quality: circleQuality
  };
};

/**
 * Analyze number placement
 * @param {Uint8ClampedArray} data - Image data array
 * @returns {Object} - Number analysis results
 */
const analyzeNumbers = (data) => {
  const centerX = CLOCK_CENTER.x;
  const centerY = CLOCK_CENTER.y;
  let numberCount = 0;
  
  for (let hour = 1; hour <= 12; hour++) {
    const angle = ((hour % 12) * 30 - 90) * (Math.PI / 180);
    const radius = CLOCK_RADIUS * 0.85;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (hasContentInArea(data, x, y, 15)) {
      numberCount++;
    }
  }
  
  return {
    hasNumbers: numberCount >= 8,
    numberCount,
    numberPlacement: numberCount >= 10
  };
};

/**
 * Analyze clock hands
 * @param {Uint8ClampedArray} data - Image data array
 * @param {Object} targetTime - Target time {hour, minute}
 * @returns {Object} - Hand analysis results
 */
const analyzeHands = (data, targetTime) => {
  const centerX = CLOCK_CENTER.x;
  const centerY = CLOCK_CENTER.y;
  const centerRadius = 20;
  
  const hourAngle = ((targetTime.hour % 12) * 30 + targetTime.minute * 0.5 - 90) * (Math.PI / 180);
  const minuteAngle = (targetTime.minute * 6 - 90) * (Math.PI / 180);
  
  // Check hour hand
  let hourHandPresent = false;
  for (let r = centerRadius; r < CLOCK_RADIUS * 0.6; r += 10) {
    const x = centerX + r * Math.cos(hourAngle);
    const y = centerY + r * Math.sin(hourAngle);
    const idx = (Math.floor(y) * CANVAS_SIZE + Math.floor(x)) * 4;
    if (idx >= 0 && idx < data.length && data[idx + 3] > 50) {
      hourHandPresent = true;
      break;
    }
  }
  
  // Check minute hand
  let minuteHandPresent = false;
  for (let r = centerRadius; r < CLOCK_RADIUS * 0.8; r += 10) {
    const x = centerX + r * Math.cos(minuteAngle);
    const y = centerY + r * Math.sin(minuteAngle);
    const idx = (Math.floor(y) * CANVAS_SIZE + Math.floor(x)) * 4;
    if (idx >= 0 && idx < data.length && data[idx + 3] > 50) {
      minuteHandPresent = true;
      break;
    }
  }
  
  return {
    hasHands: hourHandPresent || minuteHandPresent,
    handPlacement: hourHandPresent && minuteHandPresent,
    hourHandPresent,
    minuteHandPresent
  };
};

/**
 * Calculate final score based on analysis
 * @param {Object} circleAnalysis - Circle analysis results
 * @param {Object} numberAnalysis - Number analysis results
 * @param {Object} handAnalysis - Hand analysis results
 * @returns {number} - Final score (0-100)
 */
const calculateScore = (circleAnalysis, numberAnalysis, handAnalysis) => {
  let score = 0;
  
  if (circleAnalysis.hasCircle) score += 25;
  if (numberAnalysis.hasNumbers) score += 30;
  if (handAnalysis.hasHands) score += 25;
  if (handAnalysis.handPlacement) score += 20;
  
  // Bonus for good number placement
  if (numberAnalysis.numberCount >= 12) score += 5;
  else if (numberAnalysis.numberCount >= 10) score += 3;
  
  return Math.min(100, score);
};

/**
 * Main analysis function for clock drawing
 * @param {Array} lines - Array of drawn lines
 * @param {Object} targetTime - Target time {hour, minute}
 * @returns {Object} - Analysis result with score and details
 */
export const analyzeClockDrawing = (lines, targetTime) => {
  if (!lines || lines.length === 0) {
    return {
      score: 0,
      details: {
        hasCircle: false,
        hasNumbers: false,
        hasHands: false,
        handPlacement: false,
        numberPlacement: false,
        numberCount: 0,
        overallQuality: 0,
      },
    };
  }

  const imageData = renderLinesToCanvas(lines);
  const data = imageData.data;

  const circleAnalysis = analyzeCircle(data);
  const numberAnalysis = analyzeNumbers(data);
  const handAnalysis = analyzeHands(data, targetTime);
  
  const score = calculateScore(circleAnalysis, numberAnalysis, handAnalysis);

  return {
    score,
    details: {
      hasCircle: circleAnalysis.hasCircle,
      hasNumbers: numberAnalysis.hasNumbers,
      hasHands: handAnalysis.hasHands,
      handPlacement: handAnalysis.handPlacement,
      numberPlacement: numberAnalysis.numberPlacement,
      numberCount: numberAnalysis.numberCount,
      overallQuality: score,
    },
  };
};

/**
 * Prepare result data for submission
 * @param {Object} analysisResult - Analysis result
 * @param {Object} targetTime - Target time
 * @param {number} totalTime - Total time spent
 * @returns {Object} - Formatted result for onFinish
 */
export const prepareClockDrawingResult = (analysisResult, targetTime, totalTime) => {
  return {
    key: "clock_drawing",
    score: analysisResult.score,
    time: totalTime,
    detail: {
      ...analysisResult.details,
      targetTime: formatTime(targetTime),
      totalTime,
    },
  };
};

