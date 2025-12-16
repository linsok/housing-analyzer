@echo off
echo ========================================
echo Populating Database with Mock Data
echo ========================================
echo.

cd backend
call venv\Scripts\activate
python manage.py populate_data

echo.
echo ========================================
echo Done! You can now login with:
echo.
echo Admin: admin@myrentor.com / admin123
echo Owner: owner1@myrentor.com / owner123
echo Renter: renter1@myrentor.com / renter123
echo ========================================
echo.
pause
