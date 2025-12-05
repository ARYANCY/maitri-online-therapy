# Risk Assessment - Calculation Algorithm

## Overview

The Risk Assessment system aggregates scores from all cognitive games to calculate an overall dementia risk score. It uses a weighted domain model based on clinical cognitive assessment principles.

## Cognitive Domains

The system evaluates five primary cognitive domains:

| Domain | Weight | Associated Games |
|--------|--------|------------------|
| Memory | 25% | Memory Match, Pattern Recall, Symbol Match, Text Recall |
| Language | 15% | Text Recall, Stroop Test |
| Attention | 25% | Digit Span, N-Back, Reaction Time, Stroop Test |
| Orientation | 15% | Clock Drawing |
| Executive | 20% | N-Back, Stroop Test, Pattern Recall |

## Game-to-Domain Mapping

```javascript
const cognitiveDomainMapper = {
  clock_drawing: {
    domains: ["orientation", "executive"],
    weights: { orientation: 0.7, executive: 0.3 }
  },
  digit_span: {
    domains: ["attention", "memory"],
    weights: { attention: 0.7, memory: 0.3 }
  },
  stroop_test: {
    domains: ["attention", "executive", "language"],
    weights: { attention: 0.4, executive: 0.4, language: 0.2 }
  },
  n_back: {
    domains: ["memory", "attention", "executive"],
    weights: { memory: 0.4, attention: 0.3, executive: 0.3 }
  },
  memory: {
    domains: ["memory", "attention"],
    weights: { memory: 0.8, attention: 0.2 }
  },
  reaction_time: {
    domains: ["attention"],
    weights: { attention: 1.0 }
  },
  pattern_recall: {
    domains: ["memory", "executive"],
    weights: { memory: 0.6, executive: 0.4 }
  },
  color_sequence: {
    domains: ["memory", "attention"],
    weights: { memory: 0.7, attention: 0.3 }
  },
  symbol_match: {
    domains: ["memory", "attention"],
    weights: { memory: 0.6, attention: 0.4 }
  },
  text_recall: {
    domains: ["memory", "language"],
    weights: { memory: 0.6, language: 0.4 }
  }
};
```

## Score Normalization

Raw scores are normalized to a 0-10 scale for each game:

```javascript
const normalizeScore = (rawScore, gameKey, difficulty) => {
  // Maximum scores by game and difficulty
  const maxScores = {
    clock_drawing: { easy: 100, medium: 100, hard: 100 },
    digit_span: { easy: 150, medium: 350, hard: 700 },
    stroop_test: { easy: 50, medium: 70, hard: 100 },
    n_back: { easy: 300, medium: 350, hard: 400 },
    memory: { easy: 150, medium: 420, hard: 900 },
    reaction_time: { easy: 4250, medium: 5950, hard: 8500 },
    pattern_recall: { easy: 120, medium: 240, hard: 400 },
    color_sequence: { easy: 150, medium: 280, hard: 500 },
    symbol_match: { easy: 400, medium: 840, hard: 1800 }
  };
  
  const maxScore = maxScores[gameKey]?.[difficulty] || 100;
  
  // Normalize to 0-10 scale
  return Math.min(10, (rawScore / maxScore) * 10);
};
```

## Domain Score Calculation

```javascript
const calculateDomainScores = (gameResults) => {
  const domainScores = {
    memory: { total: 0, count: 0 },
    language: { total: 0, count: 0 },
    attention: { total: 0, count: 0 },
    orientation: { total: 0, count: 0 },
    executive: { total: 0, count: 0 }
  };
  
  gameResults.forEach(result => {
    const mapping = cognitiveDomainMapper[result.gameKey];
    if (!mapping) return;
    
    const normalizedScore = normalizeScore(
      result.score, 
      result.gameKey, 
      result.difficulty
    );
    
    // Distribute score to domains based on weights
    Object.entries(mapping.weights).forEach(([domain, weight]) => {
      domainScores[domain].total += normalizedScore * weight;
      domainScores[domain].count += weight;
    });
  });
  
  // Calculate averages
  const finalScores = {};
  Object.entries(domainScores).forEach(([domain, data]) => {
    finalScores[domain] = data.count > 0 
      ? data.total / data.count 
      : null;
  });
  
  return finalScores;
};
```

## Weighted Risk Score

```javascript
const calculateWeightedRiskScore = (domainScores) => {
  const domainWeights = {
    memory: 0.25,
    language: 0.15,
    attention: 0.25,
    orientation: 0.15,
    executive: 0.20
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.entries(domainWeights).forEach(([domain, weight]) => {
    if (domainScores[domain] !== null) {
      // Invert score (high performance = low risk)
      const riskContribution = (10 - domainScores[domain]) / 10;
      weightedSum += riskContribution * weight;
      totalWeight += weight;
    }
  });
  
  // Return risk score (0-1)
  return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
};
```

## Risk Level Classification

```javascript
const classifyRiskLevel = (riskScore) => {
  if (riskScore >= 0.7) {
    return {
      level: "high",
      emoji: "⚠️",
      color: "#ef4444",
      message: "High Risk"
    };
  } else if (riskScore >= 0.4) {
    return {
      level: "moderate",
      emoji: "⚡",
      color: "#f59e0b",
      message: "Moderate Risk"
    };
  } else {
    return {
      level: "low",
      emoji: "✅",
      color: "#22c55e",
      message: "Low Risk"
    };
  }
};
```

### Risk Thresholds

| Risk Score | Level | Interpretation |
|------------|-------|----------------|
| 0.70-1.00 | High | Professional evaluation recommended |
| 0.40-0.69 | Moderate | Monitor and retest periodically |
| 0.00-0.39 | Low | Normal cognitive function |

## Assessment Output Structure

```javascript
{
  success: true,
  
  // Primary metrics
  riskScore: 0.35,           // 0-1 scale
  riskLevel: "moderate",     // low/moderate/high
  
  // Performance summary
  averageScore: 72.5,        // Average normalized score
  averageTime: 45,           // Average seconds per game
  
  // Domain breakdown
  cognitiveMetrics: {
    cognitiveDomains: {
      memory: 7.2,           // 0-10 scale
      language: 6.8,
      attention: 7.5,
      orientation: 8.1,
      executive: 6.4,
      
      domainWeights: {
        memory: 0.25,
        language: 0.15,
        attention: 0.25,
        orientation: 0.15,
        executive: 0.20
      },
      
      weightedRiskScore: 0.35
    }
  },
  
  // AI-generated content
  explanation: "Based on your performance...",
  suggestions: [
    "Practice memory exercises daily",
    "Maintain regular sleep schedule",
    "Consider follow-up assessment in 3 months"
  ]
}
```

## Domain Score Interpretation

```javascript
const interpretDomainScore = (score) => {
  if (score >= 8) return { level: "Excellent", color: "#22c55e" };
  if (score >= 7) return { level: "Good", color: "#84cc16" };
  if (score >= 5) return { level: "Average", color: "#f59e0b" };
  if (score >= 3) return { level: "Below Average", color: "#f97316" };
  return { level: "Impaired", color: "#ef4444" };
};
```

## Visual Display

### Risk Score Visualization

```javascript
// Percentage display (0-100%)
const riskScorePercent = Math.round(
  Math.max(0, Math.min(1, riskScore)) * 100
);

// Color gradient based on risk
const riskColor = riskScore >= 0.7 ? "#ef4444" :
                  riskScore >= 0.4 ? "#f59e0b" : "#22c55e";
```

### Domain Score Display

```javascript
// Color coding for domain scores
const getDomainColor = (score) => {
  if (score >= 7) return "#22c55e";  // Green
  if (score >= 5) return "#f59e0b";  // Amber
  return "#ef4444";                   // Red
};
```

## AI-Generated Suggestions

The system generates personalized recommendations based on:

1. **Lowest domain scores:** Target weakest areas
2. **Risk level:** Urgency of recommendations
3. **Improvement patterns:** If retesting available

### Example Suggestions

```javascript
const generateSuggestions = (domainScores, riskLevel) => {
  const suggestions = [];
  
  // Memory-specific
  if (domainScores.memory < 6) {
    suggestions.push("Practice memory exercises like card matching daily");
  }
  
  // Attention-specific
  if (domainScores.attention < 6) {
    suggestions.push("Try mindfulness meditation to improve focus");
  }
  
  // Risk-based
  if (riskLevel === "high") {
    suggestions.push("Schedule a professional cognitive evaluation");
  } else if (riskLevel === "moderate") {
    suggestions.push("Retake assessment in 2-3 months to track changes");
  }
  
  return suggestions;
};
```

## Disclaimer Display

```javascript
const disclaimer = {
  title: "Important Disclaimer",
  text: `This assessment is AI-generated for self-assessment purposes only. 
         It should not be considered a clinical diagnosis. Please consult a 
         licensed healthcare professional for any medical evaluation or concerns.`
};
```

## Clinical Considerations

### Limitations

1. **Not diagnostic:** Screening tool only
2. **Single session:** May not capture typical performance
3. **Digital format:** May disadvantage technology-unfamiliar users
4. **Environmental factors:** Home vs clinical setting

### Factors Affecting Results

- Sleep quality
- Medication effects
- Anxiety/depression
- Sensory impairments
- Practice effects (familiarity with games)

### Recommended Actions by Risk Level

| Risk Level | Recommended Action |
|------------|-------------------|
| Low | Continue regular cognitive activities |
| Moderate | Retest in 2-3 months, lifestyle modifications |
| High | Consult healthcare provider for formal evaluation |

## Technical Implementation

### Backend Endpoint

```javascript
// POST /api/dementia/assess
const assessmentEndpoint = async (req, res) => {
  const { sessionId, gameResults } = req.body;
  
  // Calculate domain scores
  const domainScores = calculateDomainScores(gameResults);
  
  // Calculate risk
  const riskScore = calculateWeightedRiskScore(domainScores);
  const riskLevel = classifyRiskLevel(riskScore);
  
  // Generate AI explanation
  const explanation = await generateExplanation(domainScores, riskLevel);
  const suggestions = generateSuggestions(domainScores, riskLevel);
  
  return res.json({
    success: true,
    riskScore,
    riskLevel: riskLevel.level,
    cognitiveMetrics: { cognitiveDomains: domainScores },
    explanation,
    suggestions
  });
};
```

### Frontend Display

```javascript
// ViewResult.jsx
{riskAssessment && (
  <div>
    {/* Risk Score Circle */}
    <div style={{ color: riskStyle.color }}>
      {riskScorePercent}%
    </div>
    
    {/* Domain Scores Grid */}
    {Object.entries(domainScores).map(([domain, score]) => (
      <DomainCard domain={domain} score={score} />
    ))}
    
    {/* Suggestions List */}
    <ul>
      {suggestions.map(suggestion => (
        <li>{suggestion}</li>
      ))}
    </ul>
    
    {/* Disclaimer */}
    <Disclaimer text={disclaimerText} />
  </div>
)}
```

## Data Flow Summary

```
Game Results → Normalization → Domain Mapping → 
Weighted Aggregation → Risk Calculation → 
AI Explanation → Frontend Display
```

