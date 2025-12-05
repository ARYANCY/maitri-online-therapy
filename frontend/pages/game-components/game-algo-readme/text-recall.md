# Text Recall (Dementia Checker) - Scoring Algorithm

## Overview

The Text Recall test presents text-based questions that users must read, memorize, and answer. It differs from other games by using language-based stimuli rather than visual patterns, testing verbal memory and comprehension.

## Cognitive Domains Assessed

- **Verbal Memory:** Encoding and recalling text information
- **Language Comprehension:** Understanding written questions
- **Attention:** Focusing on presented text
- **Working Memory:** Maintaining information during response

## Architecture

Unlike other games, Text Recall integrates with the backend API:

```
Frontend                          Backend
   │                                 │
   ├── GET /api/dementia/questions ──►│
   │◄── Questions + SessionID ────────│
   │                                 │
   ├── Answer submitted ─────────────►│
   │◄── Score feedback ───────────────│
   │                                 │
   ├── Complete session ─────────────►│
   │◄── Final assessment ─────────────│
```

## Question Visibility Formula

```javascript
const getQuestionVisibleMs = (question) => {
  // Time limit from backend (default 30s)
  const timeLimitSec = Number(question?.timeLimitSec) || 30;
  
  // Show question for 1/3 of total time
  const visibleMs = Math.floor((timeLimitSec / 3) * 1000);
  
  // Clamp between 5-10 seconds
  return Math.max(5000, Math.min(visibleMs, 10000));
};

// Examples:
// 30s time limit → 10s visible (capped at 10s)
// 15s time limit → 5s visible (5s minimum)
// 60s time limit → 10s visible (capped at 10s)
```

### Visibility Timeline

```
┌─────────────────────────────────────────────────────────┐
│                   30-SECOND QUESTION                     │
├─────────┬───────────────────────────────────────────────┤
│ VISIBLE │              HIDDEN (respond)                 │
│  0-10s  │                 10-30s                        │
├─────────┴───────────────────────────────────────────────┤
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                         │
│ Question displayed    Question hidden, countdown runs   │
└─────────────────────────────────────────────────────────┘
```

## Difficulty Levels

```javascript
const difficulties = ["easy", "medium", "hard"];

// Backend determines:
// - Question complexity
// - Time limits
// - Scoring weights
```

## Session Management

```javascript
// Local storage keys
const LS_SESSION = "dementia_session_id";
const LS_ANSWERS = "dementia_answers";

// Session persistence allows resuming interrupted tests
const sessionId = localStorage.getItem(LS_SESSION) || "";
const answers = JSON.parse(localStorage.getItem(LS_ANSWERS) || "[]");
```

## Timer Implementation

```javascript
function useCountdown(initialSec, running, onExpire) {
  const [seconds, setSeconds] = useState(initialSec);
  
  useEffect(() => {
    if (running) {
      setSeconds(initialSec);
      const interval = setInterval(() => {
        setSeconds(prev => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(interval);
            onExpire?.();  // Auto-submit when time expires
            return 0;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [initialSec, running]);
  
  return seconds;
}
```

## Audio Feedback

```javascript
// Sound effects for engagement
const sounds = {
  start: new Audio(startAudioFile),    // Game start
  tick: new Audio(tickAudioFile),      // Last 5 seconds warning
  empty: new Audio(emptyAudioFile)     // Placeholder
};

// Tick sound plays at ≤5 seconds remaining
useEffect(() => {
  if (running && seconds <= 5 && seconds > 0) {
    tickAudioRef.current.currentTime = 0;
    tickAudioRef.current.play().catch(() => {});
  }
}, [seconds, running]);
```

## Recording Feature

```javascript
// Optional voice recording for responses
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data?.size > 0) {
      audioChunks.push(e.data);
    }
  };
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    // Associate with question ID
    setAudioById(prev => ({ ...prev, [questionId]: url }));
  };
  
  mediaRecorder.start();
};
```

## Answer Handling

```javascript
const handleNext = (autoSubmit = false) => {
  // Save answer
  const answer = {
    questionId: questions[currentIdx]?.id,
    response: input,
    timeTaken: timeLimit - seconds,
    autoSubmitted: autoSubmit
  };
  
  persistAnswers([...answers, answer]);
  
  // Move to next question or complete
  if (currentIdx < questions.length - 1) {
    setCurrentIdx(prev => prev + 1);
    setInput("");
    setTimeLimit(questions[currentIdx + 1]?.timeLimitSec || 30);
  } else {
    // Session complete - trigger final assessment
    submitSession();
  }
};
```

## Data Persistence

```javascript
const persistAnswers = (newAnswers) => {
  setAnswers(newAnswers);
  localStorage.setItem(LS_ANSWERS, JSON.stringify(newAnswers));
};

// Allows resuming if browser closed mid-test
// Cleared on successful session completion
```

## Result Object Structure

```javascript
// Individual question response
{
  questionId: "q123",
  response: "user's typed answer",
  timeTaken: 15,  // seconds
  autoSubmitted: false,
  audioUrl: "blob:..." // if voice recorded
}

// Session result (from backend)
{
  sessionId: "sess_abc123",
  totalScore: 75,
  maxScore: 100,
  percentage: 75,
  questions: [...],
  cognitiveMetrics: {...}
}
```

## Scoring (Backend)

The backend calculates scores based on:

1. **Text similarity:** Comparing user response to expected answer
2. **Keyword matching:** Key concepts mentioned
3. **Completeness:** Full vs partial recall
4. **Time factor:** Speed of response

```javascript
// Conceptual backend scoring
const scoreResponse = (userAnswer, expectedAnswer) => {
  let score = 0;
  
  // Exact match
  if (normalize(userAnswer) === normalize(expectedAnswer)) {
    return 100;
  }
  
  // Partial credit
  const keywords = extractKeywords(expectedAnswer);
  keywords.forEach(keyword => {
    if (userAnswer.toLowerCase().includes(keyword.toLowerCase())) {
      score += keywordWeight;
    }
  });
  
  return Math.min(100, score);
};
```

## Risk Assessment Integration

After completing all questions, results feed into the risk assessment:

```javascript
// Frontend receives
{
  riskScore: 0.35,
  riskLevel: "moderate",
  cognitiveMetrics: {
    cognitiveDomains: {
      memory: 6.5,
      language: 7.2,
      attention: 5.8,
      orientation: 8.0,
      executive: 6.0,
      domainWeights: {...},
      weightedRiskScore: 0.35
    }
  },
  explanation: "Analysis text...",
  suggestions: [...]
}
```

## Question Types (Examples)

| Type | Example | Tests |
|------|---------|-------|
| Recall | "What was the main item mentioned?" | Memory |
| Sequence | "List the steps in order" | Sequential memory |
| Detail | "What color was mentioned?" | Attention to detail |
| Comprehension | "What was the purpose?" | Understanding |

## Timing Details

| Phase | Duration |
|-------|----------|
| Question visible | 5-10 seconds |
| Response window | 20-55 seconds (remainder) |
| Total per question | 30-60 seconds (variable) |
| Between questions | Immediate |
| Audio tick | At ≤5 seconds |

## User Interface States

```javascript
const UIStates = {
  LOADING: "Fetching questions...",
  SHOWING: "Read and memorize",
  RESPONDING: "Type your answer",
  SUBMITTING: "Processing...",
  COMPLETE: "Session finished"
};
```

## Error Handling

```javascript
try {
  const response = await API.dementia.getQuestions(difficulty);
  
  if (!response?.success) {
    throw new Error(t("dementia.failedToLoadQuestions"));
  }
  
  // Process questions...
} catch (e) {
  setError(e.message || t("dementia.failedToStart"));
}
```

## Clinical Background

Text recall tests assess:

- **Episodic verbal memory:** Story/passage recall
- **Semantic processing:** Understanding meaning
- **Verbal working memory:** Holding text in mind
- **Language production:** Formulating responses

### Clinical Comparison

| Test | Clinical Equivalent |
|------|---------------------|
| Text Recall | Logical Memory (WMS) |
| Digit Span | Digit Span (WAIS) |
| Clock Drawing | Clock Drawing Test |
| Memory Match | Visual Memory tests |

## Technical Notes

- Questions fetched from backend API
- Session ID tracks test progress
- Auto-submit on timeout (prevents skipping)
- Voice recording optional
- Keyboard: Backspace for editing, ESC to exit
- Sound effects for timing cues
- Local storage for session recovery
- Timer displayed with countdown
- Progress indicator shows question number

