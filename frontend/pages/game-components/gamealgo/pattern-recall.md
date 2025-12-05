# Pattern Recall - Scoring Algorithm

## Overview

Pattern Recall tests visual sequential memory by displaying a sequence of colored blocks that the user must reproduce in the correct order. Similar to the classic "Simon" game, it challenges both memory and attention.

## Cognitive Domains Assessed

- **Sequential Memory:** Remembering ordered information
- **Visual Memory:** Encoding color/position information
- **Attention:** Focus during presentation phase
- **Working Memory:** Maintaining sequence during input

## Difficulty Settings

| Level | Sequence Length | Colors | Rounds | Show Duration | Input Timeout |
|-------|-----------------|--------|--------|---------------|---------------|
| Easy | 3 colors | 4 | 4 | 800ms | 15s |
| Medium | 4 colors | 5 | 6 | 700ms | 12s |
| Hard | 5 colors | 6 | 8 | 600ms | 10s |

## Color Palette

```javascript
const colors = {
  easy: ["red", "green", "blue", "yellow"],
  medium: ["red", "green", "blue", "yellow", "purple"],
  hard: ["red", "green", "blue", "yellow", "purple", "orange"]
};

const colorMap = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#eab308",
  purple: "#9333ea",
  orange: "#ea580c"
};
```

## Sequence Generation

```javascript
const generateSequence = () => {
  const colors = DIFFICULTY[difficulty].colors;
  const length = DIFFICULTY[difficulty].sequenceLength;
  
  // Random selection with replacement (colors can repeat)
  const seq = Array.from({ length }, () => 
    colors[Math.floor(Math.random() * colors.length)]
  );
  
  return seq;
};

// Examples:
// Easy (3 colors):   ["red", "blue", "red"]
// Medium (4 colors): ["green", "yellow", "blue", "green"]
// Hard (5 colors):   ["purple", "red", "orange", "blue", "yellow"]
```

## Game Flow

```
1. SHOW PHASE
   └── Display colors one at a time
   └── Each color shown for showDuration (600-800ms)
   └── Gap between colors: showDuration/2
   └── Total show time: ~(sequenceLength × 1.5 × showDuration)

2. INPUT PHASE
   └── User clicks colors in remembered order
   └── Input timeout starts (10-15s depending on difficulty)
   └── Immediate feedback on each click

3. COMPLETE PHASE
   └── Display result (correct/incorrect)
   └── 1.5s delay before next round

4. REPEAT until all rounds complete
```

## Show Phase Animation

```javascript
useEffect(() => {
  if (phase === "show" && sequence.length > 0) {
    let currentIndex = 0;
    const showDuration = DIFFICULTY[difficulty].showDuration;
    
    const showSequence = () => {
      if (currentIndex < sequence.length) {
        // Highlight current color
        setActiveIndex(currentIndex);
        
        setTimeout(() => {
          // Remove highlight
          setActiveIndex(-1);
          currentIndex++;
          
          if (currentIndex < sequence.length) {
            // Show next color after gap
            setTimeout(showSequence, showDuration / 2);
          } else {
            // Transition to input phase
            setTimeout(() => {
              setPhase("input");
              startInputTimeout();
            }, 500);
          }
        }, showDuration);
      }
    };
    
    showSequence();
  }
}, [phase, sequence]);
```

## Scoring Formula

### Per-Round Calculation

```javascript
const handleRoundComplete = (isCorrect) => {
  if (isCorrect) {
    // Score based on sequence length
    const roundScore = sequence.length * 10;
    setTotalScore(prev => prev + roundScore);
  }
  // Incorrect = 0 points for the round
};
```

### Scoring Rules

| Difficulty | Sequence Length | Points per Correct Round |
|------------|-----------------|-------------------------|
| Easy | 3 | 30 points |
| Medium | 4 | 40 points |
| Hard | 5 | 50 points |

### Maximum Scores

| Difficulty | Rounds | Points per Round | Max Total |
|------------|--------|------------------|-----------|
| Easy | 4 | 30 | 120 points |
| Medium | 6 | 40 | 240 points |
| Hard | 8 | 50 | 400 points |

## Input Validation

```javascript
const handleUserClick = (color) => {
  if (phase !== "input") return;
  if (userSequence.length >= sequence.length) return;
  
  const newSequence = [...userSequence, color];
  setUserSequence(newSequence);
  
  // Check if current position is correct
  const currentIndex = newSequence.length - 1;
  const isCorrect = newSequence[currentIndex] === sequence[currentIndex];
  
  if (!isCorrect) {
    // Immediate failure - round ends
    setError(true);
    handleRoundComplete(false);
  } else if (newSequence.length === sequence.length) {
    // All correct - round complete
    handleRoundComplete(true);
  }
};
```

### Feedback States

| User Action | Sequence Status | Result |
|-------------|-----------------|--------|
| Click correct color | Partial | Continue input |
| Click correct color | Complete | Round success (+points) |
| Click wrong color | Any | Round failure (0 points) |
| Timeout | Any | Round failure (0 points) |

## Input Timeout

```javascript
// Set timeout when entering input phase
inputTimeoutRef.current = setTimeout(() => {
  handleRoundComplete(false);  // Timeout = failure
}, DIFFICULTY[difficulty].inputTimeout);

// Clear on successful/failed completion
clearTimeout(inputTimeoutRef.current);
```

### Timeout Values

| Difficulty | Timeout | Sequence | Time per Color |
|------------|---------|----------|----------------|
| Easy | 15s | 3 colors | 5s each |
| Medium | 12s | 4 colors | 3s each |
| Hard | 10s | 5 colors | 2s each |

## Result Object Structure

```javascript
{
  key: "pattern_recall",
  score: totalScore,
  time: totalTimeInSeconds,
  detail: {
    rounds: maxRounds,
    difficulty: "easy" | "medium" | "hard",
    completedRounds: roundNumber,
    averageScore: Math.round(totalScore / maxRounds),
    accuracy: Math.round((totalScore / maxPossible) * 100)
  }
}
```

## Accuracy Calculation

```javascript
const maxPossible = maxRounds * sequenceLength * 10;
const accuracy = Math.round((totalScore / maxPossible) * 100);

// Example (Medium, 4 correct out of 6 rounds):
// totalScore = 4 × 40 = 160
// maxPossible = 6 × 40 = 240
// accuracy = (160 / 240) × 100 = 67%
```

## Visual Indicators

### Show Phase Display

```javascript
// Active color block highlighted
<div className={`patternrecall-block ${
  phase === "show" && activeIndex === idx ? "active" : ""
}`}>
  {phase === "show" && activeIndex === idx && (
    <span className="color-label">{colorName}</span>
  )}
</div>
```

### Input Phase Display

```javascript
// User sequence progress shown
<div className="user-sequence">
  {Array.from({ length: sequence.length }).map((_, idx) => {
    const color = userSequence[idx];
    return (
      <div className={`slot ${color ? "filled" : "empty"} ${
        error && idx === userSequence.length - 1 ? "error" : ""
      }`}>
        {color ? colorName : "?"}
      </div>
    );
  })}
</div>
```

## Performance Interpretation

### By Difficulty

| Difficulty | Excellent | Good | Average | Below Avg |
|------------|-----------|------|---------|-----------|
| Easy (120 max) | 100+ | 70-99 | 40-69 | <40 |
| Medium (240 max) | 180+ | 120-179 | 60-119 | <60 |
| Hard (400 max) | 300+ | 200-299 | 100-199 | <100 |

### Accuracy Interpretation

| Accuracy | Performance Level |
|----------|-------------------|
| 90-100% | Excellent sequential memory |
| 70-89% | Good sequential memory |
| 50-69% | Average |
| 30-49% | Below average |
| <30% | Significant difficulty |

## Clinical Background

Sequential memory tasks like Pattern Recall assess:

- **Phonological loop capacity:** Verbal rehearsal of sequence
- **Visual-spatial sketchpad:** Mental visualization
- **Central executive:** Coordination of information

### Typical Span Lengths

| Population | Typical Sequence Span |
|------------|----------------------|
| Children (7-10) | 3-4 items |
| Teens (13-17) | 4-5 items |
| Adults (18-50) | 5-7 items |
| Older adults (65+) | 4-5 items |

## Technical Notes

- Colors can repeat within sequence
- Immediate error feedback (no waiting)
- Animation prevents double-clicks during show phase
- Input buttons disabled after sequence complete
- Backspace removes last entered color
- ESC key exits game
- Timer runs throughout session

