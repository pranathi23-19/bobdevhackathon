const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting Integration Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', health.data.status);
    console.log('   Uptime:', health.data.uptime.toFixed(2), 'seconds');

    // Test 2: Real-time Risk
    console.log('\n2️⃣ Testing Real-time Risk...');
    const risk = await axios.get(`${BASE_URL}/api/v1/risk/realtime`);
    console.log('✅ Risk Score:', risk.data.data.riskScore);
    console.log('   Risk Level:', risk.data.data.riskLevel);

    // Test 3: Log Metrics
    console.log('\n3️⃣ Testing Log Metrics...');
    const logs = await axios.get(`${BASE_URL}/api/v1/metrics/logs`);
    console.log('✅ Log Metrics collected');
    console.log('   Total Logs:', logs.data.data.totalLogs || 0);

    // Test 4: Git Metrics
    console.log('\n4️⃣ Testing Git Metrics...');
    const git = await axios.get(`${BASE_URL}/api/v1/metrics/git`);
    console.log('✅ Git Metrics collected');
    console.log('   Total Commits:', git.data.data.totalCommits || 0);

    // Test 5: Code Metrics
    console.log('\n5️⃣ Testing Code Metrics...');
    const code = await axios.get(`${BASE_URL}/api/v1/metrics/code?projectPath=./`);
    console.log('✅ Code Metrics collected');
    console.log('   Files Analyzed:', code.data.data.totalFiles || 0);

    // Test 6: Full Analysis
    console.log('\n6️⃣ Testing Full Analysis...');
    const analysis = await axios.get(`${BASE_URL}/api/v1/analyze?projectPath=./`);
    console.log('✅ Analysis complete');
    console.log('   Risk Level:', analysis.data.data.riskLevel);
    console.log('   Failure Probability:', analysis.data.data.failureProbability + '%');
    if (analysis.data.data.factors && analysis.data.data.factors.length > 0) {
      console.log('   Top Risk Factor:', analysis.data.data.factors[0].category);
    }

    // Test 7: Release Analysis
    console.log('\n7️⃣ Testing Release Analysis...');
    const release = await axios.post(`${BASE_URL}/api/v1/analyze/release`, {
      version: 'v1.0.0-test',
      branch: 'main',
      commitCount: 10
    });
    console.log('✅ Release analysis complete');
    console.log('   Release:', release.data.data.release);
    console.log('   Risk Level:', release.data.data.riskLevel);

    // Test 8: Statistics
    console.log('\n8️⃣ Testing Statistics...');
    const stats = await axios.get(`${BASE_URL}/api/v1/stats`);
    console.log('✅ Statistics retrieved');
    console.log('   Total Analyses:', stats.data.data.totalAnalyses || 0);

    // Test 9: Invalid Endpoint (404)
    console.log('\n9️⃣ Testing 404 Handler...');
    try {
      await axios.get(`${BASE_URL}/api/v1/invalid-endpoint`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ 404 handler working correctly');
      } else {
        throw error;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed! 🎉');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ Test failed:', error.message);
    console.error('='.repeat(50));
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Make sure the server is running on port 3000');
      console.error('   Run: npm start');
    }
    process.exit(1);
  }
}

// Run tests
console.log('AI Organizational Risk Predictor - Integration Tests');
console.log('='.repeat(50));
console.log('Target:', BASE_URL);
console.log('='.repeat(50) + '\n');

runTests();

// Made with Bob
