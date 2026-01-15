"""
Test script to verify media serving after fixing image references
"""
import requests
import json

def test_media_files():
    """Test if media files are now accessible"""
    
    base_url = "https://web-production-6f713.up.railway.app"
    
    # Test files that should now exist
    test_files = [
        '/media/properties/Parc-3-Cheras-Malaysia.jpg',
        '/media/properties/pexels-elena-zhuravleva-647531-1457812.jpg',
        '/media/properties/1_1_Buxv3VG.jpg',
        '/media/properties/1.jpg',
        '/media/properties/ai-img_6914-3.jpeg',
    ]
    
    print("Testing media file accessibility...")
    
    for file_path in test_files:
        url = base_url + file_path
        try:
            response = requests.get(url, timeout=10)
            status = "✅ ACCESSIBLE" if response.status_code == 200 else f"❌ {response.status_code}"
            print(f"{file_path}: {status}")
        except Exception as e:
            print(f"{file_path}: ❌ ERROR - {str(e)}")
    
    # Test property API to see updated image URLs
    print("\nTesting property API for updated images...")
    try:
        response = requests.get(f"{base_url}/api/properties/1/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            images = data.get('images', [])
            print(f"Property 1 has {len(images)} images:")
            for i, img in enumerate(images[:3]):  # Show first 3
                img_url = img.get('image', '')
                print(f"  {i+1}. {img_url}")
                
                # Test if this specific image is accessible
                try:
                    img_response = requests.get(img_url, timeout=5)
                    status = "✅" if img_response.status_code == 200 else f"❌ {img_response.status_code}"
                    print(f"     Status: {status}")
                except Exception as e:
                    print(f"     Status: ❌ ERROR - {str(e)}")
        else:
            print(f"❌ Property API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing property API: {str(e)}")

if __name__ == '__main__':
    test_media_files()
