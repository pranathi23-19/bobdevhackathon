# AI Organizational Risk Predictor 🚀

## 💡 Overview
An advanced AI-powered system that predicts organizational failures by analyzing system logs, developer activity, and code changes to identify potential outages, team bottlenecks, and delivery risks.

**🤖 NEW: AI ROOT CAUSE ANALYZER!**
- **Instant error analysis** - 2 seconds vs 30-60 minutes manual log reading
- **Real-time error spike detection** with live charts
- **Watson AI identifies root causes** automatically
- **Actionable solutions** provided for each issue
- **No manual log reading required!**

**🌩️ POWERED BY IBM CLOUD**
- Watson AI-powered analysis
- Real-time cloud monitoring
- Infrastructure health tracking
- Downtime simulation for testing

## 🎯 Key Features

### 1. **Multi-Source Data Analysis**
- **System Logs**: Real-time monitoring of application errors, warnings, and performance metrics
- **Developer Activity**: Git commits, PR patterns, code review velocity
- **Code Changes**: Complexity metrics, fragile module detection, test coverage

### 2. **Predictive Intelligence**
- **Failure Probability**: Calculate risk scores for releases (0-100%)
- **Bottleneck Detection**: Identify team capacity issues and blockers
- **Risk Factors**: Pinpoint specific causes (rushed changes, fragile modules, insufficient testing)

### 3. **Actionable Insights**
- Real-time risk alerts
- Detailed risk breakdown by category
- Historical trend analysis
- Recommended mitigation strategies

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Data Collection Layer                  │
├─────────────────────────────────────────────────────────┤
│  • Log Aggregator    • Git Analyzer    • Code Metrics   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  AI Prediction Engine                    │
├─────────────────────────────────────────────────────────┤
│  • Feature Engineering  • ML Models  • Risk Scoring     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    API & Dashboard                       │
├─────────────────────────────────────────────────────────┤
│  • REST API  • Real-time Alerts  • Visualization        │
└─────────────────────────────────────────────────────────┘
```

## 📊 Example Output

```json
{
  "release": "v2.5.0",
  "failureProbability": 78,
  "riskLevel": "HIGH",
  "factors": [
    {
      "category": "Code Quality",
      "impact": 35,
      "reason": "Rushed changes in last 48 hours (15 commits without reviews)"
    },
    {
      "category": "System Stability",
      "impact": 28,
      "reason": "Fragile modules: auth-service, payment-gateway"
    },
    {
      "category": "Testing",
      "impact": 15,
      "reason": "Test coverage dropped from 85% to 62%"
    }
  ],
  "recommendations": [
    "Delay release by 24 hours for proper code review",
    "Add integration tests for auth-service",
    "Conduct load testing on payment-gateway"
  ]
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- Access to system logs (optional: ELK stack, Splunk, or CloudWatch)
- IBM Cloud account (optional - works in demo mode without credentials)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Bobdevhackathon

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration (IBM Cloud credentials optional)

# Run the application
npm start
```

### 🤖 AI Root Cause Analyzer (RECOMMENDED!)

**The fastest way to see AI in action:**

```bash
npm start
# Open: http://localhost:3000/ai-dashboard.html
```

**What you'll see:**
- 📊 **Live error monitoring** - Real-time chart updates every 3 seconds
- ⚠️ **Automatic spike detection** - Alerts when errors exceed threshold
- 🤖 **One-click AI analysis** - Click "Analyze with AI" button
- 🎯 **Instant root causes** - AI identifies top 3 causes in 2-3 seconds
- 💡 **Actionable solutions** - Step-by-step fixes for each issue
- 🔥 **Simulate errors** - Test with one-click error spike simulation

**Perfect for demos!** Shows the power of AI vs manual log reading.

### 🌩️ IBM Cloud Enhanced Dashboard

For full IBM Cloud monitoring with downtime simulation:

```bash
npm start
# Open: http://localhost:3000/dashboard.html
```

**Features:**
- 🎨 Modern IBM Design Language UI
- ☁️ Real-time IBM Cloud health monitoring
- 📊 Infrastructure metrics dashboard
- ⚠️ Downtime simulation for testing (60 seconds)
- 💡 AI-powered recommendations
- 🔄 Auto-refresh capabilities

### 📱 All Available Dashboards

1. **AI Root Cause Analyzer** ⭐ BEST FOR DEMOS
   - URL: `http://localhost:3000/ai-dashboard.html`
   - Shows: Real-time error analysis with instant AI root cause identification

2. **IBM Cloud Dashboard**
   - URL: `http://localhost:3000/dashboard.html`
   - Shows: Full IBM Cloud integration with health monitoring

3. **Original Dashboard**
   - URL: `http://localhost:3000`
   - Shows: Basic risk analysis interface

### Development Mode

```bash
npm run dev
```

## 📁 Project Structure

```
Bobdevhackathon/
├── src/
│   ├── collectors/          # Data collection modules
│   │   ├── log-collector.js
│   │   ├── git-analyzer.js
│   │   └── code-metrics.js
│   ├── ml/                  # Machine learning models
│   │   ├── feature-engineering.js
│   │   ├── risk-predictor.js
│   │   └── models/
│   ├── api/                 # REST API endpoints
│   │   ├── routes/
│   │   └── controllers/
│   ├── services/            # Business logic
│   │   ├── risk-analyzer.js
│   │   └── alert-service.js
│   └── utils/               # Utilities
├── tests/                   # Test suites
├── config/                  # Configuration files
├── data/                    # Sample data
└── docs/                    # Documentation
```

## 🔧 Configuration

### Environment Variables

```env
# Application
PORT=3000
NODE_ENV=development

# Data Sources
LOG_SOURCE=file|elk|cloudwatch
GIT_REPO_PATH=./
GIT_BRANCH=main

# ML Model
MODEL_THRESHOLD=0.7
RISK_WEIGHTS_CODE=0.4
RISK_WEIGHTS_LOGS=0.35
RISK_WEIGHTS_ACTIVITY=0.25

# Alerts
ALERT_WEBHOOK_URL=
SLACK_WEBHOOK_URL=
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- collectors
```

## 📈 Metrics & KPIs

The system tracks:
- **Prediction Accuracy**: % of correct failure predictions
- **False Positive Rate**: Unnecessary alerts
- **Early Warning Time**: Hours before potential failure
- **Risk Score Distribution**: Across teams/projects

## 🎯 Use Cases

1. **Pre-Release Risk Assessment**
   - Analyze upcoming releases for potential issues
   - Provide go/no-go recommendations

2. **Continuous Monitoring**
   - Real-time risk tracking during development
   - Early warning system for degrading metrics

3. **Team Performance Analysis**
   - Identify bottlenecks and capacity issues
   - Optimize resource allocation

4. **Post-Mortem Analysis**
   - Understand failure patterns
   - Improve prediction models

## 🏆 Why This Wins

- ✅ **Futuristic**: Cutting-edge AI/ML application
- ✅ **Measurable Impact**: Clear ROI through prevented outages
- ✅ **Scalable**: Works for teams of any size
- ✅ **Actionable**: Provides specific recommendations
- ✅ **Real-world Problem**: Addresses critical business need

## 🛠️ Technology Stack

- **Backend**: Node.js, Express
- **ML/AI**: TensorFlow.js, Brain.js, IBM Watson AI
- **Cloud**: IBM Cloud, Watson Natural Language Understanding
- **Data Processing**: Apache Kafka (optional), Bull Queue
- **Storage**: MongoDB, Redis
- **Monitoring**: Prometheus, Grafana, IBM Cloud Monitoring
- **Frontend**: Vanilla JS, Modern CSS, IBM Design Language

## 📚 Documentation

- [AI Dashboard Guide](./AI_DASHBOARD_GUIDE.md) ⭐ **START HERE!**
- [IBM Cloud Setup Guide](./IBM_CLOUD_SETUP.md)
- [API Documentation](./docs/API.md)
- [Quick Start Guide](./START_HERE.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [UI Guide](./UI_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./docs/CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 👥 Team

Built with ❤️ for the IBM Bob Hackathon

## 🔗 Quick Links

### 🎯 Best Demo Experience

**5-Minute Demo Script:**
1. Open `http://localhost:3000/ai-dashboard.html`
2. Watch real-time error monitoring (30 seconds)
3. Click "Simulate Error Spike" to create a spike
4. Click "Analyze with AI" - see instant root cause analysis
5. Show the detailed solutions provided by AI

**Key Message:** "AI analyzes in 2 seconds what takes humans 30-60 minutes!"

### Dashboards
- **AI Root Cause Analyzer**: http://localhost:3000/ai-dashboard.html ⭐ **BEST**
- **IBM Cloud Dashboard**: http://localhost:3000/dashboard.html
- **Original Dashboard**: http://localhost:3000

### Testing
```bash
# Test IBM Cloud integration
node test-ibm-cloud.js

# Test all API endpoints
node integration-test.js
```

### Key Features
1. **Real-Time Error Spikes**: Live chart shows errors as they happen
2. **One-Click AI Analysis**: Instant root cause identification
3. **Actionable Solutions**: AI provides step-by-step fixes
4. **Downtime Simulation**: Test system behavior during outages
5. **No Manual Log Reading**: AI does it all automatically

---

**Note**: This is a hackathon project demonstrating AI-powered organizational risk prediction. For production use, additional security, scalability, and compliance measures should be implemented.
