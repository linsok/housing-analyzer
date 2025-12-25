"""
Populate database with sample data for testing
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from django.contrib.auth import get_user_model
from properties.models import Property
from bookings.models import Booking
from reviews.models import Review
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

print("🚀 Starting data population...")

# Create users
print("\n👥 Creating users...")

# Admin (already exists)
admin, _ = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@housing.com',
        'role': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'is_staff': True,
        'is_superuser': True,
    }
)
if _:
    admin.set_password('admin123')
    admin.save()
    print("✅ Created admin user")

# Property Owners
owners_data = [
    {'username': 'john_owner', 'email': 'john@example.com', 'first_name': 'John', 'last_name': 'Smith', 'phone': '012-345-678'},
    {'username': 'sarah_owner', 'email': 'sarah@example.com', 'first_name': 'Sarah', 'last_name': 'Johnson', 'phone': '012-345-679'},
    {'username': 'mike_owner', 'email': 'mike@example.com', 'first_name': 'Mike', 'last_name': 'Williams', 'phone': '012-345-680'},
]

owners = []
for data in owners_data:
    user, created = User.objects.get_or_create(
        username=data['username'],
        defaults={
            **data,
            'role': 'owner',
            'verification_status': 'verified',
            'city': 'Phnom Penh',
            'country': 'Cambodia',
        }
    )
    if created:
        user.set_password('password123')
        user.save()
        print(f"✅ Created owner: {data['username']}")
    owners.append(user)

# Renters
renters_data = [
    {'username': 'alice_renter', 'email': 'alice@example.com', 'first_name': 'Alice', 'last_name': 'Brown', 'phone': '012-345-681'},
    {'username': 'bob_renter', 'email': 'bob@example.com', 'first_name': 'Bob', 'last_name': 'Davis', 'phone': '012-345-682'},
    {'username': 'carol_renter', 'email': 'carol@example.com', 'first_name': 'Carol', 'last_name': 'Wilson', 'phone': '012-345-683'},
    {'username': 'david_renter', 'email': 'david@example.com', 'first_name': 'David', 'last_name': 'Taylor', 'phone': '012-345-684'},
]

renters = []
for data in renters_data:
    user, created = User.objects.get_or_create(
        username=data['username'],
        defaults={
            **data,
            'role': 'renter',
            'city': 'Phnom Penh',
            'country': 'Cambodia',
        }
    )
    if created:
        user.set_password('password123')
        user.save()
        print(f"✅ Created renter: {data['username']}")
    renters.append(user)

print(f"\n📊 Total users created: {User.objects.count()}")

# Create properties
print("\n🏠 Creating properties...")

properties_data = [
    {
        'title': 'Modern 2BR Apartment in BKK1',
        'description': 'Beautiful modern apartment with city views, fully furnished with high-speed internet.',
        'property_type': 'apartment',
        'city': 'Phnom Penh',
        'district': 'Chamkarmon',
        'area': 'BKK1',
        'address': '123 Street 240, BKK1',
        'rent_price': Decimal('800.00'),
        'deposit': Decimal('1600.00'),
        'bedrooms': 2,
        'bathrooms': 2,
        'area_sqm': Decimal('85.00'),
        'is_furnished': True,
        'pets_allowed': False,
        'smoking_allowed': False,
    },
    {
        'title': 'Spacious Villa with Pool in Toul Kork',
        'description': 'Luxurious 4-bedroom villa with private pool and garden. Perfect for families.',
        'property_type': 'house',
        'city': 'Phnom Penh',
        'district': 'Toul Kork',
        'area': 'Toul Kork',
        'address': '456 Street 289, Toul Kork',
        'rent_price': Decimal('2500.00'),
        'deposit': Decimal('5000.00'),
        'bedrooms': 4,
        'bathrooms': 3,
        'area_sqm': Decimal('250.00'),
        'is_furnished': True,
        'pets_allowed': True,
        'smoking_allowed': False,
    },
    {
        'title': 'Cozy Studio in Riverside',
        'description': 'Affordable studio apartment near riverside, perfect for students or young professionals.',
        'property_type': 'studio',
        'city': 'Phnom Penh',
        'district': 'Daun Penh',
        'area': 'Riverside',
        'address': '789 Sisowath Quay',
        'rent_price': Decimal('350.00'),
        'deposit': Decimal('700.00'),
        'bedrooms': 1,
        'bathrooms': 1,
        'area_sqm': Decimal('35.00'),
        'is_furnished': True,
        'pets_allowed': False,
        'smoking_allowed': False,
    },
    {
        'title': '3BR Condo in Diamond Island',
        'description': 'Luxury condo with stunning river views, gym, and swimming pool access.',
        'property_type': 'condo',
        'city': 'Phnom Penh',
        'district': 'Chamkarmon',
        'area': 'Diamond Island',
        'address': 'Diamond Island City, Tower A',
        'rent_price': Decimal('1800.00'),
        'deposit': Decimal('3600.00'),
        'bedrooms': 3,
        'bathrooms': 2,
        'area_sqm': Decimal('120.00'),
        'is_furnished': True,
        'pets_allowed': False,
        'smoking_allowed': False,
    },
    {
        'title': 'Affordable 1BR in Toul Tumpung',
        'description': 'Simple and clean 1-bedroom apartment, great location near markets and restaurants.',
        'property_type': 'apartment',
        'city': 'Phnom Penh',
        'district': 'Chamkarmon',
        'area': 'Toul Tumpung',
        'address': '321 Street 155, Toul Tumpung',
        'rent_price': Decimal('450.00'),
        'deposit': Decimal('900.00'),
        'bedrooms': 1,
        'bathrooms': 1,
        'area_sqm': Decimal('50.00'),
        'is_furnished': False,
        'pets_allowed': True,
        'smoking_allowed': True,
    },
    {
        'title': 'Luxury Penthouse in BKK3',
        'description': 'Top floor penthouse with panoramic city views, private terrace, and premium finishes.',
        'property_type': 'apartment',
        'city': 'Phnom Penh',
        'district': 'Chamkarmon',
        'area': 'BKK3',
        'address': '555 Street 360, BKK3',
        'rent_price': Decimal('3000.00'),
        'deposit': Decimal('6000.00'),
        'bedrooms': 3,
        'bathrooms': 3,
        'area_sqm': Decimal('180.00'),
        'is_furnished': True,
        'pets_allowed': False,
        'smoking_allowed': False,
    },
]

properties = []
for i, data in enumerate(properties_data):
    owner = owners[i % len(owners)]
    prop, created = Property.objects.get_or_create(
        title=data['title'],
        defaults={
            **data,
            'owner': owner,
            'currency': 'USD',
            'status': 'available',
            'verification_status': 'verified',
            'rating': Decimal('4.5'),
            'view_count': (i + 1) * 15,
            'favorite_count': (i + 1) * 3,
        }
    )
    if created:
        print(f"✅ Created property: {data['title']}")
    properties.append(prop)

print(f"\n📊 Total properties created: {Property.objects.count()}")

# Create some bookings
print("\n📅 Creating bookings...")

bookings_data = [
    {
        'property': properties[0],
        'renter': renters[0],
        'booking_type': 'rental',
        'start_date': timezone.now().date(),
        'monthly_rent': properties[0].rent_price,
        'deposit_amount': properties[0].deposit,
        'total_amount': properties[0].rent_price + properties[0].deposit,
        'status': 'confirmed',
    },
    {
        'property': properties[2],
        'renter': renters[1],
        'booking_type': 'rental',
        'start_date': (timezone.now() - timedelta(days=30)).date(),
        'monthly_rent': properties[2].rent_price,
        'deposit_amount': properties[2].deposit,
        'total_amount': properties[2].rent_price + properties[2].deposit,
        'status': 'completed',
    },
    {
        'property': properties[3],
        'renter': renters[2],
        'booking_type': 'visit',
        'start_date': (timezone.now() + timedelta(days=2)).date(),
        'visit_time': timezone.now() + timedelta(days=2),
        'status': 'pending',
    },
]

for data in bookings_data:
    booking, created = Booking.objects.get_or_create(
        property=data['property'],
        renter=data['renter'],
        defaults=data
    )
    if created:
        print(f"✅ Created booking for {data['property'].title}")

print(f"\n📊 Total bookings created: {Booking.objects.count()}")

# Create some reviews
print("\n⭐ Creating reviews...")

reviews_data = [
    {
        'property': properties[0],
        'reviewer': renters[0],
        'overall_rating': 5,
        'cleanliness': 5,
        'accuracy': 5,
        'location': 5,
        'value': 4,
        'title': 'Excellent apartment!',
        'comment': 'Great location, very clean and modern. Highly recommend!',
    },
    {
        'property': properties[2],
        'reviewer': renters[1],
        'overall_rating': 4,
        'cleanliness': 4,
        'accuracy': 4,
        'location': 5,
        'value': 5,
        'title': 'Good value for money',
        'comment': 'Nice studio, perfect for students. Good location near riverside.',
    },
]

for data in reviews_data:
    review, created = Review.objects.get_or_create(
        property=data['property'],
        reviewer=data['reviewer'],
        defaults=data
    )
    if created:
        print(f"✅ Created review for {data['property'].title}")

print(f"\n📊 Total reviews created: {Review.objects.count()}")

print("\n" + "="*60)
print("✅ DATA POPULATION COMPLETE!")
print("="*60)
print("\n📊 Summary:")
print(f"   Users: {User.objects.count()}")
print(f"   - Admins: {User.objects.filter(role='admin').count()}")
print(f"   - Owners: {User.objects.filter(role='owner').count()}")
print(f"   - Renters: {User.objects.filter(role='renter').count()}")
print(f"   Properties: {Property.objects.count()}")
print(f"   Bookings: {Booking.objects.count()}")
print(f"   Reviews: {Review.objects.count()}")

print("\n🔐 Login Credentials:")
print("   Admin: username='admin', password='admin123'")
print("   Owners: username='john_owner' (or sarah_owner, mike_owner), password='password123'")
print("   Renters: username='alice_renter' (or bob_renter, carol_renter, david_renter), password='password123'")

print("\n🚀 Next steps:")
print("   1. Start backend: python manage.py runserver")
print("   2. Start frontend: cd ../frontend && npm run dev")
print("   3. Visit: http://localhost:5173")
