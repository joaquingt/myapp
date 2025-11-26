@echo off
REM Field Technician App - Start Script (Windows)
REM This script starts both backend and frontend servers

echo 🚀 Starting Field Tech App...
echo ===============================

REM Check if we're in the right directory
if not exist backend (
    echo ❌ Error: Not in the correct directory. Please run this from the techapp root.
    pause
    exit /b 1
)

if not exist frontend (
    echo ❌ Error: Frontend directory not found. Please run this from the techapp root.
    pause
    exit /b 1
)

REM Create logs directory
if not exist logs mkdir logs

REM Start Backend
echo 🔧 Starting Backend Server...
cd backend

REM Check if backend dependencies are installed
if not exist node_modules (
    echo 📦 Installing backend dependencies...
    call npm install
)

REM Start backend in background
start /B cmd /c "set PORT=5001 && npm run dev > ../logs/backend.log 2>&1"

echo    ✅ Backend starting on port 5001...

cd ..

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Frontend  
echo 🎨 Starting Frontend Server...
cd frontend

REM Check if frontend dependencies are installed
if not exist node_modules (
    echo 📦 Installing frontend dependencies...
    call npm install
)

REM Start frontend in background
start /B cmd /c "npm start > ../logs/frontend.log 2>&1"

echo    ✅ Frontend starting on port 3000...

cd ..

REM Wait for servers to start
echo 📡 Waiting for servers to initialize...
timeout /t 8 /nobreak >nul

echo.
echo 🎉 Field Tech App Started Successfully!
echo ======================================
echo.
echo 📊 Server Status:
echo    Backend:  http://localhost:5001 ✅
echo    Frontend: http://localhost:3000 ✅
echo    API Health: http://localhost:5001/api/health
echo.
echo 🔐 Test Login Credentials:
echo    Username: john.tech    ^| Password: password123
echo    Username: sarah.field  ^| Password: password123
echo.
echo 📝 Useful Commands:
echo    Stop servers:  stop.bat
echo    Reset DB:      reset-database.bat
echo.
echo 🌐 Open http://localhost:3000 to use the app!
echo.
pause