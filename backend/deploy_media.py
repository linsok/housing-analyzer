#!/usr/bin/env python
"""
Script to ensure media files are available for Railway deployment
"""
import os
import shutil
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

def ensure_media_deployed():
    """Ensure media files are in the correct location for Railway deployment"""
    
    media_root = settings.MEDIA_ROOT
    print(f"Media root: {media_root}")
    
    # Check if media directory exists
    if not os.path.exists(media_root):
        print("Creating media directory...")
        os.makedirs(media_root, exist_ok=True)
    
    # Ensure subdirectories exist
    subdirs = ['properties', 'profiles', 'documents', 'payments', 'transactions']
    for subdir in subdirs:
        subdir_path = os.path.join(media_root, subdir)
        os.makedirs(subdir_path, exist_ok=True)
        print(f"Ensured directory exists: {subdir_path}")
    
    # Count files in each directory
    for subdir in subdirs:
        subdir_path = os.path.join(media_root, subdir)
        if os.path.exists(subdir_path):
            files = [f for f in os.listdir(subdir_path) if os.path.isfile(os.path.join(subdir_path, f))]
            print(f"{subdir}: {len(files)} files")
            for file in files[:3]:  # Show first 3 files
                print(f"  - {file}")
            if len(files) > 3:
                print(f"  ... and {len(files) - 3} more files")
    
    print("\nMedia files are ready for deployment!")
    return True

if __name__ == "__main__":
    ensure_media_deployed()
