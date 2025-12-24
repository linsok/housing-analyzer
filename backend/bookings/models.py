from django.db import models
from django.contrib.auth import get_user_model
from properties.models import Property

User = get_user_model()


class Booking(models.Model):
    """Booking model for property rentals"""
    
    BOOKING_TYPE = (
        ('rental', 'Rental'),
        ('visit', 'Property Visit'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('pending_review', 'Pending Review'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    )
    
    # Booking information
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='bookings')
    renter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    booking_type = models.CharField(max_length=10, choices=BOOKING_TYPE)
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # For rentals
    visit_time = models.DateTimeField(null=True, blank=True)  # For visits
    
    # Pricing (for rentals)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Additional information
    message = models.TextField(blank=True)
    owner_notes = models.TextField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    member_count = models.IntegerField(default=1)
    
    # Payment information
    transaction_image = models.ImageField(upload_to='transactions/', null=True, blank=True)
    transaction_submitted_at = models.DateTimeField(null=True, blank=True)
    bakong_md5_hash = models.CharField(max_length=255, null=True, blank=True, help_text="MD5 hash for Bakong KHQR payment tracking")
    payment_method = models.CharField(max_length=20, default='upload', choices=[
        ('upload', 'Upload Receipt'),
        ('bakong_khqr', 'Bakong KHQR'),
        ('stripe', 'Stripe'),
    ])
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.booking_type} - {self.property.title} by {self.renter.username}"


class Message(models.Model):
    """Messages between renter and property owner"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username}"
