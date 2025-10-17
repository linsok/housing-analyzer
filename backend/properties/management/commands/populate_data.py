from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from properties.models import Property, PropertyImage
from reviews.models import Review
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with mock data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting to populate database...')

        # Clear existing data (optional - comment out if you want to keep existing data)
        self.stdout.write('Clearing existing data...')
        Property.objects.all().delete()
        Review.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        # Create Admin User
        self.stdout.write('Creating admin user...')
        admin, created = User.objects.get_or_create(
            email='admin@myrentor.com',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'phone_number': '+855123456789',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Admin created: admin@myrentor.com / admin123'))
        else:
            self.stdout.write(self.style.WARNING('Admin already exists'))

        # Create Property Owners
        self.stdout.write('Creating property owners...')
        owners_data = [
            {
                'email': 'owner1@myrentor.com',
                'username': 'owner1',
                'first_name': 'Sokha',
                'last_name': 'Chan',
                'phone_number': '+855123456701',
            },
            {
                'email': 'owner2@myrentor.com',
                'username': 'owner2',
                'first_name': 'Dara',
                'last_name': 'Pov',
                'phone_number': '+855123456702',
            },
            {
                'email': 'owner3@myrentor.com',
                'username': 'owner3',
                'first_name': 'Srey',
                'last_name': 'Mao',
                'phone_number': '+855123456703',
            },
        ]

        owners = []
        for owner_data in owners_data:
            owner, created = User.objects.get_or_create(
                email=owner_data['email'],
                defaults={
                    **owner_data,
                    'role': 'owner',
                    'verification_status': 'verified',
                }
            )
            if created:
                owner.set_password('owner123')
                owner.save()
                self.stdout.write(self.style.SUCCESS(f'✓ Owner created: {owner.email} / owner123'))
            owners.append(owner)

        # Create Renters
        self.stdout.write('Creating renters...')
        renters_data = [
            {
                'email': 'renter1@myrentor.com',
                'username': 'renter1',
                'first_name': 'Vanna',
                'last_name': 'Sok',
                'phone_number': '+855123456801',
            },
            {
                'email': 'renter2@myrentor.com',
                'username': 'renter2',
                'first_name': 'Pisey',
                'last_name': 'Lim',
                'phone_number': '+855123456802',
            },
            {
                'email': 'renter3@myrentor.com',
                'username': 'renter3',
                'first_name': 'Bopha',
                'last_name': 'Keo',
                'phone_number': '+855123456803',
            },
        ]

        renters = []
        for renter_data in renters_data:
            renter, created = User.objects.get_or_create(
                email=renter_data['email'],
                defaults={
                    **renter_data,
                    'role': 'renter',
                }
            )
            if created:
                renter.set_password('renter123')
                renter.save()
                self.stdout.write(self.style.SUCCESS(f'✓ Renter created: {renter.email} / renter123'))
            renters.append(renter)

        # Define Facilities list (stored as JSON in properties)
        self.stdout.write('Defining facilities...')
        facilities_list = [
            'WiFi', 'Air Conditioning', 'Parking', 'Swimming Pool', 'Gym',
            'Security', 'Elevator', 'Balcony', 'Garden', 'Laundry',
            'Kitchen', 'Water Heater', 'Cable TV', 'Backup Generator'
        ]

        # Create Properties
        self.stdout.write('Creating properties...')
        properties_data = [
            {
                'title': 'Modern 2BR Apartment in BKK1',
                'description': 'Beautiful modern apartment in the heart of BKK1. Fully furnished with contemporary furniture and appliances. Close to restaurants, cafes, and shopping centers. Perfect for expats and young professionals.',
                'property_type': 'apartment',
                'city': 'Phnom Penh',
                'area': 'BKK1',
                'address': 'Street 308, Sangkat Boeng Keng Kang Ti Muoy',
                'rent_price': Decimal('800.00'),
                'bedrooms': 2,
                'bathrooms': 2,
                'area_sqm': Decimal('85.00'),
                'is_furnished': True,
                'pets_allowed': False,
                'verification_status': 'verified',
            },
            {
                'title': 'Spacious Villa with Pool in Toul Kork',
                'description': 'Luxurious 4-bedroom villa with private swimming pool and garden. High-end finishes throughout. Quiet neighborhood with 24/7 security. Ideal for families.',
                'property_type': 'villa',
                'city': 'Phnom Penh',
                'area': 'Toul Kork',
                'address': 'Street 289, Sangkat Boeng Kak Ti Pir',
                'rent_price': Decimal('2500.00'),
                'bedrooms': 4,
                'bathrooms': 4,
                'area_sqm': Decimal('300.00'),
                'is_furnished': True,
                'pets_allowed': True,
                'verification_status': 'verified',
            },
            {
                'title': 'Cozy Studio Near Russian Market',
                'description': 'Affordable studio apartment perfect for students or young professionals. Walking distance to Russian Market. Basic furniture included. Great value for money.',
                'property_type': 'studio',
                'city': 'Phnom Penh',
                'area': 'Toul Tom Poung',
                'address': 'Street 155, Sangkat Toul Tom Poung Ti Muoy',
                'rent_price': Decimal('300.00'),
                'bedrooms': 1,
                'bathrooms': 1,
                'area_sqm': Decimal('35.00'),
                'is_furnished': True,
                'pets_allowed': False,
                'verification_status': 'verified',
            },
            {
                'title': '3BR House in Riverside Area',
                'description': 'Charming 3-bedroom house with river views. Traditional Khmer architecture with modern amenities. Peaceful location with easy access to city center.',
                'property_type': 'house',
                'city': 'Phnom Penh',
                'area': 'Daun Penh',
                'address': 'Street 110, Sangkat Wat Phnom',
                'rent_price': Decimal('1200.00'),
                'bedrooms': 3,
                'bathrooms': 2,
                'area_sqm': Decimal('150.00'),
                'is_furnished': False,
                'pets_allowed': True,
                'verification_status': 'verified',
            },
            {
                'title': 'Luxury Condo in Diamond Island',
                'description': 'Premium 2-bedroom condo with stunning city views. High-floor unit with top-notch facilities including infinity pool, gym, and concierge service. Fully furnished with designer furniture.',
                'property_type': 'condo',
                'city': 'Phnom Penh',
                'area': 'Tonle Bassac',
                'address': 'Diamond Island, Sangkat Tonle Bassac',
                'rent_price': Decimal('1800.00'),
                'bedrooms': 2,
                'bathrooms': 2,
                'area_sqm': Decimal('95.00'),
                'is_furnished': True,
                'pets_allowed': False,
                'verification_status': 'verified',
            },
            {
                'title': 'Affordable 1BR in Tuol Svay Prey',
                'description': 'Budget-friendly one-bedroom apartment. Basic amenities included. Good for singles or couples. Close to local markets and public transportation.',
                'property_type': 'apartment',
                'city': 'Phnom Penh',
                'area': 'Tuol Svay Prey',
                'address': 'Street 371, Sangkat Boeng Keng Kang Ti Bei',
                'rent_price': Decimal('350.00'),
                'bedrooms': 1,
                'bathrooms': 1,
                'area_sqm': Decimal('45.00'),
                'is_furnished': True,
                'pets_allowed': False,
                'verification_status': 'verified',
            },
            {
                'title': 'Beachfront Villa in Sihanoukville',
                'description': 'Stunning beachfront villa with direct beach access. 5 bedrooms, perfect for large families or groups. Private pool and outdoor dining area. Breathtaking ocean views.',
                'property_type': 'villa',
                'city': 'Sihanoukville',
                'area': 'Ochheuteal Beach',
                'address': 'Ochheuteal Beach Road',
                'rent_price': Decimal('3500.00'),
                'bedrooms': 5,
                'bathrooms': 5,
                'area_sqm': Decimal('400.00'),
                'is_furnished': True,
                'pets_allowed': True,
                'verification_status': 'verified',
            },
            {
                'title': 'Modern Apartment in Siem Reap',
                'description': 'Contemporary 2-bedroom apartment near Angkor Wat. Perfect for tourists or expats working in Siem Reap. Fully equipped kitchen and comfortable living space.',
                'property_type': 'apartment',
                'city': 'Siem Reap',
                'area': 'Wat Bo',
                'address': 'Wat Bo Road, Sala Kamreuk',
                'rent_price': Decimal('600.00'),
                'bedrooms': 2,
                'bathrooms': 2,
                'area_sqm': Decimal('70.00'),
                'is_furnished': True,
                'pets_allowed': False,
                'verification_status': 'verified',
            },
            {
                'title': 'Penthouse with City Views',
                'description': 'Exclusive penthouse apartment on the top floor. Panoramic city views, private terrace, and premium finishes. 3 bedrooms with en-suite bathrooms. Ultimate luxury living.',
                'property_type': 'apartment',
                'city': 'Phnom Penh',
                'area': 'BKK1',
                'address': 'Street 240, Sangkat Chaktomuk',
                'rent_price': Decimal('2200.00'),
                'bedrooms': 3,
                'bathrooms': 3,
                'area_sqm': Decimal('180.00'),
                'is_furnished': True,
                'pets_allowed': True,
                'verification_status': 'verified',
            },
            {
                'title': 'Family House in Chamkarmon',
                'description': 'Spacious family home with 4 bedrooms and large garden. Safe neighborhood with schools and parks nearby. Semi-furnished, ready to move in.',
                'property_type': 'house',
                'city': 'Phnom Penh',
                'area': 'Chamkarmon',
                'address': 'Street 450, Sangkat Toul Svay Prey Ti Muoy',
                'rent_price': Decimal('1500.00'),
                'bedrooms': 4,
                'bathrooms': 3,
                'area_sqm': Decimal('200.00'),
                'is_furnished': False,
                'pets_allowed': True,
                'verification_status': 'verified',
            },
        ]

        properties = []
        for i, prop_data in enumerate(properties_data):
            owner = owners[i % len(owners)]
            
            # Add random facilities to property data
            num_facilities = random.randint(5, 10)
            selected_facilities = random.sample(facilities_list, num_facilities)
            prop_data['facilities'] = selected_facilities
            
            property_obj = Property.objects.create(
                owner=owner,
                **prop_data
            )
            
            properties.append(property_obj)
            self.stdout.write(self.style.SUCCESS(f'✓ Property created: {property_obj.title}'))

        # Create Reviews
        self.stdout.write('Creating reviews...')
        review_texts = [
            "Great property! Very clean and well-maintained. The owner is responsive and helpful.",
            "Perfect location and excellent amenities. Highly recommended!",
            "Good value for money. The apartment is spacious and comfortable.",
            "Amazing place! Everything as described. Would definitely rent again.",
            "Nice property but a bit noisy during weekends. Overall good experience.",
            "Excellent service from the owner. The house is beautiful and well-equipped.",
            "Very satisfied with this rental. Clean, safe, and convenient location.",
            "Good property but could use some minor repairs. Still a decent place to stay.",
            "Outstanding! The villa exceeded our expectations. Perfect for families.",
            "Comfortable and affordable. Great for long-term stay.",
        ]

        for property_obj in properties:
            # Create 2-5 reviews per property
            num_reviews = random.randint(2, 5)
            for _ in range(num_reviews):
                renter = random.choice(renters)
                rating = random.randint(3, 5)
                review_text = random.choice(review_texts)
                
                Review.objects.create(
                    property=property_obj,
                    user=renter,
                    rating=rating,
                    comment=review_text
                )
            
            self.stdout.write(f'  ✓ Added {num_reviews} reviews to {property_obj.title}')

        # Print summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('DATABASE POPULATED SUCCESSFULLY!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write('\n📊 Summary:')
        self.stdout.write(f'  • Admin: 1')
        self.stdout.write(f'  • Property Owners: {len(owners)}')
        self.stdout.write(f'  • Renters: {len(renters)}')
        self.stdout.write(f'  • Properties: {len(properties)}')
        self.stdout.write(f'  • Facilities: {len(facilities_list)} types')
        self.stdout.write(f'  • Reviews: {Review.objects.count()}')
        
        self.stdout.write('\n🔑 Login Credentials:')
        self.stdout.write('  Admin:')
        self.stdout.write('    Email: admin@myrentor.com')
        self.stdout.write('    Password: admin123')
        self.stdout.write('\n  Property Owners:')
        self.stdout.write('    Email: owner1@myrentor.com (or owner2, owner3)')
        self.stdout.write('    Password: owner123')
        self.stdout.write('\n  Renters:')
        self.stdout.write('    Email: renter1@myrentor.com (or renter2, renter3)')
        self.stdout.write('    Password: renter123')
        self.stdout.write('\n' + '='*50 + '\n')
