#!/usr/bin/env python
"""
Fix corrupted image paths in database
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from django.conf import settings
from properties.models import PropertyImage

def fix_image_paths():
    """Fix image paths that have random suffixes"""
    print("=== Fixing Image Paths ===")
    
    images = PropertyImage.objects.all()
    fixed_count = 0
    
    for img in images:
        if img.image:
            # Check if file exists
            full_path = os.path.join(settings.MEDIA_ROOT, img.image.name)
            
            if not os.path.exists(full_path):
                print(f"Missing file: {img.image.name}")
                
                # Try to find the actual file
                base_name = img.image.name
                if '_1Pwbmsj.jpg' in base_name:
                    # Fix Imperial Hotel image
                    new_name = base_name.replace('_1Pwbmsj.jpg', '_63EUqFb.jpg')
                    new_path = os.path.join(settings.MEDIA_ROOT, new_name)
                    
                    if os.path.exists(new_path):
                        print(f"  Found matching file: {new_name}")
                        img.image.name = new_name
                        img.save()
                        fixed_count += 1
                        print(f"  ✅ Fixed database record")
                    else:
                        print(f"  ❌ No matching file found")
                        
                elif '_YbTHdwX.jpg' in base_name:
                    # Fix dizajn image
                    new_name = base_name.replace('_YbTHdwX.jpg', '_a6hnmtC.jpg')
                    new_path = os.path.join(settings.MEDIA_ROOT, new_name)
                    
                    if os.path.exists(new_path):
                        print(f"  Found matching file: {new_name}")
                        img.image.name = new_name
                        img.save()
                        fixed_count += 1
                        print(f"  ✅ Fixed database record")
                    else:
                        print(f"  ❌ No matching file found")
                        
                else:
                    # Try to find any file with similar base name
                    filename = os.path.basename(base_name)
                    parts = filename.split('_')
                    if len(parts) >= 2:
                        # Try first part of filename
                        base_parts = '_'.join(parts[:-1])  # Remove last part (random suffix)
                        properties_dir = os.path.join(settings.MEDIA_ROOT, 'properties')
                        
                        if os.path.exists(properties_dir):
                            files = os.listdir(properties_dir)
                            matching_files = [f for f in files if f.startswith(base_parts)]
                            
                            if matching_files:
                                # Use the first matching file
                                new_name = f"properties/{matching_files[0]}"
                                print(f"  Found similar file: {matching_files[0]}")
                                img.image.name = new_name
                                img.save()
                                fixed_count += 1
                                print(f"  ✅ Fixed database record")
                            else:
                                print(f"  ❌ No similar files found")
                    else:
                        print(f"  ❌ Cannot parse filename")
            else:
                print(f"✅ File exists: {img.image.name}")
    
    print(f"\n=== Summary ===")
    print(f"Total images checked: {images.count()}")
    print(f"Images fixed: {fixed_count}")

def verify_fixes():
    """Verify that all image paths are now correct"""
    print("\n=== Verification ===")
    
    images = PropertyImage.objects.all()
    missing_count = 0
    
    for img in images:
        if img.image:
            full_path = os.path.join(settings.MEDIA_ROOT, img.image.name)
            exists = os.path.exists(full_path)
            
            if not exists:
                missing_count += 1
                print(f"❌ Still missing: {img.image.name}")
    
    if missing_count == 0:
        print("✅ All image paths are now correct!")
    else:
        print(f"⚠️  Still {missing_count} images missing")

if __name__ == "__main__":
    fix_image_paths()
    verify_fixes()
