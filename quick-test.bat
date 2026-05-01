@echo off
echo ========================================
echo AI Organizational Risk Predictor
echo Quick Test Script
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/4] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
) else (
    echo [1/4] Dependencies already installed
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo [2/4] Creating .env file...
    copy .env.example .env
    echo .env file created from .env.example
    echo.
) else (
    echo [2/4] .env file already exists
    echo.
)

echo [3/4] Starting the server...
echo.
echo The server will start on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo After the server starts, open a new terminal and run:
echo   node integration-test.js
echo.
echo ========================================
echo.

REM Start the server
call npm start

@REM Made with Bob
