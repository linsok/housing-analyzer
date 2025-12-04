"""
Script to check if properties have images
Run: python check_images.py
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import Property, PropertyImage

print("="*60)
print("Property Images Check")
print("="*60)

# Check properties
properties = Property.objects.all()
print(f"\nTotal Properties: {properties.count()}")

# Check images
images = PropertyImage.objects.all()
print(f"Total Images: {images.count()}")

print("\n" + "-"*60)
print("Property Details:")
print("-"*60)

for prop in properties:
    image_count = prop.images.count()
    print(f"\n{prop.id}. {prop.title}")
    print(f"   Status: {prop.status}")
    print(f"   Verification: {prop.verification_status}")
    print(f"   Images: {image_count}")
    
    if image_count > 0:
        for img in prop.images.all():
            print(f"      - {img.image.name} (Primary: {img.is_primary})")
            print(f"        File exists: {os.path.exists(img.image.path)}")
    else:
        print("      ⚠ No images!")

print("\n" + "="*60)

# Summary
properties_with_images = Property.objects.filter(images__isnull=False).distinct().count()
properties_without_images = properties.count() - properties_with_images

print(f"\nSummary:")
print(f"  Properties with images: {properties_with_images}")
print(f"  Properties without images: {properties_without_images}")
print("="*60)
