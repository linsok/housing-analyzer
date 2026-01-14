@echo off
echo Setting up Bakong payment configuration...

REM Create .env file from template
copy env_temp.txt .env

echo .env file created successfully!
echo.
echo Now running script to enable Bakong payments for existing properties...
python enable_bakong_payments.py

echo.
echo Bakong payment setup completed!
echo Please restart your Django server to load the new environment variables.
pause
