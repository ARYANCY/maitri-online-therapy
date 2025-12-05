# Stroop Test - Scoring Algorithm

## Overview

The Stroop Test measures cognitive flexibility and inhibitory control by presenting color words printed in incongruent ink colors. Users must identify the INK COLOR, not the word itself.

## Cognitive Domains Assessed

- **Executive Function:** Managing conflicting information
- **Inhibitory Control:** Suppressing automatic reading response
- **Attention:** Selective attention to relevant stimulus
- **Processing Speed:** Quick decision making

## The Stroop Effect

```
Word: "RED"     ← Automatic reading response
Color: BLUE     ← Correct response (ink color)

The brain must inhibit the automatic word-reading response
to correctly identify the ink color.
```

## Difficulty Settings

| Level | Colors | Rounds | Max Possible Score |
|-------|--------|--------|-------------------|
| Easy | 3 (R, G, B) | 5 | 50 points |
| Medium | 4 (R, G, B, Y) | 7 | 70 points |
| Hard | 5 (R, G, B, Y, P) | 10 | 100 points |

### Color Definitions

```javascript
const colorMap = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#eab308",
  purple: "#9333ea"
};
```

## Stimulus Generation

```javascript
const generateStimulus = () => {
  const colors = DIFFICULTY[difficulty].colors;
  
  // Word is randomly selected from available colors
  const word = colors[Math.floor(Math.random() * colors.length)];
  
  // Ink color is independently randomly selected
  const inkColor = colors[Math.floor(Math.random() * colors.length)];
  
  return { word, inkColor };
};

// Congruent example: word="RED", inkColor="red" (easier)
// Incongruent example: word="RED", inkColor="blue" (harder)
```

## Scoring Formula

### Per-Round Calculation

```javascript
const calculateRoundScore = (selectedColor, correctColor, responseTime) => {
  // Base score for correct answer
  const baseScore = (selectedColor === correctColor) ? 10 : 0;
  
  // Time penalty (capped at 10 seconds)
  const timePenalty = Math.min(responseTime, 10);
  
  // Final score cannot be negative
  return Math.max(0, baseScore - timePenalty);
};
```

### Scoring Rules

1. **Correct answer:** Start with 10 points
2. **Time penalty:** Subtract 1 point per second (max 10)
3. **Wrong answer:** 0 points regardless of time
4. **Floor:** Score cannot go below 0

### Score Examples

| Response | Time | Correct? | Calculation | Score |
|----------|------|----------|-------------|-------|
| Blue | 2s | ✓ | 10 - 2 | 8 |
| Blue | 5s | ✓ | 10 - 5 | 5 |
| Blue | 12s | ✓ | 10 - 10 | 0 |
| Red | 1s | ✗ | 0 - 0 | 0 |
| Blue | 0.5s | ✓ | 10 - 0 | 10 |

## Total Score Calculation

```javascript
totalScore = sum(roundScores);

// Perfect game (Hard): 10 rounds × 10 points = 100 points
// Requires instant correct responses for maximum score
```

## Timer Implementation

```javascript
// Timer starts when stimulus appears
intervalRef.current = setInterval(() => {
  setTimer(t => t + 1);
}, 1000);

// Timer stops when user clicks answer
clearInterval(intervalRef.current);
```

## Result Object Structure

```javascript
{
  key: "stroop_test",
  score: totalScore,
  time: totalTimeInSeconds,
  detail: {
    rounds: maxRounds,
    difficulty: "easy" | "medium" | "hard",
    time: totalTimeInSeconds,
    averageScore: Math.round(totalScore / maxRounds)
  }
}
```

## Answer Presentation

Colors are presented as clickable buttons in a shuffled order:

```javascript
const shuffledColors = shuffle([...DIFFICULTY[difficulty].colors]);

// Prevents users from learning button positions
// Each round has different button arrangement
```

## Performance Interpretation

### Average Score per Round

| Score | Speed Category | Interpretation |
|-------|----------------|---------------|
| 9-10 | Very Fast | Excellent inhibitory control |
| 7-8 | Fast | Good cognitive flexibility |
| 5-6 | Moderate | Average performance |
| 3-4 | Slow | Below average |
| 0-2 | Very Slow | Possible impairment |

### Total Score Ranges (Hard Mode - 10 rounds)

| Total Score | Interpretation |
|-------------|---------------|
| 80-100 | Superior executive function |
| 60-79 | Good executive function |
| 40-59 | Average |
| 20-39 | Below average |
| 0-19 | Significant difficulty |

## Clinical Background

The Stroop Test was developed by John Ridley Stroop in 1935. It demonstrates:

- **Stroop Interference:** The delay caused by conflicting stimuli
- **Automaticity:** Reading is automatic; color naming requires effort
- **Frontal Lobe Function:** Inhibition is primarily a frontal lobe function

### Clinical Applications

- ADHD assessment
- Dementia screening
- Frontal lobe damage evaluation
- Processing speed measurement

## Technical Notes

- Color buttons sized for easy touch interaction (120×80px minimum)
- Visual feedback on selection
- Instant round transition on answer
- Keyboard support: ESC to exit

