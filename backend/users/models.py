from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid

class User(AbstractUser):
    """Custom User model with role-based access"""
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('owner', 'Property Owner'),
        ('renter', 'Renter'),
    )
    
    VERIFICATION_STATUS = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='renter')
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    bio = models.TextField(blank=True)
    
    # Verification fields
    verification_status = models.CharField(
        max_length=10, 
        choices=VERIFICATION_STATUS, 
        default='pending'
    )
    id_document = models.ImageField(upload_to='documents/ids/', blank=True, null=True)
    business_license = models.ImageField(upload_to='documents/licenses/', blank=True, null=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='verified_users'
    )
    
    # Additional fields
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Cambodia')
    
    # Trust score
    trust_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_verified(self):
        return self.verification_status == 'verified'
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username


class UserPreference(models.Model):
    """Store user preferences for recommendations"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    
    # Location preferences
    preferred_cities = models.JSONField(default=list)
    preferred_areas = models.JSONField(default=list)
    
    # Property preferences
    min_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    property_types = models.JSONField(default=list)  # ['apartment', 'house', 'room']
    
    # Features preferences
    furnished = models.BooleanField(null=True, blank=True)
    required_facilities = models.JSONField(default=list)
    
    # Notifications
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.username}"


class PasswordResetOTP(models.Model):
    """Model for password reset OTP codes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_otps')
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Password reset OTP for {self.user.username}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @classmethod
    def generate_otp(cls, user):
        """Generate a new 6-digit OTP for user"""
        import random
        
        # Invalidate existing OTPs
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Generate 6-digit OTP
        otp_code = f"{random.randint(100000, 999999)}"
        
        # Create new OTP that expires in 10 minutes
        expires_at = timezone.now() + timezone.timedelta(minutes=10)
        return cls.objects.create(user=user, otp_code=otp_code, expires_at=expires_at)
