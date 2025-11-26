@echo off
REM Field Technician App - Stop Script (Windows)
REM This script stops both backend and frontend servers

echo 🛑 Stopping Field Tech App...
echo =============================

REM Stop Node.js processes
echo 🛑 Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo    ✅ Node.js processes stopped
) else (
    echo    ℹ️  No Node.js processes were running
)

REM Stop any remaining processes on ports 3000 and 5001
echo 🧹 Freeing up ports...

REM Kill processes on port 5001 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do (
    taskkill /f /pid %%a 2>nul
)

REM Kill processes on port 3000 (frontend)  
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /f /pid %%a 2>nul
)

REM Clean up log files if they exist
if exist logs (
    if exist logs\backend.pid del logs\backend.pid
    if exist logs\frontend.pid del logs\frontend.pid
)

echo.
echo 🎉 Field Tech App Stopped Successfully!
echo ======================================
echo.
echo 📊 All servers and processes stopped
echo 🔓 Ports 3000 and 5001 are now available
echo.
echo 🚀 To start again: start.bat
echo 🗄️  To reset database: reset-database.bat
echo.
pause