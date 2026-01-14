#!/usr/bin/env python3
"""
Debug frontend API calls to see what's happening
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/analytics"

def debug_api_calls():
    """Debug what the frontend is receiving"""
    print("🔍 Debugging Frontend API Calls")
    print("="*50)
    
    # Test each endpoint exactly as the frontend calls it
    endpoints = [
        ("most-booked", "Most Booked"),
        ("highest-rated", "Highest Rated"),
        ("average-price", "Average Price")
    ]
    
    for endpoint, name in endpoints:
        print(f"\n📡 Testing: {name}")
        print(f"URL: {BASE_URL}/{endpoint}/?limit=3")
        
        try:
            response = requests.get(f"{BASE_URL}/{endpoint}/?limit=3")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response structure:")
                print(f"  - 'properties' key exists: {'properties' in data}")
                print(f"  - 'message' key exists: {'message' in data}")
                
                properties = data.get('properties', [])
                print(f"  - Number of properties: {len(properties)}")
                
                if properties:
                    prop = properties[0]
                    print(f"  - Sample property structure:")
                    print(f"    - id: {prop.get('id')}")
                    print(f"    - title: {prop.get('title')}")
                    print(f"    - rent_price: {prop.get('rent_price')}")
                    print(f"    - rating: {prop.get('rating')}")
                    print(f"    - city: {prop.get('city')}")
                    
                    # Check for fields that PropertyCard expects
                    print(f"  - Fields PropertyCard needs:")
                    print(f"    - is_recommended: {prop.get('is_recommended', 'NOT SET')}")
                    print(f"    - featured: {prop.get('featured', 'NOT SET')}")
                    print(f"    - recommendation_type: {prop.get('recommendation_type', 'NOT SET')}")
                    
                    # Show what frontend should add
                    print(f"  - Frontend should add:")
                    print(f"    - recommendation_type: '{endpoint.replace('-', '_')}'")
                    print(f"    - recommendation_label: '{name} - Popular & Trusted'")
                    print(f"    - recommendation_message: '{data.get('message', '')}'")
            else:
                print(f"Error response: {response.text}")
                
        except Exception as e:
            print(f"Request failed: {str(e)}")
    
    print(f"\n" + "="*50)
    print(f"🎯 Expected Frontend Processing:")
    print(f"="*50)
    
    print(f"""
1. Frontend calls propertyService.getMostBookedProperties(3)
2. Gets response: {{'properties': [...], 'message': '...'}}
3. Maps properties to add recommendation_type, recommendation_label, etc.
4. Passes to PropertyCard component
5. PropertyCard checks property.recommendation_type
6. Shows overlay if recommendation_type matches criteria

🔧 Possible Issues:
- API response structure mismatch
- Frontend not properly mapping recommendation_type
- PropertyCard not receiving the modified property objects
- Component rendering issue
""")

if __name__ == "__main__":
    debug_api_calls()
