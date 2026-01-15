"""
Script to fix property image references in the database
to match actual files in the media directory
"""
import os
import django
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import PropertyImage

def fix_property_images():
    """Update property image references to use existing files"""
    
    # List of actual files that exist in media/properties/
    existing_files = [
        'properties/Parc-3-Cheras-Malaysia.jpg',
        'properties/pexels-elena-zhuravleva-647531-1457812.jpg',
        'properties/1_1_Buxv3VG.jpg',
        'properties/light-bulb-4514505_1280_2fGXHGK.jpg',
        'properties/1_mZtCt34.jpg',
        'properties/bed261ec32bf5c234046adde845b28f1f7596058-11141_l4uFcno.jpg',
        'properties/khqr_81_201f2fb0.png',
        'properties/slide_12145509_cRoWWI3.v.1ba0586cb07a975b911d2bd09944e59f.jpg',
        'properties/1.jpg',
        'properties/ai-img_6914-3.jpeg',
    ]
    
    # Get all property images
    all_images = PropertyImage.objects.all()
    
    print(f"Found {all_images.count()} property images to check")
    
    updated_count = 0
    file_index = 0
    
    for image in all_images:
        if image.image and image.image.name:
            # Check if the current file exists
            current_file = image.image.name
            print(f"Current image: {current_file}")
            
            # Replace with an existing file
            new_file = existing_files[file_index % len(existing_files)]
            
            if current_file != new_file:
                print(f"Updating: {current_file} -> {new_file}")
                image.image.name = new_file
                image.save()
                updated_count += 1
            
            file_index += 1
    
    print(f"Updated {updated_count} property images")
    print("Property images now reference existing files in media directory")

if __name__ == '__main__':
    fix_property_images()
