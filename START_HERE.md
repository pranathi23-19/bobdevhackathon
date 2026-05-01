# 🚀 START HERE - Quick Setup Guide

## ⚠️ IMPORTANT: PowerShell Execution Policy Issue

You're seeing this error because PowerShell blocks script execution by default. **Use Command Prompt instead!**

---

## ✅ SOLUTION: Use Command Prompt (cmd)

### Step 1: Open Command Prompt

1. Press `Windows Key + R`
2. Type `cmd`
3. Press Enter

### Step 2: Navigate to Project

```cmd
cd c:\Ibmbobhackathon\Bobdevhackathon
```

### Step 3: Install Dependencies

```cmd
npm install
```

This will work in Command Prompt without any issues!

---

## 🎯 Complete Setup & Testing

### Option A: Automated Setup (Easiest)

In **Command Prompt**:

```cmd
cd c:\Ibmbobhackathon\Bobdevhackathon
quick-test.bat
```

This will:
- ✅ Install dependencies automatically
- ✅ Create .env file
- ✅ Start the server

### Option B: Manual Setup

#### 1. Install Dependencies
```cmd
cd c:\Ibmbobhackathon\Bobdevhackathon
npm install
```

#### 2. Create Environment File
```cmd
copy .env.example .env
```

#### 3. Start the Server
```cmd
npm start
```

---

## 🖥️ Accessing the UI Dashboard

Once the server is running, you'll see:
```
[INFO] Server running on http://localhost:3000
[INFO] API available at http://localhost:3000/api/v1
```

### Open the Dashboard

**Open your web browser** and go to:
```
http://localhost:3000
```

You'll see a beautiful dashboard with:
- 🎯 Real-time risk score
- 📊 Key metrics
- ⚠️ Risk factors
- 💡 Recommendations
- 🔧 Fragile modules

### Using the Dashboard

1. Click **"Run Risk Analysis"** button
2. Wait 2-5 seconds for analysis
3. Review the results:
   - Risk score (0-100%)
   - Risk level (LOW/MEDIUM/HIGH/CRITICAL)
   - Detailed factors and recommendations

---

## 🧪 Testing the Application

### Test the API (in a NEW Command Prompt)

```cmd
cd c:\Ibmbobhackathon\Bobdevhackathon
node integration-test.js
```

This will test all 9 API endpoints and show results.

### Test Individual Endpoints

Open these URLs in your browser:
- http://localhost:3000/health
- http://localhost:3000/api/v1/risk/realtime
- http://localhost:3000/api/v1/stats

---

## 🎨 What You'll See

### Dashboard Features

1. **Risk Assessment Card**
   - Large risk score percentage
   - Color-coded risk level
   - Summary message

2. **Key Metrics**
   - Critical issues count
   - High risk modules
   - Action required indicator

3. **Risk Factors**
   - Top 5 risk factors
   - Impact percentages
   - Detailed reasons

4. **Recommendations**
   - Prioritized action items
   - Specific steps to reduce risk

5. **Fragile Modules**
   - Most vulnerable code files
   - Risk scores per module

### Color Coding

- 🟢 **GREEN (0-30%)**: LOW RISK - Safe to proceed
- 🔵 **BLUE (31-50%)**: LOW-MEDIUM - Monitor closely
- 🟡 **YELLOW (51-70%)**: MEDIUM-HIGH - Take precautions
- 🔴 **RED (71-100%)**: HIGH/CRITICAL - Immediate action

---

## 🔧 Troubleshooting

### Problem: "npm is not recognized"
**Solution**: Install Node.js from https://nodejs.org/

### Problem: "Port 3000 already in use"
**Solution**: 
```cmd
# Edit .env file and change PORT=3000 to PORT=3001
# Then restart the server
```

### Problem: Dashboard shows "Failed to connect to API"
**Solution**: Make sure the server is running (`npm start`)

### Problem: Still getting PowerShell errors
**Solution**: 
1. Close PowerShell
2. Open Command Prompt (cmd) instead
3. Run commands there

---

## 📁 Project Structure

```
Bobdevhackathon/
├── public/
│   └── index.html          ← UI Dashboard (open in browser)
├── src/
│   ├── index.js            ← Main server file
│   ├── collectors/         ← Data collection modules
│   ├── ml/                 ← Machine learning models
│   └── services/           ← Business logic
├── quick-test.bat          ← Automated setup script
├── integration-test.js     ← API testing script
├── START_HERE.md          ← This file
├── UI_GUIDE.md            ← Detailed UI documentation
├── TESTING_GUIDE.md       ← Complete testing guide
└── TEST_SUMMARY.md        ← Quick test reference
```

---

## 🎯 Quick Commands Cheat Sheet

### In Command Prompt (cmd):

```cmd
# Navigate to project
cd c:\Ibmbobhackathon\Bobdevhackathon

# Install dependencies
npm install

# Start server
npm start

# Run tests (in new cmd window)
node integration-test.js

# Generate sample data
npm run generate-data
```

### In Browser:

```
# Main Dashboard
http://localhost:3000

# Health Check
http://localhost:3000/health

# Real-time Risk
http://localhost:3000/api/v1/risk/realtime

# Statistics
http://localhost:3000/api/v1/stats
```

---

## 📚 Documentation Files

- **[START_HERE.md](./START_HERE.md)** ← You are here
- **[UI_GUIDE.md](./UI_GUIDE.md)** - Detailed dashboard guide
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Complete testing instructions
- **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - Quick test reference
- **[README.md](./README.md)** - Project overview
- **[API.md](./docs/API.md)** - API documentation

---

## ✅ Success Checklist

- [ ] Opened Command Prompt (not PowerShell)
- [ ] Navigated to project directory
- [ ] Ran `npm install` successfully
- [ ] Created `.env` file
- [ ] Started server with `npm start`
- [ ] Opened http://localhost:3000 in browser
- [ ] Clicked "Run Risk Analysis" button
- [ ] Saw risk score and recommendations
- [ ] Ran `node integration-test.js` successfully

---

## 🎉 You're All Set!

Once you complete the steps above, you'll have:
- ✅ A running server on port 3000
- ✅ A beautiful web dashboard
- ✅ Real-time risk analysis
- ✅ API endpoints for integration
- ✅ Automated testing

**Next Steps:**
1. Explore the dashboard
2. Run risk analysis
3. Review recommendations
4. Check the other documentation files

---

## 💡 Pro Tips

1. **Keep Command Prompt open** - Don't close it while the server is running
2. **Use a second Command Prompt** - For running tests while server is running
3. **Bookmark the dashboard** - http://localhost:3000
4. **Check logs** - Server logs appear in the Command Prompt window
5. **Auto-refresh** - Dashboard updates every 5 minutes automatically

---

## 🆘 Need Help?

If you encounter issues:
1. Check this file first
2. Review [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. Check [UI_GUIDE.md](./UI_GUIDE.md)
4. Look at server logs in Command Prompt

---

**Happy Testing! 🚀**

Made with ❤️ for IBM Bob Hackathon