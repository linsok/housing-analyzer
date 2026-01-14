#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from bookings.models import Booking
from properties.models import Property
from users.models import User

# Find the booking for lina sok
try:
    user = User.objects.filter(email='soklin1220lin@gmail.com').first()
    if user:
        print(f'Found user: {user.full_name} (ID: {user.id})')
        bookings = Booking.objects.filter(renter=user)
        print(f'Found {bookings.count()} bookings for this user')
        for booking in bookings:
            print(f'Booking ID: {booking.id}')
            print(f'Property: {booking.property.title if booking.property else "None"}')
            print(f'Monthly Rent: {booking.monthly_rent}')
            print(f'Property Rent Price: {booking.property.rent_price if booking.property else "None"}')
            print(f'Status: {booking.status}')
            print(f'Start Date: {booking.start_date}')
            print('---')
    else:
        print('User not found')
except Exception as e:
    print(f'Error: {e}')
