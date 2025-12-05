# N-Back Test - Scoring Algorithm

## Overview

The N-Back Test is a continuous performance task used to measure working memory capacity and executive function. Participants must identify when the current stimulus matches the one presented N steps earlier in the sequence.

## Cognitive Domains Assessed

- **Working Memory:** Maintaining and updating information
- **Executive Function:** Cognitive control and task switching
- **Attention:** Sustained attention over time
- **Processing Speed:** Quick comparison and response

## The N-Back Concept

```
Sequence: 3 → 7 → 3 → 8 → 7 → 3

1-Back: Match if current = previous (position -1)
2-Back: Match if current = 2 positions back
3-Back: Match if current = 3 positions back

Example (2-Back):
Position 1: 3 → No comparison possible
Position 2: 7 → No comparison possible  
Position 3: 3 → Compare to Position 1 (3) ✓ MATCH
Position 4: 8 → Compare to Position 2 (7) ✗ NO MATCH
Position 5: 7 → Compare to Position 3 (3) ✗ NO MATCH
Position 6: 3 → Compare to Position 4 (8) ✗ NO MATCH
```

## Difficulty Settings

| Level | N-Back Level | Rounds | Sequence Length | Comparisons per Round |
|-------|--------------|--------|-----------------|----------------------|
| Easy | 1-Back | 5 | 7 digits | 6 |
| Medium | 2-Back | 7 | 7 digits | 5 |
| Hard | 3-Back | 10 | 7 digits | 4 |

## Game Flow

```
1. Show Phase (10.5 seconds)
   └── Display 7 digits sequentially (1.5s each)
   
2. Input Phase (timed)
   └── User enters N-back responses for positions (N+1) to 7
   
3. Submit & Score
   └── Compare user inputs with expected values
   
4. Repeat for all rounds
```

## Sequence Generation

```javascript
const generateSequence = () => {
  return Array.from({ length: 7 }, () => 
    Math.floor(Math.random() * 9) + 1  // Digits 1-9
  );
};

// Example: [4, 2, 8, 4, 7, 2, 5]
```

## Scoring Formula

### Per-Round Calculation

```javascript
const calculateScore = () => {
  const level = DIFFICULTY[difficulty].level;  // N value
  let score = 0;
  let correct = 0;
  let total = 0;

  // Only positions from N onwards can be compared
  for (let i = level; i < sequence.length; i++) {
    total++;
    const expected = sequence[i - level];  // N positions back
    const userInput = userInputs[i - level];
    
    if (userInput === expected) {
      score += 10;
      correct++;
    }
  }

  return { score, correct, total };
};
```

### Scoring Examples

**1-Back (Easy):**
```
Sequence: [4, 2, 8, 4, 7, 2, 5]
Positions to answer: 2, 3, 4, 5, 6, 7 (6 comparisons)
Expected answers: [4, 2, 8, 4, 7, 2] (previous values)

User enters: [4, 2, 8, 4, 7, 2]
All correct: 6 × 10 = 60 points
```

**2-Back (Medium):**
```
Sequence: [4, 2, 8, 4, 7, 2, 5]
Positions to answer: 3, 4, 5, 6, 7 (5 comparisons)
Expected answers: [4, 2, 8, 4, 7] (2 positions back)

User enters: [4, 2, 8, 4, 7]
All correct: 5 × 10 = 50 points
```

**3-Back (Hard):**
```
Sequence: [4, 2, 8, 4, 7, 2, 5]
Positions to answer: 4, 5, 6, 7 (4 comparisons)
Expected answers: [4, 2, 8, 4] (3 positions back)

User enters: [4, 2, 8, 4]
All correct: 4 × 10 = 40 points
```

## Total Score Calculation

```javascript
totalScore = sum(roundScores);

// Maximum scores per difficulty:
// Easy:   5 rounds × 60 points = 300 points max
// Medium: 7 rounds × 50 points = 350 points max
// Hard:   10 rounds × 40 points = 400 points max
```

## Result Object Structure

```javascript
{
  key: "n_back",
  score: totalScore,
  time: totalTimeInSeconds,
  detail: {
    rounds: maxRounds,
    difficulty: "easy" | "medium" | "hard",
    time: totalTimeInSeconds,
    averageScore: Math.round(totalScore / maxRounds),
    correct: totalCorrect,
    total: totalComparisons
  }
}
```

## Timing

| Phase | Duration |
|-------|----------|
| Each digit display | 1500ms (1.5 seconds) |
| Show phase total | 10.5 seconds (7 × 1.5s) |
| Input phase | Unlimited (user-paced) |
| Between rounds | 500ms delay |

## Input Interface

```javascript
// Inputs for each position from (N+1) to 7
Array.from({ length: sequence.length - nLevel }).map((_, idx) => {
  const position = idx + nLevel;  // Actual position (1-indexed)
  return (
    <input
      type="number"
      min="1"
      max="9"
      value={userInputs[idx] || ""}
      // Label shows: "#4:", "#5:", etc.
    />
  );
});
```

## Performance Interpretation

### Average Score per Round

| N-Level | Max Score | Excellent | Good | Average | Below Avg |
|---------|-----------|-----------|------|---------|-----------|
| 1-Back | 60 | 50-60 | 40-49 | 30-39 | <30 |
| 2-Back | 50 | 40-50 | 30-39 | 20-29 | <20 |
| 3-Back | 40 | 35-40 | 25-34 | 15-24 | <15 |

### Accuracy Calculation

```javascript
accuracy = (correct / total) * 100;
```

## Clinical Background

The N-Back task was introduced by Kirchner (1958) and has become a standard measure of working memory updating. Key findings:

- **Typical 1-Back accuracy:** ~90% in healthy adults
- **Typical 2-Back accuracy:** ~70-80% in healthy adults
- **Typical 3-Back accuracy:** ~60-70% in healthy adults

### Cognitive Load Increase

Each increase in N-level significantly increases cognitive load:
- 1-Back: Simple comparison (low load)
- 2-Back: Moderate working memory demand
- 3-Back: High working memory demand

### Clinical Applications

- ADHD assessment
- Working memory training
- Cognitive decline monitoring
- Schizophrenia research
- Aging studies

## Technical Notes

- Sequence stored in ref to prevent stale closure issues
- Animation interval cleared properly on unmount
- Input validation: only accepts digits 1-9
- Keyboard navigation: Enter moves to next input
- Backspace support for corrections
- ESC key exits the game

