#!/usr/bin/env python
"""
Force update media URLs for production testing
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import PropertyImage
from users.models import User
from django.conf import settings

def test_production_media_access():
    """Test if media files are accessible via production URLs"""
    print("=== Testing Production Media Access ===")
    
    # Simulate production environment
    railway_domain = "web-production-6f713.up.railway.app"
    
    # Test property images
    images = PropertyImage.objects.all()[:3]
    for img in images:
        if img.image:
            production_url = f"https://{railway_domain}/media/{img.image.name}"
            print(f"Testing: {production_url}")
            
            # Check if file exists locally
            local_path = os.path.join(settings.MEDIA_ROOT, img.image.name)
            exists_locally = os.path.exists(local_path)
            print(f"  File exists locally: {'✅' if exists_locally else '❌'}")
            
            if exists_locally:
                size = os.path.getsize(local_path)
                print(f"  File size: {size} bytes")
            print()

def create_frontend_test():
    """Create a simple test to check frontend image loading"""
    html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Media Test - Housing Analyzer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .image-test { margin: 20px 0; border: 1px solid #ccc; padding: 10px; }
        .image-test img { max-width: 200px; height: auto; display: block; margin: 10px 0; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Media File Test - Housing Analyzer</h1>
    <p>This page tests if media files are loading correctly from Railway.</p>
    
    <div class="image-test">
        <h3>Property Image Test</h3>
        <img src="https://web-production-6f713.up.railway.app/media/properties/Parc-3-Cheras-Malaysia.jpg" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
             onload="this.nextElementSibling.style.display='none';">
        <div class="error" style="display:none;">❌ Failed to load property image</div>
        <div class="success">✅ Property image loaded successfully</div>
    </div>
    
    <div class="image-test">
        <h3>Profile Picture Test</h3>
        <img src="https://web-production-6f713.up.railway.app/media/profiles/1723173243300.jpg" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
             onload="this.nextElementSibling.style.display='none';">
        <div class="error" style="display:none;">❌ Failed to load profile picture</div>
        <div class="success">✅ Profile picture loaded successfully</div>
    </div>
    
    <div class="image-test">
        <h3>Debug Info</h3>
        <p>Open browser console (F12) to see any loading errors.</p>
        <p>Check Network tab for failed requests.</p>
    </div>
</body>
</html>
    """
    
    with open('media_test.html', 'w') as f:
        f.write(html_content)
    
    print("Created media_test.html - open this file in browser to test image loading")

if __name__ == "__main__":
    test_production_media_access()
    create_frontend_test()
