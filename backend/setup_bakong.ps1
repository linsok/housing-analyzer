# Setup Bakong payment configuration
Write-Host "Setting up Bakong payment configuration..." -ForegroundColor Green

# Create .env file from template
Copy-Item "env_temp.txt" ".env" -Force

Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host ""

# Run script to enable Bakong payments for existing properties
Write-Host "Now running script to enable Bakong payments for existing properties..." -ForegroundColor Yellow
python enable_bakong_payments.py

Write-Host ""
Write-Host "Bakong payment setup completed!" -ForegroundColor Green
Write-Host "Please restart your Django server to load the new environment variables." -ForegroundColor Cyan
Read-Host "Press Enter to exit"
