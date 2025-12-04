from django.db import models
from django.contrib.auth import get_user_model
from bookings.models import Booking

User = get_user_model()


class Payment(models.Model):
    """Payment model for rental transactions"""
    
    PAYMENT_METHOD = (
        ('cash', 'Cash'),
        ('qr_code', 'QR Code'),
        ('credit_card', 'Credit Card'),
        ('bank_transfer', 'Bank Transfer'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    # Payment information
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    
    # Amount
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Payment details
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Transaction details
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_proof = models.ImageField(upload_to='payments/', blank=True, null=True)
    
    # Additional info
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.id} - {self.amount} {self.currency} - {self.status}"


class QRCode(models.Model):
    """QR Code for payments"""
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='qr_code')
    qr_image = models.ImageField(upload_to='qr_codes/')
    qr_data = models.TextField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"QR Code for Payment {self.payment.id}"
