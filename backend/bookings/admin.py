from django.contrib import admin
from .models import Booking, Message


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['property', 'renter', 'booking_type', 'status', 'start_date', 'created_at']
    list_filter = ['booking_type', 'status', 'created_at']
    search_fields = ['property__title', 'renter__username']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'property', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__username', 'receiver__username', 'content']
