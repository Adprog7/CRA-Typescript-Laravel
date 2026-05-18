@echo off
REM Script de démarrage - CRA Laravel Full Stack

echo.
echo =====================================
echo CRA-Laravel Development Server Setup
echo =====================================
echo.

REM Check if we're in the right directory
if not exist "back\" (
    echo Error: Please run this script from the project root directory
    echo Expected structure: back/ and front/ folders
    exit /b 1
)

echo Checking backend setup...
cd back

REM Check .env
if not exist ".env" (
    echo ERROR: .env file not found in backend
    echo Creating .env from .env.example...
    copy .env.example .env
)

REM Check node_modules
if not exist "node_modules\" (
    echo Installing backend dependencies...
    call npm install
)

REM Check database
if not exist "database.sqlite" (
    echo Creating SQLite database...
    type nul > database.sqlite
    call php artisan migrate
)

echo.
echo Backend setup complete!
echo.
echo =====================================
echo.
echo Starting development servers...
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:8000/api
echo.
echo Press Ctrl+C to stop all servers.
echo.
echo =====================================
echo.

REM Start the development servers
call npm run dev:all
