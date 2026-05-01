# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0"
}
```

---

### Risk Analysis

#### GET /api/v1/analyze
Perform comprehensive risk analysis on the current project.

**Query Parameters:**
- `projectPath` (optional): Path to the project directory. Default: `./`

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "duration": 1234,
    "prediction": {
      "failureProbability": 78,
      "riskLevel": "HIGH",
      "confidence": 85,
      "factors": [
        {
          "category": "Code Quality",
          "impact": 35,
          "reason": "High code complexity (95)",
          "severity": "high"
        }
      ]
    },
    "recommendations": [
      {
        "priority": "critical",
        "action": "Delay release",
        "details": "Consider delaying release until critical issues are resolved"
      }
    ],
    "fragileModules": [
      {
        "file": "src/auth-service.js",
        "changeCount": 15,
        "riskScore": 85
      }
    ],
    "summary": {
      "overallRisk": "HIGH",
      "failureProbability": 78,
      "confidence": 85,
      "criticalIssues": 3,
      "highRiskModules": 2,
      "actionRequired": true,
      "message": "⚠️ HIGH RISK: This release has a 78% chance of failure..."
    }
  }
}
```

---

#### POST /api/v1/analyze/release
Analyze a specific release.

**Request Body:**
```json
{
  "version": "v2.5.0",
  "projectPath": "./"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "release": "v2.5.0",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "prediction": { ... },
    "recommendations": [ ... ]
  }
}
```

---

### Real-time Risk

#### GET /api/v1/risk/realtime
Get the current real-time risk score. Returns cached analysis if less than 5 minutes old.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "prediction": { ... },
    "summary": { ... }
  }
}
```

---

### Metrics

#### GET /api/v1/metrics/logs
Get log analysis metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1000,
    "errors": 50,
    "warnings": 100,
    "errorRate": 5.0,
    "warningRate": 10.0
  }
}
```

---

#### GET /api/v1/metrics/git
Get Git repository metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "commits": {
      "totalCommits": 100,
      "commitPatterns": {
        "rushed": 5,
        "hotfixes": 3,
        "features": 20
      }
    },
    "churn": {
      "filesChanged": 50,
      "insertions": 500,
      "deletions": 200,
      "churnRate": 700
    },
    "activity": {
      "totalCommits": 100,
      "activeAuthors": 5,
      "averageCommitsPerDay": 3.3
    }
  }
}
```

---

#### GET /api/v1/metrics/code
Get code quality metrics.

**Query Parameters:**
- `projectPath` (optional): Path to the project directory

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 50,
    "totalLines": 5000,
    "averageComplexity": 15,
    "coverage": {
      "estimated": 75,
      "hasTests": true
    },
    "codeSmells": [
      {
        "type": "long_method",
        "file": "src/app.js",
        "severity": "medium",
        "message": "Function has 60 lines"
      }
    ]
  }
}
```

---

### Model Training

#### POST /api/v1/model/train
Train the ML model with historical data.

**Request Body:**
```json
{
  "trainingData": [
    {
      "features": {
        "codeComplexity": 50,
        "testCoverage": 80,
        "errorRate": 5,
        "commitFrequency": 10
      },
      "failed": false
    },
    {
      "features": {
        "codeComplexity": 95,
        "testCoverage": 40,
        "errorRate": 25,
        "commitFrequency": 30
      },
      "failed": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "error": 0.005,
    "iterations": 1000
  }
}
```

---

### Statistics

#### GET /api/v1/stats
Get analyzer statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "isInitialized": true,
    "lastAnalysis": "2024-01-01T00:00:00.000Z",
    "modelStats": {
      "isTrained": true,
      "isTraining": false,
      "threshold": 0.7
    }
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

The API implements rate limiting of 100 requests per minute per IP address.

---

## CORS

CORS is enabled for all origins in development mode. Configure appropriately for production.

---

## Example Usage

### Using cURL

```bash
# Get risk analysis
curl http://localhost:3000/api/v1/analyze

# Analyze specific release
curl -X POST http://localhost:3000/api/v1/analyze/release \
  -H "Content-Type: application/json" \
  -d '{"version": "v2.5.0"}'

# Get real-time risk
curl http://localhost:3000/api/v1/risk/realtime
```

### Using JavaScript (Fetch)

```javascript
// Get risk analysis
const response = await fetch('http://localhost:3000/api/v1/analyze');
const data = await response.json();

if (data.success) {
  console.log('Risk Level:', data.data.prediction.riskLevel);
  console.log('Failure Probability:', data.data.prediction.failureProbability);
}

// Train model
const trainingResponse = await fetch('http://localhost:3000/api/v1/model/train', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ trainingData: [...] })
});
```

### Using Python (requests)

```python
import requests

# Get risk analysis
response = requests.get('http://localhost:3000/api/v1/analyze')
data = response.json()

if data['success']:
    print(f"Risk Level: {data['data']['prediction']['riskLevel']}")
    print(f"Failure Probability: {data['data']['prediction']['failureProbability']}%")
```

---

## WebSocket Support (Future)

Real-time updates via WebSocket will be available in future versions for:
- Live risk score updates
- Real-time log monitoring
- Instant alerts for critical issues