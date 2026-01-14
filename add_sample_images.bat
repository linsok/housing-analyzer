@echo off
echo ========================================
echo Adding Sample Images to Properties
echo ========================================
echo.
echo This will create colored placeholder images
echo for all properties that don't have images yet.
echo.

cd backend

echo Installing Pillow (image library)...
pip install Pillow
echo.

echo Creating and adding images...
python add_sample_images.py

echo.
echo ========================================
echo Done! Check the results above.
echo ========================================
echo.
echo Now refresh your frontend to see the images!
echo.
pause
