@echo off
REM Field Technician App - Database Reset Script (Windows)
REM This script resets the database to fresh state with sample data

echo 🗄️  Resetting Field Tech App Database...
echo =========================================

REM Change to backend directory
cd backend

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ Error: Not in the correct directory. Please run this from the techapp root.
    pause
    exit /b 1
)

REM Stop any running backend processes
echo 🛑 Stopping any running backend processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

REM Remove existing database
echo 🗑️  Removing existing database...
if exist database\fieldtech.db (
    del database\fieldtech.db
    echo    ✅ Old database removed
) else (
    echo    ℹ️  No existing database found
)

REM Remove uploaded files
echo 📁 Cleaning upload directory...
if exist uploads (
    del /q uploads\* 2>nul
    echo    ✅ Upload directory cleaned
) else (
    echo    ℹ️  No uploads directory found
)

REM Run migrations to create fresh database
echo 🏗️  Creating fresh database schema...
call npm run db:migrate
if %errorlevel% neq 0 (
    echo    ❌ Error running migrations
    pause
    exit /b 1
)
echo    ✅ Database migrations completed

REM Seed with fresh sample data
echo 🌱 Seeding database with sample data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo    ❌ Error seeding database
    pause
    exit /b 1
)
echo    ✅ Database seeding completed

echo.
echo 🎉 Database reset completed successfully!
echo =========================================
echo.
echo 📋 Sample Data Available:
echo    • 2 Technicians with login credentials
echo    • 4 Sample tickets (various statuses)
echo    • 1 Sample work log entry
echo.
echo 🔐 Test Login Credentials:
echo    Username: john.tech    ^| Password: password123
echo    Username: sarah.field  ^| Password: password123
echo.
echo 🚀 Ready to test! Start your servers:
echo    Backend:  cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm start
echo.
pause