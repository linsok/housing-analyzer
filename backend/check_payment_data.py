#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from bookings.models import Booking
from users.models import User
from properties.models import Property

# Find the booking for lina sok and check payment data
try:
    user = User.objects.filter(email='soklin1220lin@gmail.com').first()
    if user:
        print(f'Found user: {user.full_name} (ID: {user.id})')
        
        # Get the latest booking for Premier Room
        latest_booking = Booking.objects.filter(
            renter=user,
            booking_type='rental',
            property__title='Premier Room'
        ).order_by('-created_at').first()
        
        if latest_booking:
            print(f'\n=== LATEST PREMIER ROOM BOOKING ===')
            print(f'Booking ID: {latest_booking.id}')
            print(f'Property: {latest_booking.property.title if latest_booking.property else "None"}')
            print(f'Status: {latest_booking.status}')
            print(f'Monthly Rent (from booking): {latest_booking.monthly_rent}')
            print(f'Property Rent Price: {latest_booking.property.rent_price if latest_booking.property else "None"}')
            print(f'Property Monthly Rent: Not available field')
            print(f'Created at: {latest_booking.created_at}')
            
            # Check all payment-related fields
            print(f'\n=== PAYMENT FIELDS ===')
            print(f'booking.monthly_rent: {latest_booking.monthly_rent}')
            print(f'booking.property.rent_price: {latest_booking.property.rent_price if latest_booking.property else "None"}')
            print(f'booking.property.monthly_rent: Not available field')
            print(f'booking.total_amount: {latest_booking.total_amount}')
            print(f'booking.deposit_amount: {latest_booking.deposit_amount}')
            
            # Test the transform logic
            print(f'\n=== TRANSFORM LOGIC TEST ===')
            monthly_payment = float(
                latest_booking.monthly_rent or 
                (latest_booking.property.rent_price if latest_booking.property else 0) or 
                0
            )
            print(f'Calculated monthly_payment: {monthly_payment}')
            
        else:
            print('No Premier Room booking found')
            
        # Check the property details
        premier_room = Property.objects.filter(title='Premier Room').first()
        if premier_room:
            print(f'\n=== PREMIER ROOM PROPERTY DETAILS ===')
            print(f'Property ID: {premier_room.id}')
            print(f'Title: {premier_room.title}')
            print(f'Rent Price: {premier_room.rent_price}')
            print(f'Monthly Rent: Not available field')
            print(f'Price: Not available field')
            
    else:
        print('User not found')
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
