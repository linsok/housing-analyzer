#!/usr/bin/env python3
"""
Test script for the recommendation system
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/analytics"

def test_endpoint(endpoint, description):
    """Test a single endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/{endpoint}/?limit=3")
        print(f"\n{'='*50}")
        print(f"Testing: {description}")
        print(f"Endpoint: {endpoint}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS")
            print(f"Properties returned: {len(data.get('properties', []))}")
            
            if data.get('properties'):
                print("Sample property:")
                prop = data['properties'][0]
                print(f"  - ID: {prop.get('id')}")
                print(f"  - Title: {prop.get('title')}")
                print(f"  - City: {prop.get('city')}")
                print(f"  - Price: ${prop.get('rent_price')}")
                print(f"  - Rating: {prop.get('rating')}")
                
                if 'booking_count' in prop:
                    print(f"  - Booking Count: {prop.get('booking_count')}")
                if 'favorite_count' in prop:
                    print(f"  - Favorite Count: {prop.get('favorite_count')}")
                    
            if 'message' in data:
                print(f"Message: {data['message']}")
            if 'market_stats' in data:
                stats = data['market_stats']
                print(f"Market Stats:")
                print(f"  - Average Price: ${stats.get('average_price')}")
                print(f"  - Min Price: ${stats.get('min_price')}")
                print(f"  - Max Price: ${stats.get('max_price')}")
        else:
            print(f"❌ FAILED")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def main():
    """Run all tests"""
    print("🧪 Testing Recommendation System")
    print("="*50)
    
    # Test all 4 recommendation criteria
    test_endpoint("most-booked", "Most Booked Properties")
    test_endpoint("highest-rated", "Highest Rated Properties")
    test_endpoint("average-price", "Average Price Properties")
    
    print(f"\n{'='*50}")
    print("🎉 Recommendation System Test Complete!")
    print("\nNote: The main 'recommended' endpoint requires authentication")
    print("and combines all 4 criteria with personalization.")

if __name__ == "__main__":
    main()
