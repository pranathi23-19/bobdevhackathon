# Testing Guide for AI Organizational Risk Predictor

## Prerequisites Check

Before testing, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm 9+ installed (`npm --version`)
- ✅ Git installed (`git --version`)

## Step 1: Install Dependencies

Due to PowerShell execution policy restrictions, you may need to run commands in Command Prompt (cmd) or adjust your PowerShell policy.

### Option A: Using Command Prompt (Recommended)
```cmd
cd c:\Ibmbobhackathon\Bobdevhackathon
npm install
```

### Option B: Using PowerShell with Bypass
```powershell
cd c:\Ibmbobhackathon\Bobdevhackathon
powershell -ExecutionPolicy Bypass -Command "npm install"
```

### Option C: Set PowerShell Execution Policy (Admin Required)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd c:\Ibmbobhackathon\Bobdevhackathon
npm install
```

## Step 2: Environment Configuration

Create a `.env` file from the example:
```cmd
copy .env.example .env
```

Edit `.env` with your preferred settings (optional for basic testing):
```env
PORT=3000
NODE_ENV=development
LOG_SOURCE=file
GIT_REPO_PATH=./
GIT_BRANCH=main
MODEL_THRESHOLD=0.7
```

## Step 3: Generate Sample Data (Optional)

Generate test data for the ML model:
```cmd
npm run generate-data
```

This creates sample historical data for training and testing.

## Step 4: Start the Application

### Development Mode (with auto-reload):
```cmd
npm run dev
```

### Production Mode:
```cmd
npm start
```

Expected output:
```
[INFO] Starting AI Organizational Risk Predictor...
[INFO] Server running on http://localhost:3000
[INFO] API available at http://localhost:3000/api/v1
[INFO] Environment: development
```

## Step 5: Test API Endpoints

### Using cURL (Command Prompt)

#### 1. Health Check
```cmd
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-01T16:14:00.000Z",
  "uptime": 5.123,
  "version": "1.0.0"
}
```

#### 2. Get Real-time Risk Score
```cmd
curl http://localhost:3000/api/v1/risk/realtime
```

#### 3. Analyze Current Project
```cmd
curl "http://localhost:3000/api/v1/analyze?projectPath=./"
```

#### 4. Get Log Metrics
```cmd
curl http://localhost:3000/api/v1/metrics/logs
```

#### 5. Get Git Metrics
```cmd
curl http://localhost:3000/api/v1/metrics/git
```

#### 6. Get Code Metrics
```cmd
curl "http://localhost:3000/api/v1/metrics/code?projectPath=./"
```

#### 7. Get Statistics
```cmd
curl http://localhost:3000/api/v1/stats
```

#### 8. Analyze a Release (POST)
```cmd
curl -X POST http://localhost:3000/api/v1/analyze/release ^
  -H "Content-Type: application/json" ^
  -d "{\"version\":\"v2.5.0\",\"branch\":\"main\",\"commitCount\":25}"
```

### Using PowerShell (Invoke-WebRequest)

```powershell
# Health Check
Invoke-WebRequest -Uri "http://localhost:3000/health" | Select-Object -Expand Content

# Real-time Risk
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/risk/realtime" | Select-Object -Expand Content

# Analyze Project
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/analyze?projectPath=./" | Select-Object -Expand Content
```

### Using Browser

Open your browser and navigate to:
- http://localhost:3000/health
- http://localhost:3000/api/v1/risk/realtime
- http://localhost:3000/api/v1/stats

## Step 6: Run Automated Tests

### Run all tests:
```cmd
npm test
```

### Run tests with coverage:
```cmd
npm run test:coverage
```

### Run tests in watch mode:
```cmd
npm run test:watch
```

## Step 7: Test Individual Components

### Test Log Collector
Create a test script `test-log-collector.js`:
```javascript
const LogCollector = require('./src/collectors/log-collector');

async function test() {
  const collector = new LogCollector();
  const metrics = await collector.collectMetrics();
  console.log('Log Metrics:', JSON.stringify(metrics, null, 2));
}

test();
```

Run: `node test-log-collector.js`

### Test Git Analyzer
Create a test script `test-git-analyzer.js`:
```javascript
const GitAnalyzer = require('./src/collectors/git-analyzer');

async function test() {
  const analyzer = new GitAnalyzer('./');
  const metrics = await analyzer.analyzeRepository();
  console.log('Git Metrics:', JSON.stringify(metrics, null, 2));
}

test();
```

Run: `node test-git-analyzer.js`

### Test Code Metrics
Create a test script `test-code-metrics.js`:
```javascript
const CodeMetrics = require('./src/collectors/code-metrics');

async function test() {
  const metrics = new CodeMetrics();
  const analysis = await metrics.analyzeProject('./src');
  console.log('Code Metrics:', JSON.stringify(analysis, null, 2));
}

test();
```

Run: `node test-code-metrics.js`

## Step 8: Integration Testing

### Full System Test Script

Create `integration-test.js`:
```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting Integration Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', health.data.status);

    // Test 2: Real-time Risk
    console.log('\n2️⃣ Testing Real-time Risk...');
    const risk = await axios.get(`${BASE_URL}/api/v1/risk/realtime`);
    console.log('✅ Risk Score:', risk.data.data.riskScore);

    // Test 3: Log Metrics
    console.log('\n3️⃣ Testing Log Metrics...');
    const logs = await axios.get(`${BASE_URL}/api/v1/metrics/logs`);
    console.log('✅ Log Metrics collected');

    // Test 4: Git Metrics
    console.log('\n4️⃣ Testing Git Metrics...');
    const git = await axios.get(`${BASE_URL}/api/v1/metrics/git`);
    console.log('✅ Git Metrics collected');

    // Test 5: Code Metrics
    console.log('\n5️⃣ Testing Code Metrics...');
    const code = await axios.get(`${BASE_URL}/api/v1/metrics/code?projectPath=./`);
    console.log('✅ Code Metrics collected');

    // Test 6: Full Analysis
    console.log('\n6️⃣ Testing Full Analysis...');
    const analysis = await axios.get(`${BASE_URL}/api/v1/analyze?projectPath=./`);
    console.log('✅ Analysis complete');
    console.log('   Risk Level:', analysis.data.data.riskLevel);
    console.log('   Failure Probability:', analysis.data.data.failureProbability + '%');

    // Test 7: Release Analysis
    console.log('\n7️⃣ Testing Release Analysis...');
    const release = await axios.post(`${BASE_URL}/api/v1/analyze/release`, {
      version: 'v1.0.0-test',
      branch: 'main',
      commitCount: 10
    });
    console.log('✅ Release analysis complete');

    // Test 8: Statistics
    console.log('\n8️⃣ Testing Statistics...');
    const stats = await axios.get(`${BASE_URL}/api/v1/stats`);
    console.log('✅ Statistics retrieved');

    console.log('\n✅ All tests passed! 🎉');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

runTests();
```

Run: `node integration-test.js`

## Expected Test Results

### Successful Test Output:
```
🧪 Starting Integration Tests...

1️⃣ Testing Health Endpoint...
✅ Health: healthy

2️⃣ Testing Real-time Risk...
✅ Risk Score: 45

3️⃣ Testing Log Metrics...
✅ Log Metrics collected

4️⃣ Testing Git Metrics...
✅ Git Metrics collected

5️⃣ Testing Code Metrics...
✅ Code Metrics collected

6️⃣ Testing Full Analysis...
✅ Analysis complete
   Risk Level: MEDIUM
   Failure Probability: 45%

7️⃣ Testing Release Analysis...
✅ Release analysis complete

8️⃣ Testing Statistics...
✅ Statistics retrieved

✅ All tests passed! 🎉
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution:** Run `npm install` to install dependencies

### Issue: "Port 3000 already in use"
**Solution:** Change PORT in `.env` file or kill the process using port 3000

### Issue: "Git not found"
**Solution:** Install Git or update GIT_REPO_PATH in `.env`

### Issue: PowerShell execution policy
**Solution:** Use Command Prompt or run with `-ExecutionPolicy Bypass`

### Issue: "ENOENT: no such file or directory"
**Solution:** Ensure you're in the correct directory (`Bobdevhackathon`)

## Performance Testing

### Load Testing with Apache Bench (if installed):
```cmd
ab -n 1000 -c 10 http://localhost:3000/health
```

### Stress Testing:
```cmd
ab -n 5000 -c 50 http://localhost:3000/api/v1/risk/realtime
```

## Continuous Testing

For continuous testing during development:
```cmd
npm run test:watch
```

This will re-run tests automatically when files change.

## Test Coverage

Generate and view test coverage report:
```cmd
npm test -- --coverage
```

Coverage report will be in `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser.

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Start the server
4. ✅ Test all endpoints
5. ✅ Run automated tests
6. ✅ Review test coverage
7. ✅ Fix any failing tests
8. ✅ Document any issues found

## Quick Test Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env` file)
- [ ] Server starts successfully (`npm start`)
- [ ] Health endpoint responds
- [ ] All API endpoints return valid responses
- [ ] Automated tests pass (`npm test`)
- [ ] Integration tests pass
- [ ] No console errors
- [ ] Performance is acceptable

---

**Happy Testing! 🚀**