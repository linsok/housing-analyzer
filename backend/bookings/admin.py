from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponseRedirect
from django.utils import timezone
from .models import Booking, Message


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'property', 'renter', 'booking_type', 'status', 'start_date', 
        'completed_at', 'checked_out_at', 'hidden_by_owner', 'created_at', 'checkout_actions'
    ]
    list_filter = [
        'booking_type', 'status', 'hidden_by_owner', 'created_at', 
        'completed_at', 'checked_out_at'
    ]
    search_fields = ['property__title', 'renter__username', 'renter__email']
    ordering = ['-created_at']
    
    # Custom actions for bulk operations
    actions = ['checkout_selected_bookings', 'restore_hidden_bookings']
    
    def checkout_actions(self, obj):
        """Display checkout actions for individual bookings"""
        if obj.booking_type == 'rental' and obj.status == 'confirmed':
            return format_html(
                '<a href="/admin/bookings/booking/{}/checkout/" class="button" style="background-color: #dc3545; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px;">Check Out</a>',
                obj.id
            )
        elif obj.status == 'completed':
            return format_html(
                '<span style="color: #28a745;">✓ Checked Out</span>'
            )
        return '-'
    checkout_actions.short_description = 'Actions'
    
    def get_queryset(self, request):
        """Filter bookings based on user role"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # For non-superusers, show only their own bookings
        return qs.filter(property__owner=request.user)
    
    def checkout_selected_bookings(self, request, queryset):
        """Bulk checkout action"""
        count = 0
        for booking in queryset:
            if booking.booking_type == 'rental' and booking.status == 'confirmed':
                booking.status = 'completed'
                booking.completed_at = timezone.now()
                booking.save()
                count += 1
        
        self.message_user(request, f'Successfully checked out {count} bookings.')
    checkout_selected_bookings.short_description = 'Check out selected bookings'
    
    def restore_hidden_bookings(self, request, queryset):
        """Bulk restore hidden bookings"""
        count = queryset.filter(hidden_by_owner=True).update(hidden_by_owner=False)
        self.message_user(request, f'Successfully restored {count} hidden bookings.')
    restore_hidden_bookings.short_description = 'Restore selected hidden bookings'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'property', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__username', 'receiver__username', 'content']
