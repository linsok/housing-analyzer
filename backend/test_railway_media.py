#!/usr/bin/env python
"""
Test script to debug Railway media serving
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from django.conf import settings

def test_environment():
    """Test current environment settings"""
    print("=== Environment Debug ===")
    print(f"DEBUG: {settings.DEBUG}")
    print(f"MEDIA_URL: {settings.MEDIA_URL}")
    print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
    
    # Check Railway environment variables
    railway_env = os.getenv('RAILWAY_ENVIRONMENT')
    railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN')
    print(f"RAILWAY_ENVIRONMENT: {railway_env}")
    print(f"RAILWAY_PUBLIC_DOMAIN: {railway_domain}")
    
    # Check if we're in production mode
    if not settings.DEBUG:
        print("✅ Running in PRODUCTION mode")
        expected_url = f"https://{railway_domain}/media/" if railway_domain else "/media/"
        print(f"Expected MEDIA_URL: {expected_url}")
        print(f"Actual MEDIA_URL: {settings.MEDIA_URL}")
        if settings.MEDIA_URL == expected_url:
            print("✅ MEDIA_URL is correct for production")
        else:
            print("❌ MEDIA_URL mismatch in production")
    else:
        print("🔧 Running in DEVELOPMENT mode")
        if settings.MEDIA_URL == "/media/":
            print("✅ MEDIA_URL is correct for development")
        else:
            print("❌ MEDIA_URL incorrect for development")

def test_image_urls():
    """Test image URL generation"""
    from properties.models import PropertyImage
    
    print("\n=== Image URL Generation ===")
    images = PropertyImage.objects.all()[:3]
    
    for img in images:
        if img.image:
            print(f"Image {img.id}:")
            print(f"  Database path: {img.image.name}")
            print(f"  Generated URL: {img.image.url}")
            
            # Test what the URL should be in production
            railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', 'web-production-6f713.up.railway.app')
            production_url = f"https://{railway_domain}/media/{img.image.name}"
            print(f"  Expected production URL: {production_url}")
            print()

if __name__ == "__main__":
    test_environment()
    test_image_urls()
