#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from bookings.models import Booking
from users.models import User
from django.utils import timezone

# Find the booking for lina sok that might be causing the issue
try:
    user = User.objects.filter(email='soklin1220lin@gmail.com').first()
    if user:
        print(f'Found user: {user.full_name} (ID: {user.id})')
        
        # Check for bookings that might appear in both lists
        problematic_bookings = []
        
        # Get active customers (confirmed or completed status)
        active_bookings = Booking.objects.filter(
            renter=user,
            booking_type='rental',
            status__in=['confirmed', 'completed']
        )
        
        # Get customer history (has checked_out_at)
        history_bookings = Booking.objects.filter(
            renter=user,
            booking_type='rental',
            checked_out_at__isnull=False
        )
        
        print(f'\nActive bookings (confirmed/completed): {active_bookings.count()}')
        for booking in active_bookings:
            print(f'  Booking ID: {booking.id}, Status: {booking.status}, checked_out_at: {booking.checked_out_at}')
            
        print(f'\nHistory bookings (checked_out_at not null): {history_bookings.count()}')
        for booking in history_bookings:
            print(f'  Booking ID: {booking.id}, Status: {booking.status}, checked_out_at: {booking.checked_out_at}')
            
        # Find overlap
        print(f'\n=== OVERLAP ANALYSIS ===')
        for booking in active_bookings:
            if booking.checked_out_at:
                print(f'PROBLEM: Booking {booking.id} appears in BOTH lists!')
                print(f'  Status: {booking.status}')
                print(f'  checked_out_at: {booking.checked_out_at}')
                print(f'  Property: {booking.property.title if booking.property else "None"}')
                problematic_bookings.append(booking)
        
        # Also check the most recent confirmed booking
        latest_confirmed = Booking.objects.filter(
            renter=user,
            booking_type='rental',
            status='confirmed'
        ).order_by('-created_at').first()
        
        if latest_confirmed:
            print(f'\n=== LATEST CONFIRMED BOOKING ===')
            print(f'Booking ID: {latest_confirmed.id}')
            print(f'Property: {latest_confirmed.property.title if latest_confirmed.property else "None"}')
            print(f'Status: {latest_confirmed.status}')
            print(f'checked_out_at: {latest_confirmed.checked_out_at}')
            print(f'completed_at: {latest_confirmed.completed_at}')
            print(f'created_at: {latest_confirmed.created_at}')
            
    else:
        print('User not found')
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
