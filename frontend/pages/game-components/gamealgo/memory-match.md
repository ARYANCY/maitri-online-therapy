# Memory Match - Scoring Algorithm

## Overview

Memory Match is a classic card-matching game that tests visual-spatial memory and pattern recognition. Players flip cards to find matching pairs of fruit emojis.

## Cognitive Domains Assessed

- **Visual Memory:** Remembering card positions
- **Spatial Memory:** Mental mapping of card locations
- **Pattern Recognition:** Identifying matching symbols
- **Working Memory:** Holding multiple positions in mind

## Difficulty Settings

| Level | Pairs | Total Cards | Rounds | Layout |
|-------|-------|-------------|--------|--------|
| Easy | 3 pairs | 6 cards | 5 | 2×3 or 3×2 |
| Medium | 6 pairs | 12 cards | 7 | 3×4 or 4×3 |
| Hard | 9 pairs | 18 cards | 10 | 3×6 or 6×3 |

## Symbol Set (Fruits)

```javascript
const FRUIT_SYMBOLS = [
  "🍎", "🍌", "🍇", "🍊", "🍓", "🥝", 
  "🍑", "🍉", "🍍", "🥭", "🍒", "🫐", 
  "🍋", "🥑", "🍐"
];
```

## Grid Generation

```javascript
const generateGrid = (pairs) => {
  // Select required number of fruits
  const selectedFruits = FRUIT_SYMBOLS.slice(0, pairs);
  
  // Create pairs (each fruit appears twice)
  const double = [...selectedFruits, ...selectedFruits];
  
  // Shuffle the array
  return shuffleArray(double);
};

// Example (Easy - 3 pairs):
// Before shuffle: ["🍎", "🍌", "🍇", "🍎", "🍌", "🍇"]
// After shuffle:  ["🍌", "🍎", "🍇", "🍌", "🍇", "🍎"]
```

## Game Flow

```
1. Grid displayed (all cards face-down)
   
2. Player flips first card
   └── Card revealed
   
3. Player flips second card
   └── Card revealed
   └── Check for match
   
4. Match Result:
   ├── MATCH: Cards stay face-up, +10 points
   └── NO MATCH: Cards flip back after 700ms
   
5. Repeat until all pairs found
   
6. Next round (if more rounds remain)
```

## Scoring Formula

### Per-Match Scoring

```javascript
const handleFlip = (index) => {
  // ... flip logic ...
  
  if (newFlipped.length === 2) {
    const [first, second] = newFlipped;
    
    if (grid[first] === grid[second]) {
      // Match found!
      setMatched(prev => [...prev, first, second]);
      setTotalScore(prev => prev + 10);
    }
    
    // Reset flipped after delay
    setTimeout(() => setFlipped([]), 700);
  }
};
```

### Scoring Rules

| Event | Points |
|-------|--------|
| Successful match | +10 |
| Failed match | 0 |
| No time bonus | - |
| No attempt penalty | - |

### Maximum Scores

| Difficulty | Pairs per Round | Points per Round | Rounds | Max Total |
|------------|-----------------|------------------|--------|-----------|
| Easy | 3 | 30 | 5 | 150 |
| Medium | 6 | 60 | 7 | 420 |
| Hard | 9 | 90 | 10 | 900 |

## Total Score Calculation

```javascript
totalScore = matchedPairs × 10;

// Accumulated across all rounds
// New round starts when all pairs found
```

## Round Progression

```javascript
useEffect(() => {
  // Check if round complete
  if (matched.length === grid.length && grid.length > 0) {
    clearInterval(intervalRef.current);
    
    if (round < maxRounds) {
      // Start next round
      setRound(prev => prev + 1);
      const newGrid = generateGrid(DIFFICULTY[difficulty].pairs);
      setGrid(newGrid);
      setMatched([]);
      setFlipped([]);
      setTimer(0);
      // Restart timer...
    } else {
      // Game complete
      setShowResult(true);
    }
  }
}, [matched, grid, difficulty, round, maxRounds]);
```

## Result Object Structure

```javascript
{
  key: "memory",
  score: totalScore,
  time: totalTimeInSeconds,
  detail: {
    rounds: maxRounds,
    difficulty: "easy" | "medium" | "hard",
    time: totalTimeInSeconds,
    averageScore: Math.round(totalScore / maxRounds),
    matches: matched.length / 2,
    attempts: attemptCount  // Total flip pairs attempted
  }
}
```

## Timing

| Event | Duration |
|-------|----------|
| Card flip animation | Instant |
| Mismatch display | 700ms |
| Round transition | Instant |
| Timer | Counts up continuously |

## Card States

```javascript
const isFlipped = flipped.includes(idx);   // Currently flipped
const isMatched = matched.includes(idx);   // Successfully matched
const isVisible = isFlipped || isMatched;  // Card face visible

// Visual states:
// - Hidden: Shows "?"
// - Flipped: Shows fruit emoji (temporary)
// - Matched: Shows fruit emoji (permanent, green highlight)
```

## Card Interaction Rules

```javascript
// Conditions preventing flip:
// 1. Card already in flipped array
// 2. Card already in matched array
// 3. Two cards already flipped (waiting for animation)

const handleFlip = (index) => {
  if (flipped.includes(index) || matched.includes(index)) return;
  if (flipped.length >= 2) return;  // Implicit via disabled prop
  
  // ... proceed with flip
};
```

## Performance Metrics

### Efficiency Score

```javascript
// Not currently implemented but could be:
efficiency = (totalMatches / totalAttempts) × 100;

// Perfect game: efficiency = 100% (match on every attempt)
// Typical game: efficiency = 30-50%
```

### Speed Score (Alternative)

```javascript
// Could factor in time:
speedBonus = Math.max(0, baseTime - actualTime) × multiplier;
```

## Performance Interpretation

| Metric | Excellent | Good | Average | Below Avg |
|--------|-----------|------|---------|-----------|
| Time (Easy) | <30s | 30-60s | 60-90s | >90s |
| Time (Medium) | <60s | 60-120s | 120-180s | >180s |
| Time (Hard) | <90s | 90-180s | 180-300s | >300s |

## Clinical Background

Memory Match games test:

- **Short-term visual memory:** Remembering recently seen positions
- **Spatial organization:** Mental mapping of the grid
- **Selective attention:** Focusing on relevant cards
- **Pattern matching:** Quick recognition of symbols

### Age-Related Norms

- Children (6-10): May need 2× attempts vs adults
- Adults (20-40): Baseline performance
- Older adults (60+): 1.5-2× time, slight decrease in efficiency

## Technical Notes

- Grid reshuffled each round
- Shuffle uses Fisher-Yates algorithm variant
- Timer runs continuously across rounds
- Card size: 100×100 pixels
- Touch and click supported
- Backspace removes last flipped card
- ESC exits game

