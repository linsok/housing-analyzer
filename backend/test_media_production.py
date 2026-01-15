#!/usr/bin/env python
"""
Test script to verify media serving works in production
"""
import os
import django
import requests
from django.test import Client
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import PropertyImage
from users.models import User

def test_media_urls():
    """Test that media URLs are correctly generated"""
    print("=== Testing Media URL Generation ===")
    
    # Test property images
    property_images = PropertyImage.objects.all()[:3]
    for img in property_images:
        if img.image:
            url = img.image.url
            print(f"Property Image URL: {url}")
            
            # Test if URL starts correctly in production
            if not settings.DEBUG:
                expected_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', 'web-production-6f713.up.railway.app')
                expected_prefix = f'https://{expected_domain}/media/'
                if url.startswith(expected_prefix):
                    print(f"  ✅ Correct production URL format")
                else:
                    print(f"  ❌ Incorrect URL format. Expected to start with: {expected_prefix}")
            else:
                if url.startswith('/media/'):
                    print(f"  ✅ Correct development URL format")
                else:
                    print(f"  ❌ Incorrect URL format for development")
    
    # Test user profile pictures
    users_with_pics = User.objects.exclude(profile_picture='').all()[:3]
    for user in users_with_pics:
        if user.profile_picture:
            url = user.profile_picture.url
            print(f"Profile Picture URL: {url}")
            
            if not settings.DEBUG:
                expected_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', 'web-production-6f713.up.railway.app')
                expected_prefix = f'https://{expected_domain}/media/'
                if url.startswith(expected_prefix):
                    print(f"  ✅ Correct production URL format")
                else:
                    print(f"  ❌ Incorrect URL format. Expected to start with: {expected_prefix}")

def test_media_serving():
    """Test media serving through Django views"""
    print("\n=== Testing Media Serving ===")
    
    client = Client()
    
    # Test property image serving
    property_images = PropertyImage.objects.all()[:2]
    for img in property_images:
        if img.image:
            # Extract the path part (without domain)
            if settings.DEBUG:
                path = img.image.url
            else:
                # Remove domain part for testing
                path = img.image.url.replace(f"https://{os.getenv('RAILWAY_PUBLIC_DOMAIN', 'web-production-6f713.up.railway.app')}", '')
            
            print(f"Testing path: {path}")
            
            try:
                response = client.get(path)
                if response.status_code == 200:
                    print(f"  ✅ Successfully served image (Status: {response.status_code})")
                    print(f"  Content-Type: {response.get('Content-Type', 'Not set')}")
                else:
                    print(f"  ❌ Failed to serve image (Status: {response.status_code})")
            except Exception as e:
                print(f"  ❌ Error serving image: {e}")

def test_file_existence():
    """Test that media files actually exist on disk"""
    print("\n=== Testing File Existence ===")
    
    media_root = settings.MEDIA_ROOT
    print(f"Media root: {media_root}")
    
    # Test property images
    property_images = PropertyImage.objects.all()[:3]
    for img in property_images:
        if img.image:
            full_path = os.path.join(media_root, img.image.name)
            exists = os.path.exists(full_path)
            print(f"Property image {img.image.name}: {'✅ Exists' if exists else '❌ Missing'}")
            
            if exists:
                size = os.path.getsize(full_path)
                print(f"  Size: {size} bytes")
    
    # Test user profile pictures
    users_with_pics = User.objects.exclude(profile_picture='').all()[:3]
    for user in users_with_pics:
        if user.profile_picture:
            full_path = os.path.join(media_root, user.profile_picture.name)
            exists = os.path.exists(full_path)
            print(f"Profile picture {user.profile_picture.name}: {'✅ Exists' if exists else '❌ Missing'}")
            
            if exists:
                size = os.path.getsize(full_path)
                print(f"  Size: {size} bytes")

if __name__ == "__main__":
    print(f"Current DEBUG mode: {settings.DEBUG}")
    print(f"Current MEDIA_URL: {settings.MEDIA_URL}")
    print(f"Current MEDIA_ROOT: {settings.MEDIA_ROOT}")
    
    test_media_urls()
    test_file_existence()
    
    if settings.DEBUG:
        test_media_serving()
    else:
        print("\n=== Skipping Media Serving Test ===")
        print("Media serving test skipped in production mode")
        print("To test in production, deploy to Railway and test URLs directly")
