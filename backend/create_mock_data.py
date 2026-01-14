#!/usr/bin/env python3
"""
Create mock properties and bookings for testing the recommendation system
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from django.contrib.auth import get_user_model
from properties.models import Property, PropertyImage
from bookings.models import Booking
from decimal import Decimal

User = get_user_model()

def create_mock_data():
    """Create mock properties and bookings for testing"""
    print("🏠 Creating Mock Data for Recommendation System")
    print("="*50)
    
    # Get or create a test owner
    owner, created = User.objects.get_or_create(
        email='testowner@example.com',
        defaults={
            'username': 'testowner',
            'first_name': 'Test',
            'last_name': 'Owner',
            'role': 'owner',
            'verification_status': 'verified'
        }
    )
    
    if created:
        owner.set_password('password123')
        owner.save()
        print(f"✅ Created test owner: {owner.email}")
    else:
        print(f"✅ Using existing owner: {owner.email}")
    
    # Mock properties data
    mock_properties = [
        {
            'title': 'Luxury Apartment in BKK1',
            'description': 'Modern luxury apartment with city views, fully furnished with high-end amenities',
            'property_type': 'apartment',
            'address': 'Street 240, BKK1',
            'city': 'Phnom Penh',
            'district': 'BKK1',
            'area': 'BKK1',
            'rent_price': Decimal('1200.00'),
            'bedrooms': 2,
            'bathrooms': 2,
            'area_sqm': Decimal('85.0'),
            'is_furnished': True,
            'pets_allowed': False,
            'rating': Decimal('4.8'),
            'view_count': 245,
            'favorite_count': 38,
            'verification_status': 'verified',
            'status': 'available'
        },
        {
            'title': 'Cozy Studio near Toul Tom Poung',
            'description': 'Perfect studio for students and young professionals, close to markets and restaurants',
            'property_type': 'studio',
            'address': 'Street 163, Toul Tom Poung',
            'city': 'Phnom Penh',
            'district': 'Toul Tom Poung',
            'area': 'Toul Tom Poung',
            'rent_price': Decimal('350.00'),
            'bedrooms': 1,
            'bathrooms': 1,
            'area_sqm': Decimal('35.0'),
            'is_furnished': True,
            'pets_allowed': True,
            'rating': Decimal('4.2'),
            'view_count': 189,
            'favorite_count': 27,
            'verification_status': 'verified',
            'status': 'available'
        },
        {
            'title': 'Modern Villa in Chamkar Mon',
            'description': 'Spacious villa with garden, perfect for families, located in prime area',
            'property_type': 'villa',
            'address': 'Street 321, Chamkar Mon',
            'city': 'Phnom Penh',
            'district': 'Chamkar Mon',
            'area': 'Chamkar Mon',
            'rent_price': Decimal('2500.00'),
            'bedrooms': 4,
            'bathrooms': 3,
            'area_sqm': Decimal('220.0'),
            'is_furnished': False,
            'pets_allowed': True,
            'rating': Decimal('4.9'),
            'view_count': 156,
            'favorite_count': 45,
            'verification_status': 'verified',
            'status': 'available'
        },
        {
            'title': 'Affordable Room in Sen Sok',
            'description': 'Budget-friendly room with basic amenities, great for students',
            'property_type': 'room',
            'address': 'Street 2004, Sen Sok',
            'city': 'Phnom Penh',
            'district': 'Sen Sok',
            'area': 'Sen Sok',
            'rent_price': Decimal('180.00'),
            'bedrooms': 1,
            'bathrooms': 1,
            'area_sqm': Decimal('20.0'),
            'is_furnished': False,
            'pets_allowed': False,
            'rating': Decimal('3.8'),
            'view_count': 312,
            'favorite_count': 19,
            'verification_status': 'verified',
            'status': 'available'
        },
        {
            'title': 'Penthouse with River View',
            'description': 'Luxurious penthouse with stunning river views, premium amenities',
            'property_type': 'condo',
            'address': 'Riverside, Chroy Changvar',
            'city': 'Phnom Penh',
            'district': 'Chroy Changvar',
            'area': 'Riverside',
            'rent_price': Decimal('3500.00'),
            'bedrooms': 3,
            'bathrooms': 3,
            'area_sqm': Decimal('180.0'),
            'is_furnished': True,
            'pets_allowed': False,
            'rating': Decimal('5.0'),
            'view_count': 428,
            'favorite_count': 67,
            'verification_status': 'verified',
            'status': 'available'
        },
        {
            'title': 'Family House in Toul Kork',
            'description': 'Traditional Khmer house with modern renovations, great for families',
            'property_type': 'house',
            'address': 'Street 98, Toul Kork',
            'city': 'Phnom Penh',
            'district': 'Toul Kork',
            'area': 'Toul Kork',
            'rent_price': Decimal('800.00'),
            'bedrooms': 3,
            'bathrooms': 2,
            'area_sqm': Decimal('120.0'),
            'is_furnished': True,
            'pets_allowed': True,
            'rating': Decimal('4.5'),
            'view_count': 267,
            'favorite_count': 34,
            'verification_status': 'verified',
            'status': 'available'
        }
    ]
    
    created_properties = []
    
    # Create properties
    for prop_data in mock_properties:
        property, created = Property.objects.get_or_create(
            title=prop_data['title'],
            owner=owner,
            defaults=prop_data
        )
        
        if created:
            print(f"✅ Created property: {property.title}")
            created_properties.append(property)
        else:
            print(f"✅ Using existing property: {property.title}")
            created_properties.append(property)
    
    # Create mock bookings
    print(f"\n📅 Creating Mock Bookings...")
    
    # Get or create test renters
    renters = []
    for i in range(3):
        renter, created = User.objects.get_or_create(
            email=f'testrenter{i+1}@example.com',
            defaults={
                'username': f'testrenter{i+1}',
                'first_name': f'Test',
                'last_name': f'Renter{i+1}',
                'role': 'renter'
            }
        )
        if created:
            renter.set_password('password123')
            renter.save()
        renters.append(renter)
    
    # Create bookings with different counts to test recommendation criteria
    booking_scenarios = [
        # Most booked properties (high booking counts)
        {'property_index': 0, 'count': 15, 'type': 'rental'},  # Luxury Apartment
        {'property_index': 4, 'count': 12, 'type': 'rental'},  # Penthouse
        
        # Moderately booked
        {'property_index': 1, 'count': 8, 'type': 'rental'},   # Studio
        {'property_index': 2, 'count': 6, 'type': 'rental'},   # Villa
        
        # Few bookings (for average price testing)
        {'property_index': 3, 'count': 3, 'type': 'rental'},   # Affordable Room
        {'property_index': 5, 'count': 4, 'type': 'rental'},   # Family House
    ]
    
    total_bookings = 0
    for scenario in booking_scenarios:
        if scenario['property_index'] < len(created_properties):
            property = created_properties[scenario['property_index']]
            
            for i in range(scenario['count']):
                renter = renters[i % len(renters)]
                
                booking, created = Booking.objects.get_or_create(
                    property=property,
                    renter=renter,
                    start_date=f'2024-01-{(i % 28) + 1:02d}',
                    defaults={
                        'booking_type': scenario['type'],
                        'end_date': f'2024-02-{(i % 28) + 1:02d}',
                        'monthly_rent': property.rent_price,
                        'deposit_amount': property.rent_price,
                        'total_amount': property.rent_price,
                        'status': 'completed'
                    }
                )
                
                if created:
                    total_bookings += 1
            
            print(f"✅ Created {scenario['count']} bookings for {property.title}")
    
    print(f"\n📊 Mock Data Summary:")
    print(f"• Properties created: {len(created_properties)}")
    print(f"• Total bookings created: {total_bookings}")
    print(f"• Test users: 1 owner + {len(renters)} renters")
    
    print(f"\n🎯 Recommendation Testing Data Ready:")
    print(f"• Most Booked: Luxury Apartment (15 bookings), Penthouse (12 bookings)")
    print(f"• Highest Rated: Penthouse (5.0⭐), Villa (4.9⭐), Luxury Apartment (4.8⭐)")
    print(f"• Average Price: Affordable Room ($180), Studio ($350)")
    print(f"• Best Value: Family House ($800), Cozy Studio ($350)")
    
    print(f"\n🌐 Visit to see recommendations:")
    print(f"• Home Page: http://localhost:5174/")
    print(f"• Properties Page: http://localhost:5174/properties")
    
    return created_properties

if __name__ == "__main__":
    create_mock_data()
