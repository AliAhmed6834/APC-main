@echo off
echo ========================================
echo Airport Parking Supplier System Setup
echo ========================================
echo.

echo Checking if PostgreSQL is installed...
pg_config --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.

echo Creating database...
psql -U postgres -c "CREATE DATABASE airport_parking_supplier;" 2>nul
if %errorlevel% neq 0 (
    echo Database might already exist, continuing...
)

echo.
echo Setting up database tables...
npm run db:setup

echo.
echo Starting the application...
npm run dev

pause 