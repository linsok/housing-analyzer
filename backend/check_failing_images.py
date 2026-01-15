#!/usr/bin/env python
"""
Check the specific failing images from frontend logs
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from django.conf import settings
from properties.models import PropertyImage

def check_failing_images():
    """Check the specific images that are failing to load"""
    print("=== Checking Failing Images ===")
    
    failing_images = [
        'properties/1200px-Imperial_Hotel_Osaka_regular_floor_standard_twin_room_20120630-001_1Pwbmsj.jpg',
        'properties/dizajn-spalni-ploshchadyu-9-11-kv-m-42_YbTHdwX.jpg'
    ]
    
    for img_path in failing_images:
        full_path = os.path.join(settings.MEDIA_ROOT, img_path)
        exists = os.path.exists(full_path)
        print(f"Image: {img_path}")
        print(f"  Full path: {full_path}")
        print(f"  Exists: {'YES' if exists else 'NO'}")
        if exists:
            size = os.path.getsize(full_path)
            print(f"  Size: {size} bytes")
        else:
            print("  Status: FILE MISSING!")
        print()

def check_database_images():
    """Check what images are actually in the database"""
    print("=== Database Images Check ===")
    
    images = PropertyImage.objects.all()
    print(f"Total images in database: {images.count()}")
    
    for img in images[:10]:  # Show first 10
        if img.image:
            full_path = os.path.join(settings.MEDIA_ROOT, img.image.name)
            exists = os.path.exists(full_path)
            print(f"ID {img.id}: {img.image.name}")
            print(f"  Exists: {'YES' if exists else 'NO'}")
            if not exists:
                print("  *** MISSING FILE ***")
        print()

def find_similar_images():
    """Find images with similar names"""
    print("=== Finding Similar Images ===")
    
    if os.path.exists(settings.MEDIA_ROOT):
        properties_dir = os.path.join(settings.MEDIA_ROOT, 'properties')
        if os.path.exists(properties_dir):
            files = os.listdir(properties_dir)
            
            # Look for files with similar patterns
            imperial_files = [f for f in files if 'Imperial' in f]
            dizajn_files = [f for f in files if 'dizajn' in f]
            
            print(f"Files with 'Imperial' in name: {len(imperial_files)}")
            for f in imperial_files:
                print(f"  - {f}")
            
            print(f"Files with 'dizajn' in name: {len(dizajn_files)}")
            for f in dizajn_files:
                print(f"  - {f}")

if __name__ == "__main__":
    check_failing_images()
    check_database_images()
    find_similar_images()
