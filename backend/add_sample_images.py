"""
Simple script to add placeholder images to properties
This creates colored placeholder images instead of downloading from URLs
Run: python add_sample_images.py
"""

import os
import sys
import django
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from django.core.files.base import ContentFile

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import Property, PropertyImage

# Colors for placeholder images
COLORS = [
    '#3B82F6',  # Blue
    '#10B981',  # Green
    '#F59E0B',  # Orange
    '#EF4444',  # Red
    '#8B5CF6',  # Purple
    '#EC4899',  # Pink
]

def create_placeholder_image(text, color, size=(800, 600)):
    """Create a colored placeholder image with text"""
    # Create image
    img = Image.new('RGB', size, color=color)
    draw = ImageDraw.Draw(img)
    
    # Add text
    try:
        # Try to use a nice font
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
    
    # Draw text
    draw.text(position, text, fill='white', font=font)
    
    # Save to BytesIO
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    buffer.seek(0)
    
    return buffer

def add_images_to_properties():
    """Add placeholder images to properties"""
    properties = Property.objects.all()
    
    if not properties.exists():
        print("❌ No properties found. Please create properties first.")
        print("   Run: python manage.py populate_data")
        return
    
    print(f"Found {properties.count()} properties\n")
    
    success_count = 0
    skip_count = 0
    
    for idx, property_obj in enumerate(properties):
        print(f"[{idx + 1}/{properties.count()}] {property_obj.title}")
        
        # Check if property already has images
        if property_obj.images.exists():
            print(f"  ⏭️  Already has {property_obj.images.count()} image(s). Skipping...")
            skip_count += 1
            continue
        
        # Create placeholder image
        color = COLORS[idx % len(COLORS)]
        text = f"Property #{property_obj.id}\n{property_obj.property_type.title()}"
        
        try:
            image_buffer = create_placeholder_image(text, color)
            
            # Create PropertyImage
            property_image = PropertyImage(
                property=property_obj,
                caption=f"Image for {property_obj.title}",
                is_primary=True,
                order=0
            )
            
            # Save image
            filename = f"property_{property_obj.id}_image_1.jpg"
            property_image.image.save(filename, ContentFile(image_buffer.read()), save=True)
            
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
    print("Adding Sample Images to Properties")
    print("="*60)
    print()
    
    # Check if PIL is installed
    try:
        import PIL
        print("✅ PIL/Pillow is installed\n")
    except ImportError:
        print("❌ PIL/Pillow is not installed!")
        print("   Installing now...")
        os.system("pip install Pillow")
        print()
    
    add_images_to_properties()
