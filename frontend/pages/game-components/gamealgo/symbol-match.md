# Symbol Match - Scoring Algorithm

## Overview

Symbol Match is an advanced memory card game using various symbols instead of simple images. It tests visual memory, pattern recognition, and concentration through a card-matching paradigm with increasing difficulty.

## Cognitive Domains Assessed

- **Visual Memory:** Symbol recognition and location recall
- **Pattern Recognition:** Identifying matching symbols
- **Spatial Memory:** Remembering card positions in grid
- **Working Memory:** Maintaining multiple potential matches
- **Attention:** Sustained focus during gameplay

## Difficulty Settings

| Level | Pairs | Total Cards | Rounds | Time Limit | Symbol Set |
|-------|-------|-------------|--------|------------|------------|
| Easy | 4 | 8 | 5 | 120s | 6 basic |
| Medium | 6 | 12 | 7 | 180s | 12 medium |
| Hard | 9 | 18 | 10 | 240s | 20 extended |

## Symbol Sets

```javascript
const SYMBOLS = {
  easy: ["★", "●", "▲", "■", "◆", "♥"],
  
  medium: ["★", "●", "▲", "■", "◆", "♥", 
           "♦", "♠", "♣", "☀", "☁", "☂"],
  
  hard: ["★", "●", "▲", "■", "◆", "♥", 
         "♦", "♠", "♣", "☀", "☁", "☂",
         "☃", "☄", "☎", "☏", "☐", "☑", 
         "☒", "☓"]
};
```

## Grid Generation

```javascript
const generateGrid = (pairs, level) => {
  // Select symbols from appropriate set
  const symbolSet = SYMBOLS[level];
  const selectedSymbols = symbolSet.slice(0, pairs);
  
  // Create pairs (each symbol appears twice)
  const pairsArray = [...selectedSymbols, ...selectedSymbols];
  
  // Fisher-Yates shuffle
  return shuffleArray(pairsArray);
};

// Example (Easy - 4 pairs):
// Symbols: ["★", "●", "▲", "■"]
// Grid: ["▲", "★", "■", "●", "★", "▲", "●", "■"]
```

### Grid Layout

```javascript
// Dynamic grid sizing based on card count
const gridColumns = Math.ceil(Math.sqrt(grid.length));

// Easy (8 cards):  3×3 grid (with 1 empty)
// Medium (12 cards): 3×4 or 4×3 grid
// Hard (18 cards): 4×5 or 5×4 grid (with 2 empty)
```

## Game Flow

```
1. GRID DISPLAY
   └── All cards face-down showing "?"

2. FIRST FLIP
   └── Player clicks card → Card reveals symbol

3. SECOND FLIP
   └── Player clicks another card → Card reveals symbol
   └── System compares symbols

4. MATCH EVALUATION
   ├── MATCH: Both cards stay revealed, +20 points
   │   └── Cards marked as "matched" (green highlight)
   └── NO MATCH: Both cards flip back after 1 second

5. CONTINUE
   └── Repeat until all pairs matched

6. ROUND COMPLETE
   └── New grid generated for next round
```

## Scoring Formula

### Per-Match Scoring

```javascript
const handleFlip = (index) => {
  if (isProcessing || flipped.includes(index) || matched.includes(index)) {
    return;
  }
  
  const newFlipped = [...flipped, index];
  setFlipped(newFlipped);

  if (newFlipped.length === 2) {
    setIsProcessing(true);
    setAttempts(prev => prev + 1);
    
    const [first, second] = newFlipped;
    
    if (grid[first] === grid[second]) {
      // MATCH!
      setTimeout(() => {
        setMatched(prev => [...prev, first, second]);
        setTotalScore(prev => prev + 20);  // +20 per match
        setFlipped([]);
        setIsProcessing(false);
      }, 500);
    } else {
      // NO MATCH
      setTimeout(() => {
        setFlipped([]);
        setIsProcessing(false);
      }, 1000);
    }
  }
};
```

### Scoring Rules

| Event | Points |
|-------|--------|
| Successful match | +20 |
| Failed match | 0 |
| Time bonus | None |
| Efficiency bonus | None |

### Maximum Scores

| Difficulty | Pairs/Round | Points/Round | Rounds | Max Total |
|------------|-------------|--------------|--------|-----------|
| Easy | 4 | 80 | 5 | 400 |
| Medium | 6 | 120 | 7 | 840 |
| Hard | 9 | 180 | 10 | 1,800 |

## Accuracy Calculation

```javascript
const accuracy = attempts > 0 
  ? Math.round((matchedPairs / attempts) * 100) 
  : 0;

// Example:
// 6 pairs found in 15 attempts
// Accuracy = (6 / 15) × 100 = 40%
```

### Accuracy Interpretation

| Accuracy | Skill Level |
|----------|-------------|
| 80-100% | Excellent memory |
| 60-79% | Good memory |
| 40-59% | Average |
| 20-39% | Below average |
| <20% | Random guessing |

## Progress Tracking

```javascript
const progress = grid.length > 0 
  ? Math.round((matched.length / grid.length) * 100) 
  : 0;

// Visual progress bar updates in real-time
// 0% → 25% → 50% → 75% → 100% (round complete)
```

## Card States

```javascript
const CardState = {
  HIDDEN: "?",           // Face-down, clickable
  FLIPPED: "visible",    // Temporarily revealed
  MATCHED: "matched",    // Permanently revealed, disabled
  PROCESSING: "waiting"  // During match evaluation
};

// Visual classes:
// hidden: bg-secondary, shows "?"
// flipped: bg-info, shows symbol
// matched: bg-success, shows symbol, green border
```

## Result Object Structure

```javascript
{
  key: "symbol_match",
  score: totalScore,
  time: totalTimeInSeconds,
  detail: {
    rounds: maxRounds,
    difficulty: "easy" | "medium" | "hard",
    time: totalTimeInSeconds,
    averageScore: Math.round(totalScore / maxRounds),
    matches: totalMatchedPairs,
    attempts: totalAttempts,
    accuracy: Math.round((matches / attempts) * 100)
  }
}
```

## Timing

| Event | Duration |
|-------|----------|
| Card flip animation | Instant (CSS transition) |
| Match highlight | 500ms before clearing flipped |
| Mismatch display | 1000ms before hiding |
| Round transition | 1000ms delay |
| Timer | Continuous (per round) |

## Round Progression

```javascript
useEffect(() => {
  if (matched.length === grid.length && grid.length > 0 && !isProcessing) {
    clearInterval(intervalRef.current);
    
    if (round < maxRounds) {
      setTimeout(() => {
        setRound(prev => prev + 1);
        const newGrid = generateGrid(DIFFICULTY[difficulty].pairs, difficulty);
        setGrid(newGrid);
        setMatched([]);
        setFlipped([]);
        setTimer(0);
        setIsProcessing(false);
        // Restart timer
      }, 1000);
    } else {
      setShowResult(true);
    }
  }
}, [matched, grid, difficulty, round, maxRounds, isProcessing]);
```

## Instructions Modal

```javascript
// First-time instructions shown
const instructions = [
  "Click on cards to reveal symbols",
  "Match pairs of identical symbols",
  "Complete all rounds to finish",
  "Score points for each successful match"
];
```

## Performance Interpretation

### By Total Score

| Difficulty | Excellent | Good | Average | Below Avg |
|------------|-----------|------|---------|-----------|
| Easy (400) | 350+ | 280-349 | 200-279 | <200 |
| Medium (840) | 700+ | 550-699 | 400-549 | <400 |
| Hard (1800) | 1500+ | 1200-1499 | 800-1199 | <800 |

### By Time (Single Round)

| Pairs | Fast | Normal | Slow |
|-------|------|--------|------|
| 4 | <20s | 20-40s | >40s |
| 6 | <40s | 40-80s | >80s |
| 9 | <60s | 60-120s | >120s |

## Clinical Background

Symbol matching tasks assess multiple cognitive functions:

- **Object recognition:** Identifying visual symbols
- **Spatial memory:** Remembering positions in 2D space
- **Executive function:** Strategy development
- **Processing speed:** Quick visual comparison

### Age Norms

| Age Group | Typical Accuracy (Medium) |
|-----------|--------------------------|
| Children (8-12) | 35-50% |
| Teens (13-17) | 45-60% |
| Adults (18-50) | 50-70% |
| Older Adults (60+) | 40-55% |

## Comparison with Memory Match

| Feature | Symbol Match | Memory Match |
|---------|--------------|--------------|
| Symbols | Abstract shapes | Fruit emojis |
| Points/match | 20 | 10 |
| Difficulty range | Higher | Lower |
| Symbol complexity | Varies by level | Constant |
| Attempt tracking | Yes | Limited |
| Accuracy metric | Yes | No |

## Technical Notes

- Fisher-Yates shuffle for randomization
- Processing lock prevents rapid clicking
- Accessibility: aria-labels for screen readers
- Grid auto-sizes based on card count
- Card size: responsive, ~80px minimum
- Touch-optimized with adequate spacing
- ESC key exits game
- Round timer displayed
- Attempts counter visible

