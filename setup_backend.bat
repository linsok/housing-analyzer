@echo off
echo ========================================
echo Backend Setup Script
echo ========================================
echo.

cd backend

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Running database migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo ========================================
echo Setup Complete!
echo.
echo Next steps:
echo 1. Run: populate_mock_data.bat (to add test data)
echo 2. Run: start.bat (to start servers)
echo ========================================
echo.
pause
