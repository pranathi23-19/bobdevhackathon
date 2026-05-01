# Test Summary - AI Organizational Risk Predictor

## Quick Start Testing (Easiest Method)

### For Windows Users:

1. **Open Command Prompt** (not PowerShell to avoid execution policy issues)
2. Navigate to the project:
   ```cmd
   cd c:\Ibmbobhackathon\Bobdevhackathon
   ```
3. Run the quick test script:
   ```cmd
   quick-test.bat
   ```

This will automatically:
- Install dependencies if needed
- Create .env file if needed
- Start the server

4. **In a NEW Command Prompt window**, run the integration tests:
   ```cmd
   cd c:\Ibmbobhackathon\Bobdevhackathon
   node integration-test.js
   ```

---

## Manual Testing Steps

### Step 1: Install Dependencies
```cmd
cd c:\Ibmbobhackathon\Bobdevhackathon
npm install
```

### Step 2: Setup Environment
```cmd
copy .env.example .env
```

### Step 3: Start Server
```cmd
npm start
```

### Step 4: Test Endpoints (in new terminal)
```cmd
node integration-test.js
```

---

## What Gets Tested

### 1. **Health Check** ✅
- Endpoint: `GET /health`
- Verifies: Server is running and responsive
- Expected: Status "healthy" with uptime info

### 2. **Real-time Risk Analysis** 🎯
- Endpoint: `GET /api/v1/risk/realtime`
- Verifies: Risk calculation engine works
- Expected: Risk score (0-100) and risk level (LOW/MEDIUM/HIGH/CRITICAL)

### 3. **Log Metrics Collection** 📊
- Endpoint: `GET /api/v1/metrics/logs`
- Verifies: Log analysis functionality
- Expected: Error counts, warning counts, log patterns

### 4. **Git Activity Analysis** 🔀
- Endpoint: `GET /api/v1/metrics/git`
- Verifies: Git repository analysis
- Expected: Commit counts, contributor stats, change velocity

### 5. **Code Quality Metrics** 💻
- Endpoint: `GET /api/v1/metrics/code`
- Verifies: Code complexity analysis
- Expected: File counts, complexity scores, test coverage

### 6. **Comprehensive Risk Analysis** 🔍
- Endpoint: `GET /api/v1/analyze`
- Verifies: Full system analysis combining all metrics
- Expected: Complete risk assessment with factors and recommendations

### 7. **Release Risk Assessment** 🚀
- Endpoint: `POST /api/v1/analyze/release`
- Verifies: Release-specific risk prediction
- Expected: Go/no-go recommendation for releases

### 8. **System Statistics** 📈
- Endpoint: `GET /api/v1/stats`
- Verifies: Analytics and tracking
- Expected: Usage statistics and performance metrics

### 9. **Error Handling** ⚠️
- Endpoint: Invalid routes
- Verifies: Proper 404 and error responses
- Expected: Graceful error messages

---

## Expected Test Results

### ✅ Success Output:
```
🧪 Starting Integration Tests...

1️⃣ Testing Health Endpoint...
✅ Health: healthy
   Uptime: 5.23 seconds

2️⃣ Testing Real-time Risk...
✅ Risk Score: 45
   Risk Level: MEDIUM

3️⃣ Testing Log Metrics...
✅ Log Metrics collected
   Total Logs: 150

4️⃣ Testing Git Metrics...
✅ Git Metrics collected
   Total Commits: 25

5️⃣ Testing Code Metrics...
✅ Code Metrics collected
   Files Analyzed: 12

6️⃣ Testing Full Analysis...
✅ Analysis complete
   Risk Level: MEDIUM
   Failure Probability: 45%
   Top Risk Factor: Code Quality

7️⃣ Testing Release Analysis...
✅ Release analysis complete
   Release: v1.0.0-test
   Risk Level: LOW

8️⃣ Testing Statistics...
✅ Statistics retrieved
   Total Analyses: 3

9️⃣ Testing 404 Handler...
✅ 404 handler working correctly

==================================================
✅ All tests passed! 🎉
==================================================
```

---

## Testing Checklist

Use this checklist to verify your testing:

- [ ] **Dependencies Installed**: `node_modules` folder exists
- [ ] **Environment Configured**: `.env` file created
- [ ] **Server Starts**: No errors on `npm start`
- [ ] **Health Endpoint**: Returns 200 OK
- [ ] **API Endpoints**: All return valid JSON
- [ ] **Risk Calculation**: Returns risk scores 0-100
- [ ] **Git Analysis**: Analyzes repository successfully
- [ ] **Code Metrics**: Scans project files
- [ ] **Error Handling**: 404s handled gracefully
- [ ] **Integration Tests**: All 9 tests pass

---

## Troubleshooting Guide

### Problem: "npm is not recognized"
**Solution**: Install Node.js from https://nodejs.org/

### Problem: "Cannot find module"
**Solution**: Run `npm install` in the project directory

### Problem: "Port 3000 already in use"
**Solution**: 
1. Edit `.env` and change `PORT=3000` to `PORT=3001`
2. Or kill the process using port 3000

### Problem: "ECONNREFUSED" in integration tests
**Solution**: Make sure the server is running (`npm start`) before running tests

### Problem: PowerShell execution policy error
**Solution**: Use Command Prompt (cmd) instead of PowerShell

### Problem: "Git not found"
**Solution**: Install Git from https://git-scm.com/

---

## Advanced Testing

### Run Unit Tests (if available):
```cmd
npm test
```

### Run with Coverage:
```cmd
npm test -- --coverage
```

### Generate Sample Data:
```cmd
npm run generate-data
```

### Lint Code:
```cmd
npm run lint
```

---

## Performance Benchmarks

Expected performance metrics:
- **Health Check**: < 10ms response time
- **Risk Analysis**: < 500ms for small projects
- **Git Analysis**: < 2s for repositories with < 1000 commits
- **Code Metrics**: < 1s per 100 files

---

## API Testing with Postman

Import this collection to test with Postman:

1. Create new collection: "AI Risk Predictor"
2. Add requests:
   - GET `http://localhost:3000/health`
   - GET `http://localhost:3000/api/v1/risk/realtime`
   - GET `http://localhost:3000/api/v1/analyze?projectPath=./`
   - POST `http://localhost:3000/api/v1/analyze/release`
     ```json
     {
       "version": "v2.0.0",
       "branch": "main",
       "commitCount": 50
     }
     ```

---

## Browser Testing

Open these URLs in your browser:
1. http://localhost:3000/health
2. http://localhost:3000/api/v1/risk/realtime
3. http://localhost:3000/api/v1/stats

---

## Continuous Integration

For CI/CD pipelines, use:
```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm install
  
- name: Run tests
  run: npm test
  
- name: Start server
  run: npm start &
  
- name: Run integration tests
  run: node integration-test.js
```

---

## Test Coverage Goals

Target coverage metrics:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

---

## Next Steps After Testing

1. ✅ Review test results
2. ✅ Fix any failing tests
3. ✅ Check code coverage
4. ✅ Document any bugs found
5. ✅ Optimize slow endpoints
6. ✅ Add more test cases
7. ✅ Set up CI/CD pipeline
8. ✅ Deploy to staging environment

---

## Support

For issues or questions:
1. Check the [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed instructions
2. Review the [API.md](./docs/API.md) for endpoint documentation
3. Check the [README.md](./README.md) for project overview

---

**Last Updated**: 2026-05-01
**Version**: 1.0.0