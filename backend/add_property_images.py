"""
Script to add images to properties from URLs
Run this from the backend directory: python add_property_images.py
"""

import os
import sys
import django
import requests
from io import BytesIO
from django.core.files.base import ContentFile

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import Property, PropertyImage

# Image URLs
IMAGE_URLS = [
    'https://www.vanorohotel.com/wp-content/uploads/2021/07/drz-vanoro_6737.jpg',
    'https://www.vanorohotel.com/wp-content/uploads/2021/07/drz-vanoro_6664.jpg',
    'https://www.jaypeehotels.com/blog/wp-content/uploads/2024/09/Blog-6-scaled.jpg',
    'https://www.wivenhoehouse.co.uk/wp-content/uploads/2020/11/Wivenhoe-House-Hotel-Feb-2023-emma-Cabielles-123-1367x912.jpg',
]

def download_image(url):
    """Download image from URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return BytesIO(response.content)
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None

def add_images_to_properties():
    """Add images to properties"""
    properties = Property.objects.all()
    
    if not properties.exists():
        print("No properties found. Please create properties first.")
        return
    
    print(f"Found {properties.count()} properties")
    
    for idx, property_obj in enumerate(properties):
        # Use images in rotation
        image_url = IMAGE_URLS[idx % len(IMAGE_URLS)]
        
        print(f"\nAdding image to: {property_obj.title}")
        print(f"Image URL: {image_url}")
        
        # Check if property already has images
        existing_images = property_obj.images.count()
        
        # Download image
        image_data = download_image(image_url)
        
        if image_data:
            # Create filename
            filename = f"property_{property_obj.id}_image_{existing_images + 1}.jpg"
            
            # Create PropertyImage
            property_image = PropertyImage(
                property=property_obj,
                caption=f"Image for {property_obj.title}",
                is_primary=(existing_images == 0),  # First image is primary
                order=existing_images
            )
            
            # Save image file
            property_image.image.save(filename, ContentFile(image_data.read()), save=True)
            
            print(f"✓ Successfully added image to {property_obj.title}")
        else:
            print(f"✗ Failed to add image to {property_obj.title}")
    
    print("\n" + "="*50)
    print("Image addition complete!")
    print("="*50)

if __name__ == '__main__':
    print("="*50)
    print("Adding Property Images")
    print("="*50)
    add_images_to_properties()
