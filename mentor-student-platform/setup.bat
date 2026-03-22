@echo off
REM 🚀 Mentor-Student Platform - Complete Setup Script
REM This script sets up and starts both backend and frontend servers

echo.
echo ========================================
echo  Mentor-Student Collaboration Platform
echo  Complete Setup & Launch Script
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Navigate to backend
echo ========================================
echo Installing Backend Dependencies...
echo ========================================
cd backend
if exist node_modules (
    echo ✅ Backend dependencies already installed
) else (
    echo Installing npm packages for backend...
    call npm install
    if errorlevel 1 (
        echo ❌ Backend installation failed!
        pause
        exit /b 1
    )
)
echo ✅ Backend dependencies ready!
echo.

REM Navigate to frontend
echo ========================================
echo Installing Frontend Dependencies...
echo ========================================
cd ..\frontend
if exist node_modules (
    echo ✅ Frontend dependencies already installed
) else (
    echo Installing npm packages for frontend...
    call npm install
    if errorlevel 1 (
        echo ❌ Frontend installation failed!
        pause
        exit /b 1
    )
)
echo ✅ Frontend dependencies ready!
echo.

echo ========================================
echo ✨ Setup Complete!
echo ========================================
echo.
echo To start the servers, open TWO separate terminals:
echo.
echo Terminal 1 (Backend - Port 3001):
echo   cd backend
echo   npm start
echo.
echo Terminal 2 (Frontend - Port 5173):
echo   cd frontend
echo   npm run dev
echo.
echo Then open your browser to: http://localhost:5173
echo.
pause
