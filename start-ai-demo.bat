@echo off
cls
echo ========================================
echo   AI ROOT CAUSE ANALYZER - DEMO
echo ========================================
echo.
echo Starting the most impressive demo...
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
)

echo ========================================
echo   DEMO READY!
echo ========================================
echo.
echo Opening AI Root Cause Analyzer...
echo.
echo WHAT YOU'LL SEE:
echo   - Real-time error monitoring chart
echo   - Automatic error spike detection
echo   - One-click AI analysis button
echo   - Instant root cause identification
echo   - Actionable solutions from Watson AI
echo.
echo DEMO STEPS:
echo   1. Watch the live error chart (30 sec)
echo   2. Click "Simulate Error Spike"
echo   3. Click "Analyze with AI"
echo   4. See instant root cause analysis!
echo.
echo KEY MESSAGE:
echo   "AI analyzes in 2 seconds what takes
echo    humans 30-60 minutes of manual log reading!"
echo.
echo ========================================
echo.
echo Server starting on http://localhost:3000
echo Dashboard: http://localhost:3000/ai-dashboard.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

timeout /t 2 /nobreak >nul
start http://localhost:3000/ai-dashboard.html

call npm start

@REM Made with Bob
