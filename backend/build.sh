#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Ensure media directories exist and are properly set up
echo "Setting up media directories..."
python deploy_media.py

echo "Build process completed successfully!"
