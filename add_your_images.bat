@echo off
echo ========================================
echo Adding Your Uploaded Images
echo ========================================
echo.
echo Make sure you have:
echo 1. Created backend\temp_images\ folder
echo 2. Saved your 4 images as:
echo    - room1.jpg
echo    - room2.jpg
echo    - room3.jpg
echo    - room4.jpg
echo.
pause
echo.

cd backend
python add_uploaded_images.py

echo.
echo ========================================
echo Done! Check the results above.
echo ========================================
echo.
echo Now refresh your frontend to see the images!
echo.
pause
