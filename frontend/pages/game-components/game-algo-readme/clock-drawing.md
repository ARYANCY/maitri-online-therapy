# Clock Drawing Test - Scoring Algorithm

## Overview

The Clock Drawing Test (CDT) is a well-established cognitive screening tool that assesses multiple cognitive domains including visuospatial abilities, executive function, and memory. The digital implementation uses pixel analysis to evaluate drawings.

## Cognitive Domains Assessed

- **Visuospatial Skills:** Drawing the clock face shape
- **Executive Function:** Planning and organization of elements
- **Memory:** Recalling clock face layout and time representation
- **Language:** Understanding the time instruction

## Scoring Components

### 1. Circle Detection (25 points)

**Method:** Radial sampling at 36 points around the expected clock perimeter

```javascript
const CLOCK_RADIUS = 200;
const CENTER = { x: 250, y: 250 };

for (angle = 0; angle < 360; angle += 10) {
  const rad = (angle * Math.PI) / 180;
  const x = CENTER.x + CLOCK_RADIUS * Math.cos(rad);
  const y = CENTER.y + CLOCK_RADIUS * Math.sin(rad);
  
  // Check pixel alpha at (x, y)
  if (alpha > 0) circleQuality++;
}

hasCircle = circleQuality > 20;  // >20 of 36 points
```

**Scoring:**
- Circle detected (>20 points): **+25 points**
- Circle not detected: **+0 points**

---

### 2. Number Detection (30 points)

**Method:** Area sampling around 12 expected number positions

```javascript
for (hour = 1; hour <= 12; hour++) {
  const angle = ((hour % 12) * 30 - 90) * (Math.PI / 180);
  const radius = CLOCK_RADIUS * 0.85;
  const x = CENTER.x + radius * Math.cos(angle);
  const y = CENTER.y + radius * Math.sin(angle);
  
  // Check 31×31 pixel area around expected position
  for (dx = -15; dx <= 15; dx++) {
    for (dy = -15; dy <= 15; dy++) {
      if (alpha > 50) hasMark = true;
    }
  }
  if (hasMark) numberCount++;
}

hasNumbers = numberCount >= 8;  // At least 8 of 12 positions
```

**Scoring:**
- ≥8 numbers detected: **+30 points**
- <8 numbers detected: **+0 points**

---

### 3. Clock Hands Detection (25 points)

**Method:** Ray tracing from center along expected hand angles

```javascript
// Calculate expected angles
const hourAngle = ((targetHour % 12) * 30 + targetMinute * 0.5 - 90) * (π/180);
const minuteAngle = (targetMinute * 6 - 90) * (π/180);

// Hour hand: check within 60% of radius
for (r = 20; r < CLOCK_RADIUS * 0.6; r += 10) {
  const x = CENTER.x + r * cos(hourAngle);
  const y = CENTER.y + r * sin(hourAngle);
  if (alpha > 50) hourHandPresent = true;
}

// Minute hand: check within 80% of radius
for (r = 20; r < CLOCK_RADIUS * 0.8; r += 10) {
  const x = CENTER.x + r * cos(minuteAngle);
  const y = CENTER.y + r * sin(minuteAngle);
  if (alpha > 50) minuteHandPresent = true;
}

hasHands = hourHandPresent || minuteHandPresent;
```

**Scoring:**
- At least one hand detected: **+25 points**
- No hands detected: **+0 points**

---

### 4. Hand Placement Accuracy (20 points)

**Criteria:** Both hour AND minute hands must be correctly positioned

```javascript
handPlacement = hourHandPresent && minuteHandPresent;
```

**Scoring:**
- Both hands correctly placed: **+20 points**
- One or no hand correct: **+0 points**

---

### 5. Bonus Points (0-5 points)

**Based on number count precision:**

```javascript
if (numberCount >= 12) bonus = 5;      // All 12 numbers
else if (numberCount >= 10) bonus = 3; // 10-11 numbers
else bonus = 0;
```

---

## Total Score Calculation

```javascript
let qualityScore = 0;

if (hasCircle) qualityScore += 25;
if (hasNumbers) qualityScore += 30;
if (hasHands) qualityScore += 25;
if (handPlacement) qualityScore += 20;

// Bonus for number precision
if (numberCount >= 12) qualityScore += 5;
else if (numberCount >= 10) qualityScore += 3;

finalScore = Math.min(100, qualityScore);
```

---

## Target Times

The test randomly selects from clinically validated times:

| Time | Hour Hand Angle | Minute Hand Angle | Clinical Significance |
|------|-----------------|-------------------|----------------------|
| 11:10 | 335° | 60° | Standard MMSE time |
| 3:00 | 90° | 0° | Simple reference |
| 2:45 | 82.5° | 270° | Tests hand differentiation |

---

## Result Object Structure

```javascript
{
  key: "clock_drawing",
  score: 0-100,
  time: totalSeconds,
  detail: {
    hasCircle: boolean,
    hasNumbers: boolean,
    hasHands: boolean,
    handPlacement: boolean,
    numberPlacement: boolean,
    numberCount: 0-12,
    overallQuality: 0-100,
    targetTime: "HH:MM"
  }
}
```

---

## Clinical Interpretation Guide

| Score Range | Interpretation |
|-------------|---------------|
| 90-100 | Normal cognitive function |
| 70-89 | Mild impairment possible |
| 50-69 | Moderate impairment likely |
| <50 | Significant impairment |

**Note:** This is a screening tool only. Clinical diagnosis requires professional evaluation.

---

## Technical Notes

- Canvas size: 500×500 pixels
- Clock radius: 200 pixels
- Clock center: (250, 250)
- Drawing modes: Draw (3px stroke) and Erase (20px stroke)
- Supports both mouse and touch input

