# Memory Match (Matching Cards) - Algorithm Documentation

## Overview

Memory Match is a classic card-matching game that tests visual-spatial memory and pattern recognition. Players flip cards to find matching pairs of fruit emojis. The game assesses cognitive function through visual memory, spatial organization, and working memory capacity.

## Cognitive Domains Assessed

- **Visual Memory:** Remembering card positions
- **Spatial Memory:** Mental mapping of card locations
- **Pattern Recognition:** Identifying matching symbols
- **Working Memory:** Holding multiple positions in mind
- **Attention:** Selective focus on relevant cards

## Difficulty Settings

| Level | Pairs | Total Cards | Rounds | Layout |
|-------|-------|-------------|--------|--------|
| Easy | 3 pairs | 6 cards | 5 | 2×3 or 3×2 |
| Medium | 6 pairs | 12 cards | 7 | 3×4 or 4×3 |
| Hard | 9 pairs | 18 cards | 10 | 3×6 or 6×3 |

### Algorithm Configuration

```javascript
export const DIFFICULTY = {
  easy: { rounds: 5, pairs: 3 },
  medium: { rounds: 7, pairs: 6 },
  hard: { rounds: 10, pairs: 9 },
};
```

## Symbol Set (Fruits)

The game uses 15 distinct fruit emoji symbols:

```javascript
export const FRUIT_SYMBOLS = [
  "🍎", // Apple
  "🍌", // Banana
  "🍇", // Grapes
  "🍊", // Orange
  "🍓", // Strawberry
  "🥝", // Kiwi
  "🍑", // Peach
  "🍉", // Watermelon
  "🍍", // Pineapple
  "🥭", // Mango
  "🍒", // Cherry
  "🫐", // Blueberry
  "🍋", // Lemon
  "🥑", // Avocado
  "🍐", // Pear
];
```

## Grid Generation Algorithm

The grid is generated using a shuffle algorithm that ensures random distribution:

```javascript
export const generateGrid = (pairs) => {
  // Step 1: Select required number of fruits
  const selectedFruits = FRUIT_SYMBOLS.slice(0, pairs);
  
  // Step 2: Create pairs (each fruit appears twice)
  const double = [...selectedFruits, ...selectedFruits];
  
  // Step 3: Shuffle using Fisher-Yates algorithm
  return shuffleArray(double);
};
```

### Shuffle Algorithm (Fisher-Yates)

```javascript
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
```

### Example Grid Generation (Easy - 3 pairs):

```
Step 1: Select first 3 fruits
  → ["🍎", "🍌", "🍇"]

Step 2: Create pairs
  → ["🍎", "🍌", "🍇", "🍎", "🍌", "🍇"]

Step 3: Shuffle
  → ["🍌", "🍎", "🍇", "🍌", "🍇", "🍎"]
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

## Match Detection Algorithm

The game checks if two flipped cards match:

```javascript
export const checkMatch = (grid, first, second) => {
  return grid[first] === grid[second];
};
```

### Match Logic Flow

```javascript
const handleFlip = (index) => {
  // Prevent invalid flips
  if (flipped.includes(index) || matched.includes(index)) return;
  
  // Add card to flipped array
  const newFlipped = [...flipped, index];
  setFlipped(newFlipped);
  
  // When two cards are flipped, check for match
  if (newFlipped.length === 2) {
    const [first, second] = newFlipped;
    
    if (checkMatch(grid, first, second)) {
      // Match found!
      setMatched(prev => [...prev, first, second]);
      setTotalScore(prev => prev + getMatchScore());
    }
    
    // Reset flipped cards after delay (700ms for visual feedback)
    setTimeout(() => setFlipped([]), 700);
  }
};
```

## Scoring Formula

### Per-Match Scoring

```javascript
export const getMatchScore = () => 10;
```

Each successful match awards **10 points** regardless of:
- Time taken
- Number of attempts
- Difficulty level

### Scoring Rules

| Event | Points | Notes |
|-------|--------|-------|
| Successful match | +10 | Awarded immediately when match detected |
| Failed match | 0 | No penalty for incorrect guesses |
| Time bonus | 0 | Not implemented |
| Attempt penalty | 0 | No penalty for multiple attempts |

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

## Round Completion Algorithm

The game checks if a round is complete using:

```javascript
export const isRoundComplete = (matchedCount, gridSize) => {
  return matchedCount === gridSize && gridSize > 0;
};
```

### Round Progression Logic

```javascript
useEffect(() => {
  // Check if all cards in current round are matched
  if (matched.length === grid.length && grid.length > 0) {
    // Stop current round timer
    clearInterval(intervalRef.current);
    
    if (round < maxRounds) {
      // Start next round
      setRound(prev => prev + 1);
      const newGrid = generateGrid(DIFFICULTY[difficulty].pairs);
      setGrid(newGrid);
      setMatched([]);
      setFlipped([]);
      setTimer(0);
      
      // Restart timer for new round
      intervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
        setTotalTime((tt) => tt + 1);
      }, 1000);
    } else {
      // All rounds complete - show results
      clearInterval(intervalRef.current);
      setShowResult(true);
    }
  }
}, [matched, grid, difficulty, round, maxRounds, generateGrid]);
```

## Result Preparation Algorithm

The result is formatted using:

```javascript
export const prepareMemoryMatchResult = (
  totalScore, 
  totalTime, 
  difficulty, 
  maxRounds, 
  matchedCount, 
  flippedCount
) => {
  return {
    key: "memory",
    score: totalScore,
    time: totalTime,
    detail: {
      rounds: maxRounds,
      difficulty,
      time: totalTime,
      averageScore: Math.round(totalScore / maxRounds),
      matches: Math.floor(matchedCount / 2),
      attempts: Math.floor(matchedCount / 2) + Math.floor(flippedCount / 2)
    },
  };
};
```

### Result Object Structure

```javascript
{
  key: "memory",                    // Game identifier
  score: totalScore,                // Total points earned
  time: totalTimeInSeconds,          // Total time across all rounds
  detail: {
    rounds: maxRounds,               // Number of rounds completed
    difficulty: "easy" | "medium" | "hard",
    time: totalTimeInSeconds,        // Duplicate for consistency
    averageScore: Math.round(totalScore / maxRounds),  // Average per round
    matches: Math.floor(matchedCount / 2),  // Total pairs matched
    attempts: Math.floor(matchedCount / 2) + Math.floor(flippedCount / 2)  // Total attempts
  }
}
```

### Calculation Details

- **matches**: Total number of pairs successfully matched
- **attempts**: Total number of card pairs flipped (includes both successful and failed matches)
- **averageScore**: Rounded average score per round

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

### Flip Conditions

A card can be flipped only if:
1. Card is not already flipped
2. Card is not already matched
3. Less than 2 cards are currently flipped

```javascript
const handleFlip = (index) => {
  // Prevent invalid flips
  if (flipped.includes(index) || matched.includes(index)) return;
  if (flipped.length >= 2) return;  // Max 2 cards at once
  
  // Proceed with flip logic
  const newFlipped = [...flipped, index];
  setFlipped(newFlipped);
  
  // Check for match when 2 cards are flipped
  if (newFlipped.length === 2) {
    // ... match detection logic
  }
};
```

### Card States

```javascript
const isFlipped = flipped.includes(idx);   // Currently flipped (temporary)
const isMatched = matched.includes(idx);   // Successfully matched (permanent)
const isVisible = isFlipped || isMatched;   // Card face visible

// Visual states:
// - Hidden: Shows "?" (default state)
// - Flipped: Shows fruit emoji (temporary, blue background)
// - Matched: Shows fruit emoji (permanent, green background with shadow)
```

### Keyboard Shortcuts

- **Escape**: Exit game
- **Backspace**: Undo last flip (removes last card from flipped array)

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

## Timer Algorithm

The game uses a continuous timer that runs across all rounds:

```javascript
// Timer starts when game begins
gameStartRef.current = Date.now();

// Interval updates every second
intervalRef.current = setInterval(() => {
  setTimer((t) => t + 1);        // Current round timer
  setTotalTime((tt) => tt + 1);  // Total game timer
}, 1000);

// Timer resets for each new round (round timer only)
// Total time continues accumulating
```

### Timer Behavior

- **Round Timer**: Resets to 0 at start of each new round
- **Total Timer**: Continues accumulating across all rounds
- **Display**: Shows current round time to player
- **Submission**: Uses total time for result calculation

## Game Configuration Helper

```javascript
export const getGameConfig = (difficulty) => {
  if (!DIFFICULTY[difficulty]) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  return { ...DIFFICULTY[difficulty] };
};
```

This function validates and returns the configuration for a given difficulty level.

## Technical Implementation Notes

### Grid Management
- Grid reshuffled each round using Fisher-Yates algorithm
- Each round uses a fresh random arrangement
- Grid size determined by difficulty (6, 12, or 18 cards)

### State Management
- **flipped**: Array of currently visible card indices (max 2)
- **matched**: Array of successfully matched card indices
- **grid**: Current round's card arrangement
- **round**: Current round number (1-indexed)
- **totalScore**: Accumulated score across all rounds
- **totalTime**: Accumulated time across all rounds

### UI Specifications
- Card size: 100×100 pixels
- Card font size: 2rem (for emoji display)
- Mismatch display delay: 700ms
- Touch and click events supported
- Responsive flexbox layout

### User Interactions
- **Click/Tap**: Flip card
- **Backspace**: Undo last flip (removes last card from flipped array)
- **ESC**: Exit game immediately
- **Disabled state**: Cards disabled when 2 cards are flipped (prevents third flip)

### Performance Optimizations
- Uses `useCallback` for grid generation
- Uses `useRef` for timer management
- Cleans up intervals on unmount
- Prevents unnecessary re-renders with proper state management

