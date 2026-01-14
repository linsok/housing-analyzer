@echo off
echo ========================================
echo Housing & Rent Analyzer
echo Starting Development Servers
echo ========================================
echo.

echo Starting Backend Server...
start cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
