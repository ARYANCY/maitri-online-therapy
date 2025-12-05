# Game Component Scoring Algorithms & Formulas

This document provides detailed information about the scoring algorithms, formulas, and result calculations for each cognitive assessment game component in the Maitri dementia screening platform.

---

## Table of Contents

1. [Clock Drawing Test](#1-clock-drawing-test)
2. [Digit Span](#2-digit-span)
3. [Stroop Test](#3-stroop-test)
4. [N-Back Test](#4-n-back-test)
5. [Memory Match](#5-memory-match)
6. [Reaction Time Test](#6-reaction-time-test)
7. [Pattern Recall](#7-pattern-recall)
8. [Color Sequence](#8-color-sequence)
9. [Symbol Match](#9-symbol-match)
10. [Text Recall (Dementia Checker)](#10-text-recall-dementia-checker)
11. [Result Popup Performance Levels](#11-result-popup-performance-levels)
12. [Risk Assessment Calculation](#12-risk-assessment-calculation)

---

## 1. Clock Drawing Test

**File:** `ClockDrawing.jsx`

**Cognitive Domain:** Visuospatial, Executive Function, Memory

### Scoring Algorithm

The clock drawing test analyzes the user's drawing using pixel analysis to detect key components:

```
Total Score = Circle Score + Numbers Score + Hands Score + Hand Placement Score + Bonus

Where:
- Circle Score = 25 points (if circular outline detected)
- Numbers Score = 30 points (if 8+ numbers detected in correct positions)
- Hands Score = 25 points (if at least one hand detected)
- Hand Placement Score = 20 points (if both hour and minute hands correctly placed)
- Bonus = 0-5 points (based on number count: +5 for 12, +3 for 10+)

Maximum Score: 100 points
```

### Detection Criteria

| Component | Detection Method | Threshold |
|-----------|-----------------|-----------|
| Circle | Pixel sampling at 36 points around clock radius | >20 points with alpha > 0 |
| Numbers | Pixel detection in 12 positions (15px radius each) | ≥8 positions with marks |
| Hour Hand | Ray tracing from center at hour angle | Alpha > 50 within 60% of radius |
| Minute Hand | Ray tracing from center at minute angle | Alpha > 50 within 80% of radius |

### Target Times

Randomly selected from: `11:10`, `3:00`, `2:45`

---

## 2. Digit Span

**File:** `DigitSpan.jsx`

**Cognitive Domain:** Working Memory, Attention

### Difficulty Settings

| Level | Sequence Length | Rounds |
|-------|-----------------|--------|
| Easy | 3 digits | 5 |
| Medium | 5 digits | 7 |
| Hard | 7 digits | 10 |

### Scoring Formula

```
Round Score = Correct Digits × 10

Where:
- Correct Digits = number of positions where user input matches sequence

Total Score = Sum of all Round Scores
```

### Result Details

```javascript
{
  rounds: maxRounds,
  difficulty: "easy" | "medium" | "hard",
  averageScore: totalScore / maxRounds,
  correct: totalScore / 10,  // total correct digits
  total: maxRounds × sequenceLength
}
```

---

## 3. Stroop Test

**File:** `StroopTest.jsx`

**Cognitive Domain:** Executive Function, Attention, Inhibition

### Difficulty Settings

| Level | Colors Available | Rounds |
|-------|------------------|--------|
| Easy | red, green, blue | 5 |
| Medium | red, green, blue, yellow | 7 |
| Hard | red, green, blue, yellow, purple | 10 |

### Scoring Formula

```
Round Score = Base Score - Time Penalty

Where:
- Base Score = 10 (if correct color selected) or 0 (if incorrect)
- Time Penalty = min(response_time_seconds, 10)

Round Score = max(0, Base Score - Time Penalty)
Total Score = Sum of all Round Scores
```

### Example Calculation

```
User clicks correct color in 3 seconds:
Round Score = 10 - 3 = 7 points

User clicks correct color in 15 seconds:
Round Score = 10 - 10 = 0 points (capped penalty)

User clicks wrong color:
Round Score = 0 - 0 = 0 points
```

---

## 4. N-Back Test

**File:** `NBack.jsx`

**Cognitive Domain:** Working Memory, Executive Function

### Difficulty Settings

| Level | N-Back Level | Rounds |
|-------|--------------|--------|
| Easy | 1-Back | 5 |
| Medium | 2-Back | 7 |
| Hard | 3-Back | 10 |

### Scoring Formula

```
For each position i (where i >= N):
  Expected = sequence[i - N]
  UserInput = userInputs[i - N]
  
  If UserInput === Expected:
    Score += 10
    Correct += 1

Total Score = Sum of all correct responses × 10
```

### Sequence Generation

- 7 random digits (1-9) per round
- User must recall digits that appeared N positions back

---

## 5. Memory Match

**File:** `MemoryMatch.jsx`

**Cognitive Domain:** Visual Memory, Pattern Recognition

### Difficulty Settings

| Level | Pairs | Rounds |
|-------|-------|--------|
| Easy | 3 pairs (6 cards) | 5 |
| Medium | 6 pairs (12 cards) | 7 |
| Hard | 9 pairs (18 cards) | 10 |

### Scoring Formula

```
Match Score = 10 points per successful match

Total Score = Matched Pairs × 10
```

### Result Details

```javascript
{
  rounds: maxRounds,
  difficulty: "easy" | "medium" | "hard",
  averageScore: totalScore / maxRounds,
  matches: matched.length / 2,
  attempts: flipped.length / 2
}
```

---

## 6. Reaction Time Test

**File:** `ReactionTimeTest.jsx`

**Cognitive Domain:** Processing Speed, Attention

### Difficulty Settings

| Level | Rounds | Min Delay | Max Delay |
|-------|--------|-----------|-----------|
| Easy | 5 | 2000ms | 4000ms |
| Medium | 7 | 1000ms | 3000ms |
| Hard | 10 | 500ms | 2000ms |

### Scoring Formula

```
Round Score = max(0, 1000 - Reaction Time in ms)

Total Score = Sum of all Round Scores
```

### Key Metrics

```javascript
{
  averageReactionTime: sum(reactionTimes) / reactionTimes.length,
  bestReactionTime: min(reactionTimes),
  averageScore: totalScore / maxRounds
}
```

### Penalty for Early Click

- Clicking before green signal shows "TOO EARLY!" warning
- No score deduction, but round doesn't count

---

## 7. Pattern Recall

**File:** `PatternRecall.jsx`

**Cognitive Domain:** Visual Memory, Sequential Processing

### Difficulty Settings

| Level | Sequence Length | Colors | Rounds | Show Duration | Input Timeout |
|-------|-----------------|--------|--------|---------------|---------------|
| Easy | 3 | 4 | 4 | 800ms | 15s |
| Medium | 4 | 5 | 6 | 700ms | 12s |
| Hard | 5 | 6 | 8 | 600ms | 10s |

### Scoring Formula

```
If sequence is fully correct:
  Round Score = Sequence Length × 10
Else:
  Round Score = 0

Total Score = Sum of all Round Scores
```

### Accuracy Calculation

```
Accuracy = (totalScore / (maxRounds × sequenceLength × 10)) × 100
```

---

## 8. Color Sequence

**File:** `ColorSequence.jsx`

**Cognitive Domain:** Visual Memory, Sequential Processing

### Difficulty Settings

| Level | Sequence Length | Colors | Rounds |
|-------|-----------------|--------|--------|
| Easy | 3 | 3 (R, G, B) | 5 |
| Medium | 4 | 4 (R, G, B, Y) | 7 |
| Hard | 5 | 5 (R, G, B, Y, P) | 10 |

### Scoring Formula

```
For each color in sequence:
  If userSequence[i] === sequence[i]:
    Score += 10

Total Score = Sum of all Round Scores
```

### Display Timing

```
Show Phase Duration = 1000ms × sequence.length
```

---

## 9. Symbol Match

**File:** `SymbolMatch.jsx`

**Cognitive Domain:** Visual Memory, Pattern Recognition

### Difficulty Settings

| Level | Pairs | Rounds | Time Limit | Symbols |
|-------|-------|--------|------------|---------|
| Easy | 4 | 5 | 120s | 6 basic |
| Medium | 6 | 7 | 180s | 12 medium |
| Hard | 9 | 10 | 240s | 20 extended |

### Scoring Formula

```
Match Score = 20 points per successful match

Total Score = Sum of all Match Scores
```

### Accuracy Calculation

```
Accuracy = (Matched Pairs / Total Attempts) × 100
```

### Result Details

```javascript
{
  rounds: maxRounds,
  difficulty: "easy" | "medium" | "hard",
  time: totalTime,
  averageScore: totalScore / maxRounds,
  matches: matched.length / 2,
  attempts: attemptCount,
  accuracy: (matches / attempts) × 100
}
```

---

## 10. Text Recall (Dementia Checker)

**File:** `dementiaChecker.jsx`

**Cognitive Domain:** Memory, Language, Comprehension

### Question Visibility Formula

```javascript
visibleMs = (timeLimitSec / 3) × 1000

// Clamped between 5000ms and 10000ms
visibleMs = max(5000, min(visibleMs, 10000))
```

### Timing Features

- Countdown timer with audio tick at ≤5 seconds
- Auto-advance when time expires
- Questions fetched from backend API

### Storage

- Session ID persisted in `localStorage` as `dementia_session_id`
- Answers persisted as `dementia_answers`

---

## 11. Result Popup Performance Levels

**File:** `ResultPopup.jsx`

### Score Thresholds

| Score Range | Level | Emoji | Color | Message |
|-------------|-------|-------|-------|---------|
| ≥80 | Excellent | 🌟 | #22c55e (green) | "Excellent performance!" |
| 60-79 | Good | 👍 | #3b82f6 (blue) | "Good performance!" |
| 40-59 | Fair | 💪 | #f59e0b (amber) | "Fair performance!" |
| <40 | Practice | 📚 | #ef4444 (red) | "Keep practicing!" |

### Additional Statistics Display

```javascript
if (detail.rounds) → Show "Rounds"
if (detail.attempts !== undefined) → Show "Attempts"
if (detail.correct && detail.total) → Show "Accuracy" = (correct/total) × 100%
if (detail.errors !== undefined) → Show "Errors"
```

---

## 12. Risk Assessment Calculation

**File:** `ViewResult.jsx`

### Risk Level Thresholds

| Risk Score | Level | Emoji | Color |
|------------|-------|-------|-------|
| High | High Risk | ⚠️ | #ef4444 (red) |
| Moderate | Moderate Risk | ⚡ | #f59e0b (amber) |
| Low | Low Risk | ✅ | #22c55e (green) |

### Display Formula

```javascript
riskScorePercent = Math.round(Math.max(0, Math.min(1, riskScore)) × 100)
```

### Cognitive Domains Displayed

- Memory
- Language
- Attention
- Orientation
- Executive

### Domain Score Interpretation

| Domain Score | Color |
|--------------|-------|
| ≥7 | Green (#22c55e) |
| 5-6.9 | Amber (#f59e0b) |
| <5 | Red (#ef4444) |

### Weighted Risk Score

```
weightedRiskScore = Σ(domainScore × domainWeight) / Σ(domainWeights)
```

---

## Summary Table

| Game | Max Score Formula | Primary Cognitive Domain |
|------|-------------------|--------------------------|
| Clock Drawing | 100 (fixed components) | Visuospatial, Executive |
| Digit Span | rounds × sequenceLength × 10 | Working Memory |
| Stroop Test | rounds × 10 | Executive Function |
| N-Back | (seqLength - N) × rounds × 10 | Working Memory |
| Memory Match | pairs × rounds × 10 | Visual Memory |
| Reaction Time | rounds × 1000 | Processing Speed |
| Pattern Recall | seqLength × rounds × 10 | Sequential Memory |
| Color Sequence | seqLength × rounds × 10 | Sequential Memory |
| Symbol Match | pairs × rounds × 20 | Visual Memory |

---

## Notes

1. **Time Tracking:** All games track total time for completion
2. **Difficulty Impact:** Higher difficulty = more rounds/complexity but same scoring base
3. **Round Score:** Most games use 10 points per correct item as base
4. **Persistence:** Games don't persist progress mid-session (except Text Recall)
5. **Exit:** All games support ESC key or Exit button to leave early
6. **Backspace:** Most games support backspace to undo last action

---

*Last Updated: December 2024*

