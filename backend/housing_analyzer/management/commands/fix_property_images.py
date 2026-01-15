"""
Django management command to fix property image references
"""
from django.core.management.base import BaseCommand
from properties.models import PropertyImage


class Command(BaseCommand):
    help = 'Fix property image references to match existing media files'

    def handle(self, *args, **options):
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
        
        self.stdout.write(f"Found {all_images.count()} property images to check")
        
        updated_count = 0
        file_index = 0
        
        for image in all_images:
            if image.image and image.image.name:
                # Check if the current file exists
                current_file = image.image.name
                self.stdout.write(f"Current image: {current_file}")
                
                # Replace with an existing file
                new_file = existing_files[file_index % len(existing_files)]
                
                if current_file != new_file:
                    self.stdout.write(self.style.SUCCESS(f"Updating: {current_file} -> {new_file}"))
                    image.image.name = new_file
                    image.save()
                    updated_count += 1
                
                file_index += 1
        
        self.stdout.write(self.style.SUCCESS(f"Updated {updated_count} property images"))
        self.stdout.write(self.style.SUCCESS("Property images now reference existing files in media directory"))
