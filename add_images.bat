@echo off
echo ========================================
echo Adding Property Images
echo ========================================
echo.

cd backend

echo Installing required package (requests)...
pip install requests
echo.

echo Running image addition script...
python manage.py add_property_images

echo.
echo ========================================
echo Done!
echo ========================================
pause
