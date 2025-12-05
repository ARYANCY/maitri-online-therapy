# Reaction Time Test - Scoring Algorithm

## Overview

The Reaction Time Test measures simple reaction time (SRT), a fundamental cognitive ability reflecting processing speed. Users must click/tap as quickly as possible when a visual stimulus changes from waiting (orange) to ready (green).

## Cognitive Domains Assessed

- **Processing Speed:** Neural transmission and response initiation
- **Attention:** Vigilance and readiness to respond
- **Motor Response:** Hand-eye coordination
- **Alertness:** Arousal level and readiness state

## The Reaction Time Concept

```
Timeline:
[Orange - "Wait for GREEN"] → Random Delay → [Green - "CLICK NOW!"] → User Click

Reaction Time = Click Timestamp - Green Appearance Timestamp

Typical ranges:
- Young adults: 150-250ms
- Middle-aged: 200-300ms
- Older adults: 250-400ms
```

## Difficulty Settings

| Level | Rounds | Min Delay | Max Delay | Unpredictability |
|-------|--------|-----------|-----------|------------------|
| Easy | 5 | 2000ms | 4000ms | Low |
| Medium | 7 | 1000ms | 3000ms | Medium |
| Hard | 10 | 500ms | 2000ms | High |

## Delay Calculation

```javascript
const startRound = () => {
  const { minDelay, maxDelay } = DIFFICULTY[difficulty];
  
  // Random delay between min and max
  const delay = Math.random() * (maxDelay - minDelay) + minDelay;
  
  timeoutRef.current = setTimeout(() => {
    setIsGreen(true);
    startTimeRef.current = Date.now();  // Record exact time
  }, delay);
};
```

### Delay Distribution Examples

**Easy (2000-4000ms):**
```
Possible delays: 2000, 2500, 3000, 3500, 4000ms
Average wait: ~3000ms
User has more time to prepare
```

**Hard (500-2000ms):**
```
Possible delays: 500, 750, 1000, 1250, 1500, 1750, 2000ms
Average wait: ~1250ms
Requires sustained attention
```

## Scoring Formula

### Per-Round Calculation

```javascript
const handleClick = () => {
  if (!isGreen) {
    // Clicked too early - penalty
    setTooEarly(true);
    return;
  }
  
  // Calculate reaction time
  const reactionTime = Date.now() - startTimeRef.current;
  
  // Score formula: faster = more points
  const roundScore = Math.max(0, 1000 - reactionTime);
  
  setScore(prev => prev + roundScore);
  setReactionTimes(prev => [...prev, reactionTime]);
};
```

### Scoring Rules

```
Round Score = max(0, 1000 - Reaction Time in ms)

Examples:
- 150ms reaction → 1000 - 150 = 850 points
- 300ms reaction → 1000 - 300 = 700 points
- 500ms reaction → 1000 - 500 = 500 points
- 800ms reaction → 1000 - 800 = 200 points
- 1000ms+ reaction → 0 points (capped)
```

### Score Distribution

| Reaction Time | Points | Category |
|---------------|--------|----------|
| <200ms | 800+ | Excellent |
| 200-300ms | 700-800 | Good |
| 300-500ms | 500-700 | Average |
| 500-800ms | 200-500 | Slow |
| >1000ms | 0 | Very Slow |

## Early Click Handling

```javascript
if (!isGreen) {
  if (difficulty) {
    setTooEarly(true);
    setTimeout(() => setTooEarly(false), 1500);
  }
  return;  // No score, round doesn't reset
}
```

### Early Click States

| State | Color | Message | Action |
|-------|-------|---------|--------|
| Waiting | Orange (#f0ad4e) | "Wait for GREEN" | Click = Too Early |
| Too Early | Red (#dc2626) | "TOO EARLY!" | 1.5s penalty display |
| Ready | Green (#16a34a) | "CLICK NOW!" | Valid click recorded |

## Total Score Calculation

```javascript
totalScore = sum(roundScores);

// Maximum possible (all 150ms reactions):
// Easy:   5 × 850 = 4,250 points
// Medium: 7 × 850 = 5,950 points
// Hard:   10 × 850 = 8,500 points

// Realistic good performance (250ms average):
// Easy:   5 × 750 = 3,750 points
// Medium: 7 × 750 = 5,250 points
// Hard:   10 × 750 = 7,500 points
```

## Result Object Structure

```javascript
{
  key: "reaction_time",
  score: totalScore,
  time: totalTimeInSeconds,
  detail: {
    rounds: maxRounds,
    difficulty: "easy" | "medium" | "hard",
    time: totalTimeInSeconds,
    averageScore: Math.round(score / maxRounds),
    averageReactionTime: Math.round(sum(reactionTimes) / count),
    bestReactionTime: Math.min(...reactionTimes),
    reactionTimes: [...]  // All individual times
  }
}
```

## Key Metrics

### Average Reaction Time

```javascript
const avgReactionTime = reactionTimes.length > 0
  ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
  : 0;
```

### Best Reaction Time

```javascript
const bestReactionTime = reactionTimes.length > 0 
  ? Math.min(...reactionTimes) 
  : 0;
```

## Input Methods

```javascript
// Mouse click
<div onClick={handleClick}>...</div>

// Keyboard (Space bar)
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.code === "Space" && difficulty && !showResult) {
      e.preventDefault();
      handleClick();
    }
  };
  window.addEventListener("keydown", handleKeyPress);
  return () => window.removeEventListener("keydown", handleKeyPress);
}, [difficulty, showResult, handleClick]);
```

## Visual Feedback

### Color States

```javascript
const getBoxStyle = () => {
  if (tooEarly) {
    return {
      backgroundColor: "#dc2626",  // Red
      borderColor: "#b91c1c"
    };
  }
  if (isGreen) {
    return {
      backgroundColor: "#16a34a",  // Green
      borderColor: "#15803d"
    };
  }
  return {
    backgroundColor: "#f0ad4e",    // Orange/Yellow
    borderColor: "#e09d3d"
  };
};
```

## Performance Interpretation

### Reaction Time Ranges

| Age Group | Excellent | Good | Average | Slow |
|-----------|-----------|------|---------|------|
| 18-25 | <200ms | 200-250ms | 250-300ms | >300ms |
| 26-35 | <220ms | 220-280ms | 280-350ms | >350ms |
| 36-50 | <250ms | 250-320ms | 320-400ms | >400ms |
| 51-65 | <280ms | 280-370ms | 370-450ms | >450ms |
| 65+ | <320ms | 320-420ms | 420-520ms | >520ms |

### Score Interpretation

| Total Score (10 rounds) | Interpretation |
|------------------------|----------------|
| 7500+ | Elite reaction speed |
| 6000-7500 | Excellent |
| 4500-6000 | Good |
| 3000-4500 | Average |
| <3000 | Below average |

## Clinical Background

Simple Reaction Time (SRT) is one of the most basic cognitive measures:

- **Neural pathway:** Visual cortex → Motor cortex → Hand muscles
- **Irreducible minimum:** ~150ms (nerve conduction + processing)
- **Cognitive component:** ~100-200ms (decision and execution)

### Factors Affecting Reaction Time

1. **Age:** Slows ~15-20% from 20s to 60s
2. **Sleep deprivation:** Significant slowing
3. **Caffeine:** May improve by 10-20ms
4. **Practice:** Small improvements possible
5. **Motivation:** Alert state improves times

### Clinical Applications

- Concussion assessment (baseline comparison)
- Fatigue monitoring
- Medication effects evaluation
- Neurological screening
- Sports performance assessment

## Technical Notes

- Click target: 300×300 pixel box
- High-precision timing using `Date.now()`
- Timeout cleared on unmount to prevent memory leaks
- Space bar as alternative input for accessibility
- 1 second delay between rounds
- ESC key exits game

