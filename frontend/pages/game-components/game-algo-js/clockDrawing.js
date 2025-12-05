import { normalizeScoreByAge } from './ageNormalization';

export const CANVAS_SIZE = 500;
export const CLOCK_RADIUS = 200;
export const CLOCK_CENTER = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

export const TARGET_TIMES = [
  { hour: 11, minute: 10 },
  { hour: 3, minute: 0 },
  { hour: 2, minute: 45 },
];

export const getRandomTargetTime = () => {
  return TARGET_TIMES[Math.floor(Math.random() * TARGET_TIMES.length)];
};

export const formatTime = (time) => {
  return `${time.hour}:${time.minute.toString().padStart(2, "0")}`;
};

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

const hasContentAt = (data, x, y) => {
  const idx = (Math.floor(y) * CANVAS_SIZE + Math.floor(x)) * 4;
  if (idx >= 0 && idx < data.length) {
    return data[idx + 3] > 0;
  }
  return false;
};

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

const analyzeHands = (data, targetTime) => {
  const centerX = CLOCK_CENTER.x;
  const centerY = CLOCK_CENTER.y;
  const centerRadius = 20;
  
  const hourAngle = ((targetTime.hour % 12) * 30 + targetTime.minute * 0.5 - 90) * (Math.PI / 180);
  const minuteAngle = (targetTime.minute * 6 - 90) * (Math.PI / 180);
  
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

const calculateScore = (circleAnalysis, numberAnalysis, handAnalysis) => {
  let score = 0;
  
  if (circleAnalysis.hasCircle) score += 25;
  if (numberAnalysis.hasNumbers) score += 30;
  if (handAnalysis.hasHands) score += 25;
  if (handAnalysis.handPlacement) score += 20;
  
  if (numberAnalysis.numberCount >= 12) score += 5;
  else if (numberAnalysis.numberCount >= 10) score += 3;
  
  return Math.min(100, score);
};

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

export const prepareClockDrawingResult = (analysisResult, targetTime, totalTime, ageGroup = "20-30") => {
  const ageAdjustedScore = ageGroup && ageGroup !== "20-30"
    ? normalizeScoreByAge(analysisResult.score, "clock_drawing", ageGroup, "easy")
    : analysisResult.score;
  
  return {
    key: "clock_drawing",
    score: Math.round(ageAdjustedScore),
    time: totalTime,
    detail: {
      ...analysisResult.details,
      targetTime: formatTime(targetTime),
      totalTime,
      ageGroup: ageGroup,
    },
  };
};

