"""
Django management command to add images to properties from URLs
Usage: python manage.py add_property_images
"""

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from properties.models import Property, PropertyImage
import requests
from io import BytesIO


class Command(BaseCommand):
    help = 'Add images to properties from URLs'

    IMAGE_URLS = [
        'https://www.vanorohotel.com/wp-content/uploads/2021/07/drz-vanoro_6737.jpg',
        'https://www.vanorohotel.com/wp-content/uploads/2021/07/drz-vanoro_6664.jpg',
        'https://www.jaypeehotels.com/blog/wp-content/uploads/2024/09/Blog-6-scaled.jpg',
        'https://www.wivenhoehouse.co.uk/wp-content/uploads/2020/11/Wivenhoe-House-Hotel-Feb-2023-emma-Cabielles-123-1367x912.jpg',
    ]

    def download_image(self, url):
        """Download image from URL"""
        try:
            self.stdout.write(f"  Downloading: {url}")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return BytesIO(response.content)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  Error downloading {url}: {e}"))
            return None

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('Adding Property Images'))
        self.stdout.write(self.style.SUCCESS('='*60))

        properties = Property.objects.all()
        
        if not properties.exists():
            self.stdout.write(self.style.ERROR('No properties found. Please create properties first.'))
            return
        
        self.stdout.write(f"\nFound {properties.count()} properties\n")
        
        success_count = 0
        fail_count = 0
        
        for idx, property_obj in enumerate(properties):
            # Use images in rotation
            image_url = self.IMAGE_URLS[idx % len(self.IMAGE_URLS)]
            
            self.stdout.write(f"\n[{idx + 1}/{properties.count()}] Processing: {property_obj.title}")
            
            # Check if property already has images
            existing_images = property_obj.images.count()
            
            if existing_images > 0:
                self.stdout.write(self.style.WARNING(f"  Property already has {existing_images} image(s). Skipping..."))
                continue
            
            # Download image
            image_data = self.download_image(image_url)
            
            if image_data:
                try:
                    # Create filename
                    filename = f"property_{property_obj.id}_image_1.jpg"
                    
                    # Create PropertyImage
                    property_image = PropertyImage(
                        property=property_obj,
                        caption=f"Main image for {property_obj.title}",
                        is_primary=True,
                        order=0
                    )
                    
                    # Save image file
                    property_image.image.save(filename, ContentFile(image_data.read()), save=True)
                    
                    self.stdout.write(self.style.SUCCESS(f"  ✓ Successfully added image"))
                    success_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  ✗ Failed to save image: {e}"))
                    fail_count += 1
            else:
                fail_count += 1
        
        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'Image Addition Complete!'))
        self.stdout.write(f'  Success: {success_count}')
        self.stdout.write(f'  Failed: {fail_count}')
        self.stdout.write(f'  Skipped: {properties.count() - success_count - fail_count}')
        self.stdout.write('='*60)
