#!/usr/bin/env python
"""
Final test to ensure production URLs work correctly
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import PropertyImage
from django.conf import settings

def test_production_urls():
    """Test production URL generation"""
    print("=== Production URL Test ===")
    
    # Force production mode for testing
    original_debug = settings.DEBUG
    settings.DEBUG = False
    
    # Test a few images
    images = PropertyImage.objects.all()[:3]
    
    for img in images:
        if img.image:
            # Force regeneration of URL with production settings
            url = img.image.url
            print(f"Image: {img.image.name}")
            print(f"  Production URL: {url}")
            
            # Test expected format
            railway_domain = "web-production-6f713.up.railway.app"
            expected_prefix = f"https://{railway_domain}/media/"
            
            if url.startswith(expected_prefix):
                print(f"  ✅ Correct production URL format")
            else:
                print(f"  ❌ Incorrect URL format")
                print(f"  Expected to start with: {expected_prefix}")
            print()
    
    # Restore original DEBUG setting
    settings.DEBUG = original_debug

def create_api_test():
    """Create a simple API test"""
    print("=== API Response Test ===")
    
    # Test what the API would return
    from properties.serializers import PropertyImageSerializer
    
    images = PropertyImage.objects.all()[:3]
    for img in images:
        if img.image:
            serializer = PropertyImageSerializer(img)
            data = serializer.data
            print(f"API Data for Image {img.id}:")
            print(f"  Image URL: {data.get('image', 'N/A')}")
            print()

if __name__ == "__main__":
    test_production_urls()
    create_api_test()
