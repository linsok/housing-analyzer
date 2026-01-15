#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import PropertyImage
from users.models import User
from django.conf import settings

print("=== Media Configuration ===")
print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
print(f"MEDIA_URL: {settings.MEDIA_URL}")
print(f"Media directory exists: {os.path.exists(settings.MEDIA_ROOT)}")

print("\n=== Database Image Records ===")
property_images = PropertyImage.objects.all()
print(f"Total Property Images in DB: {property_images.count()}")

for img in property_images[:5]:
    print(f"ID: {img.id}")
    print(f"  Image field: {img.image}")
    print(f"  Image name: {img.image.name if img.image else 'None'}")
    print(f"  Image URL: {img.image.url if img.image else 'None'}")
    if img.image:
        full_path = os.path.join(settings.MEDIA_ROOT, img.image.name)
        print(f"  Full path: {full_path}")
        print(f"  File exists: {os.path.exists(full_path)}")
    print()

print("=== User Profile Pictures ===")
users_with_pics = User.objects.exclude(profile_picture='')
print(f"Users with profile pictures: {users_with_pics.count()}")

for user in users_with_pics[:3]:
    print(f"User: {user.username}")
    print(f"  Profile picture: {user.profile_picture}")
    print(f"  Profile picture name: {user.profile_picture.name if user.profile_picture else 'None'}")
    print(f"  Profile picture URL: {user.profile_picture.url if user.profile_picture else 'None'}")
    if user.profile_picture:
        full_path = os.path.join(settings.MEDIA_ROOT, user.profile_picture.name)
        print(f"  Full path: {full_path}")
        print(f"  File exists: {os.path.exists(full_path)}")
    print()

print("=== Media Directory Structure ===")
if os.path.exists(settings.MEDIA_ROOT):
    for root, dirs, files in os.walk(settings.MEDIA_ROOT):
        level = root.replace(settings.MEDIA_ROOT, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 2 * (level + 1)
        for file in files[:5]:  # Limit to first 5 files per directory
            print(f"{subindent}{file}")
        if len(files) > 5:
            print(f"{subindent}... and {len(files) - 5} more files")
else:
    print("Media directory does not exist!")
