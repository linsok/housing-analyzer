"""
Script to add uploaded images to properties
Place your 4 images in backend/temp_images/ folder named:
- room1.jpg
- room2.jpg
- room3.jpg
- room4.jpg

Then run: python add_uploaded_images.py
"""

import os
import sys
import django
from django.core.files import File
from pathlib import Path

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import Property, PropertyImage

def add_images_from_folder():
    """Add images from temp_images folder to properties"""
    
    # Define image folder
    temp_images_dir = Path(__file__).parent / 'temp_images'
    
    if not temp_images_dir.exists():
        print("❌ Error: temp_images folder not found!")
        print(f"   Please create: {temp_images_dir}")
        print("   And place your 4 images there named: room1.jpg, room2.jpg, room3.jpg, room4.jpg")
        return
    
    # Image files to look for
    image_files = ['room1.jpg', 'room2.jpg', 'room3.jpg', 'room4.jpg']
    
    # Check if images exist
    available_images = []
    for img_file in image_files:
        img_path = temp_images_dir / img_file
        if img_path.exists():
            available_images.append(img_path)
        else:
            print(f"⚠️  Warning: {img_file} not found in temp_images folder")
    
    if not available_images:
        print("❌ No images found in temp_images folder!")
        return
    
    print(f"✅ Found {len(available_images)} images\n")
    
    # Get properties
    properties = Property.objects.all()
    
    if not properties.exists():
        print("❌ No properties found. Please create properties first.")
        print("   Run: python manage.py populate_data")
        return
    
    print(f"Found {properties.count()} properties\n")
    print("="*60)
    
    success_count = 0
    skip_count = 0
    
    for idx, property_obj in enumerate(properties):
        print(f"\n[{idx + 1}/{properties.count()}] {property_obj.title}")
        
        # Check if property already has images
        if property_obj.images.exists():
            print(f"  ⏭️  Already has {property_obj.images.count()} image(s). Skipping...")
            skip_count += 1
            continue
        
        # Select image (rotate through available images)
        image_path = available_images[idx % len(available_images)]
        print(f"  📷 Using: {image_path.name}")
        
        try:
            # Create PropertyImage
            property_image = PropertyImage(
                property=property_obj,
                caption=f"Image for {property_obj.title}",
                is_primary=True,
                order=0
            )
            
            # Open and save image
            with open(image_path, 'rb') as img_file:
                property_image.image.save(
                    f"property_{property_obj.id}_image_1.jpg",
                    File(img_file),
                    save=True
                )
            
            print(f"  ✅ Image added successfully")
            success_count += 1
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print("\n" + "="*60)
    print(f"Complete!")
    print(f"  ✅ Success: {success_count}")
    print(f"  ⏭️  Skipped: {skip_count}")
    print("="*60)

if __name__ == '__main__':
    print("="*60)
    print("Adding Uploaded Images to Properties")
    print("="*60)
    print()
    add_images_from_folder()
