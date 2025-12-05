# Digit Span Test - Scoring Algorithm

## Overview

The Digit Span Test is a classic measure of working memory capacity and attention. It requires participants to memorize and recall sequences of digits, testing the "phonological loop" component of working memory.

## Cognitive Domains Assessed

- **Working Memory:** Holding digit sequences in mind
- **Attention:** Focusing on presented stimuli
- **Sequential Processing:** Maintaining correct order

## Difficulty Settings

| Level | Sequence Length | Rounds | Max Possible Score |
|-------|-----------------|--------|-------------------|
| Easy | 3 digits | 5 | 150 points |
| Medium | 5 digits | 7 | 350 points |
| Hard | 7 digits | 10 | 700 points |

## Game Flow

```
1. Show Phase (2 seconds)
   └── Display sequence of digits
   
2. Input Phase (timed)
   └── User enters remembered sequence
   
3. Submit & Score
   └── Compare user input with original sequence
   
4. Repeat for all rounds
```

## Sequence Generation

```javascript
const generateSequence = (length) => {
  return Array.from({ length }, () => 
    Math.floor(Math.random() * 9) + 1  // Digits 1-9 only
  );
};

// Example: Easy (3 digits) → [4, 7, 2]
// Example: Hard (7 digits) → [3, 8, 1, 6, 9, 2, 5]
```

## Scoring Formula

### Per-Round Calculation

```javascript
const calculateScore = () => {
  const userDigits = userInput.split("").map(Number);
  let correct = 0;
  
  for (let i = 0; i < Math.min(userDigits.length, sequence.length); i++) {
    if (userDigits[i] === sequence[i]) {
      correct++;
    }
  }
  
  return correct * 10;
};
```

### Scoring Rules

1. **Position-based scoring:** Each digit must be in the EXACT position
2. **Partial credit:** Correct digits in correct positions earn points
3. **No penalty:** Extra or missing digits don't subtract points

### Examples

| Sequence | User Input | Correct | Score |
|----------|-----------|---------|-------|
| [4, 7, 2] | 472 | 3/3 | 30 |
| [4, 7, 2] | 472 | 3/3 | 30 |
| [4, 7, 2] | 472 | 3/3 | 30 |
| [4, 7, 2] | 742 | 1/3 | 10 |
| [4, 7, 2] | 47 | 2/2 | 20 |
| [5, 8, 3, 6, 1] | 58361 | 5/5 | 50 |
| [5, 8, 3, 6, 1] | 58316 | 3/5 | 30 |

## Total Score Calculation

```javascript
totalScore = sum(roundScores);

// Example: Easy difficulty
// Round 1: 30, Round 2: 20, Round 3: 30, Round 4: 10, Round 5: 30
// Total: 120 points out of 150 possible
```

## Result Object Structure

```javascript
{
  key: "digit_span",
  score: totalScore,
  time: totalTimeInSeconds,
  detail: {
    rounds: maxRounds,
    difficulty: "easy" | "medium" | "hard",
    time: totalTimeInSeconds,
    averageScore: Math.round(totalScore / maxRounds),
    correct: Math.round(totalScore / 10),  // Total correct digits
    total: maxRounds * sequenceLength       // Total possible digits
  }
}
```

## Performance Metrics

### Average Score Calculation

```javascript
averageScore = Math.round(totalScore / maxRounds);
```

### Accuracy Calculation

```javascript
accuracy = (correct / total) * 100;

// Example: 12 correct out of 15 total = 80% accuracy
```

## Timing

| Phase | Duration |
|-------|----------|
| Show sequence | 2000ms (2 seconds) |
| Input phase | Unlimited (user-paced) |
| Between rounds | 500ms delay |

## Input Validation

```javascript
// Only numeric input allowed
const handleInputChange = (e) => {
  const value = e.target.value.replace(/\D/g, "");  // Remove non-digits
  setUserInput(value);
};

// Max length enforced by difficulty
maxLength = DIFFICULTY[difficulty].length;
```

## Performance Interpretation

| Average Score | Interpretation |
|---------------|---------------|
| 9-10 | Excellent working memory |
| 7-8 | Good working memory |
| 5-6 | Average working memory |
| 3-4 | Below average |
| 0-2 | Significant impairment possible |

## Clinical Background

The Digit Span test is derived from the Wechsler Adult Intelligence Scale (WAIS). Typical spans:

- **Normal adults:** 7 ± 2 digits (Miller's Law)
- **Children (age 7):** ~5 digits
- **Mild cognitive impairment:** 4-5 digits
- **Moderate impairment:** 3-4 digits

## Technical Notes

- Digits generated: 1-9 (zero excluded for clarity)
- Input accepts numeric keys only
- Auto-submit on completion is NOT enabled (user must click Submit)
- Timer starts after show phase ends

