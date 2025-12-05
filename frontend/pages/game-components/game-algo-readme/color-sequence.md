# Color Sequence - Scoring Algorithm

## Overview

Color Sequence is a visual memory test where users must memorize a sequence of colors and then reproduce them in the exact same order by clicking color buttons. It tests short-term visual memory and sequential recall.

## Cognitive Domains Assessed

- **Visual Memory:** Encoding and storing color information
- **Sequential Processing:** Maintaining order of items
- **Short-term Memory:** Brief retention of visual data
- **Attention:** Focus during memorization phase

## Difficulty Settings

| Level | Sequence Length | Colors Available | Rounds |
|-------|-----------------|------------------|--------|
| Easy | 3 | 3 (R, G, B) | 5 |
| Medium | 4 | 4 (R, G, B, Y) | 7 |
| Hard | 5 | 5 (R, G, B, Y, P) | 10 |

## Color Definitions

```javascript
const DIFFICULTY = {
  easy: { 
    rounds: 5, 
    sequenceLength: 3, 
    colors: ["red", "green", "blue"] 
  },
  medium: { 
    rounds: 7, 
    sequenceLength: 4, 
    colors: ["red", "green", "blue", "yellow"] 
  },
  hard: { 
    rounds: 10, 
    sequenceLength: 5, 
    colors: ["red", "green", "blue", "yellow", "purple"] 
  }
};

const colorMap = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#eab308",
  purple: "#9333ea"
};
```

## Sequence Generation

```javascript
const generateSequence = () => {
  const colors = DIFFICULTY[difficulty].colors;
  const length = DIFFICULTY[difficulty].sequenceLength;
  
  // Random colors (can repeat)
  const seq = Array.from({ length }, () => 
    colors[Math.floor(Math.random() * colors.length)]
  );
  
  // Shuffle buttons to prevent positional memory
  setShuffledColors(shuffleArray([...colors]));
  
  return seq;
};

// Example sequences:
// Easy:   ["red", "blue", "green"]
// Medium: ["yellow", "red", "red", "blue"]
// Hard:   ["purple", "green", "blue", "yellow", "red"]
```

## Game Flow

```
1. SHOW PHASE
   ├── Display all colors in sequence simultaneously
   ├── Duration: 1000ms × sequence.length
   └── User memorizes the order

2. INPUT PHASE
   ├── Colors shown as clickable buttons (shuffled order)
   ├── User clicks colors in remembered sequence
   └── Progress shown with placeholder slots

3. SCORING
   ├── Each correct position = 10 points
   └── Partial credit allowed

4. NEXT ROUND
   └── New sequence generated
```

## Show Phase Duration

```javascript
useEffect(() => {
  if (phase === "show" && sequence.length > 0) {
    const timeout = setTimeout(() => {
      setPhase("input");
    }, 1000 * sequence.length);  // 1 second per color
    
    return () => clearTimeout(timeout);
  }
}, [phase, sequence.length]);

// Show durations:
// Easy (3 colors):  3000ms = 3 seconds
// Medium (4 colors): 4000ms = 4 seconds
// Hard (5 colors):   5000ms = 5 seconds
```

## Scoring Formula

### Per-Round Calculation

```javascript
useEffect(() => {
  if (phase === "input" && userSequence.length === sequence.length) {
    let score = 0;
    
    // Position-by-position comparison
    userSequence.forEach((color, idx) => {
      if (color === sequence[idx]) {
        score += 10;
      }
    });
    
    setTotalScore(prev => prev + score);
    
    // Proceed to next round or end game
    if (round < maxRounds) {
      setRound(prev => prev + 1);
      generateSequence();
    } else {
      setShowResult(true);
    }
  }
}, [userSequence, sequence]);
```

### Scoring Examples

| Sequence | User Input | Correct Positions | Score |
|----------|-----------|-------------------|-------|
| [R, G, B] | [R, G, B] | 3/3 | 30 |
| [R, G, B] | [R, B, G] | 1/3 | 10 |
| [R, G, B] | [B, G, R] | 1/3 | 10 |
| [R, G, B] | [G, R, B] | 1/3 | 10 |
| [Y, R, R, B] | [Y, R, R, B] | 4/4 | 40 |
| [Y, R, R, B] | [Y, R, B, R] | 2/4 | 20 |

### Maximum Scores

| Difficulty | Sequence | Points/Round | Rounds | Max Total |
|------------|----------|--------------|--------|-----------|
| Easy | 3 | 30 | 5 | 150 |
| Medium | 4 | 40 | 7 | 280 |
| Hard | 5 | 50 | 10 | 500 |

## Button Shuffling

```javascript
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

// Buttons shuffled each round to prevent:
// - Positional memory (always clicking same position)
// - Motor learning (muscle memory)

// Example:
// Original order: [red, green, blue, yellow]
// Shuffled:       [blue, yellow, red, green]
```

## Input Tracking

```javascript
const handleUserClick = (color) => {
  if (phase !== "input") return;
  if (userSequence.length >= sequence.length) return;
  
  setUserSequence(prev => [...prev, color]);
};

// Visual feedback: slots fill as user clicks
// [?] [?] [?] → [R] [?] [?] → [R] [G] [?] → [R] [G] [B]
```

## Result Object Structure

```javascript
{
  key: "color_sequence",
  score: totalScore,
  time: timerValue,
  detail: {
    rounds: maxRounds,
    difficulty: "easy" | "medium" | "hard",
    time: timerValue,
    averageScore: Math.round(totalScore / maxRounds)
  }
}
```

## Performance Metrics

### Average Score Calculation

```javascript
averageScore = Math.round(totalScore / maxRounds);

// Perfect game averages:
// Easy:   150/5 = 30 per round
// Medium: 280/7 = 40 per round
// Hard:   500/10 = 50 per round
```

### Accuracy Percentage

```javascript
accuracy = (totalScore / maxPossibleScore) * 100;

// Example: Medium difficulty
// Score: 200 out of 280 possible
// Accuracy: (200/280) × 100 = 71.4%
```

## Visual Design

### Show Phase

```javascript
// All sequence colors displayed simultaneously
<div className="sequence-display">
  {sequence.map((color, idx) => (
    <div 
      key={idx}
      style={{ backgroundColor: colorMap[color] }}
      className="color-block"
    />
  ))}
</div>
```

### Input Phase

```javascript
// Progress indicator
<div className="user-sequence">
  {Array.from({ length: sequence.length }).map((_, idx) => (
    <div 
      className={userSequence[idx] ? "filled" : "empty"}
      style={userSequence[idx] ? { backgroundColor: colorMap[userSequence[idx]] } : {}}
    >
      {userSequence[idx] ? "" : "?"}
    </div>
  ))}
</div>

// Clickable buttons (shuffled)
<div className="color-buttons">
  {shuffledColors.map(color => (
    <button 
      onClick={() => handleUserClick(color)}
      style={{ backgroundColor: colorMap[color] }}
      disabled={userSequence.length >= sequence.length}
    >
      {color.toUpperCase()}
    </button>
  ))}
</div>
```

## Performance Interpretation

### By Difficulty Level

| Difficulty | Excellent | Good | Average | Below Avg |
|------------|-----------|------|---------|-----------|
| Easy (150) | 130+ | 100-129 | 60-99 | <60 |
| Medium (280) | 240+ | 180-239 | 100-179 | <100 |
| Hard (500) | 400+ | 300-399 | 150-299 | <150 |

### Average Score per Round

| Score/Round | Interpretation |
|-------------|---------------|
| 90-100% | Excellent visual memory |
| 70-89% | Good visual memory |
| 50-69% | Average |
| 30-49% | Below average |
| <30% | Significant difficulty |

## Differences from Pattern Recall

| Aspect | Color Sequence | Pattern Recall |
|--------|----------------|----------------|
| Display | Simultaneous | Sequential |
| Scoring | Partial credit | All-or-nothing |
| Feedback | After complete | Per click |
| Timeout | None | Yes |

## Clinical Background

Color sequence memory tasks assess:

- **Visual short-term memory (VSTM):** Capacity for visual information
- **Serial order memory:** Remembering sequence order
- **Color discrimination:** Distinguishing between colors

### Typical Performance

| Age Group | Typical Sequence Span |
|-----------|----------------------|
| Children | 3-4 items |
| Adults | 4-6 items |
| Older adults | 3-5 items |

## Technical Notes

- Colors displayed simultaneously (unlike Pattern Recall)
- Partial credit scoring (more forgiving than Pattern Recall)
- No input timeout (user-paced)
- Timer counts continuously
- Buttons shuffled each round
- Button labels show color names
- Backspace removes last selection
- ESC key exits game

