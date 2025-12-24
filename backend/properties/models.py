from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Property(models.Model):
    """Property model for rental listings"""
    
    PROPERTY_TYPE_CHOICES = (
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('room', 'Room'),
        ('studio', 'Studio'),
        ('condo', 'Condo'),
    )
    
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('pending', 'Pending'),
        ('maintenance', 'Maintenance'),
    )
    
    VERIFICATION_STATUS = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    
    # Owner information
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    
    # Basic information
    title = models.CharField(max_length=200)
    description = models.TextField()
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    
    # Location
    address = models.TextField()
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True)
    area = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Pricing
    rent_price = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    
    # Property details
    bedrooms = models.IntegerField(default=1)
    bathrooms = models.IntegerField(default=1)
    area_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    floor_number = models.IntegerField(null=True, blank=True)
    
    # Features
    is_furnished = models.BooleanField(default=False)
    facilities = models.JSONField(default=list)  # ['wifi', 'parking', 'ac', 'gym', etc.]
    
    # Rules
    rules = models.TextField(blank=True)
    pets_allowed = models.BooleanField(default=False)
    smoking_allowed = models.BooleanField(default=False)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    verification_status = models.CharField(
        max_length=10,
        choices=VERIFICATION_STATUS,
        default='pending'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_properties'
    )
    
    # Metrics
    view_count = models.IntegerField(default=0)
    favorite_count = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Bakong Payment Configuration
    bakong_bank_account = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Bakong bank account in format username@bankcode"
    )
    bakong_merchant_name = models.CharField(
        max_length=100, 
        blank=True, 
        default='',
        help_text="Merchant name for KHQR generation"
    )
    bakong_phone_number = models.CharField(
        max_length=20, 
        blank=True, 
        default='',
        help_text="Phone number for KHQR generation"
    )
    use_bakong_payment = models.BooleanField(
        default=False,
        help_text="Enable Bakong KHQR payment for this property"
    )
    
    # Timestamps
    available_from = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Properties'
    
    def __str__(self):
        return f"{self.title} - {self.city}"
    
    @property
    def is_verified(self):
        return self.verification_status == 'verified'


class PropertyImage(models.Model):
    """Property images"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/')
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', '-is_primary', 'created_at']
    
    def __str__(self):
        return f"Image for {self.property.title}"


class PropertyDocument(models.Model):
    """Property ownership documents"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='documents')
    document = models.FileField(upload_to='documents/properties/')
    document_type = models.CharField(max_length=50)  # 'ownership', 'lease', etc.
    description = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.document_type} for {self.property.title}"


class Favorite(models.Model):
    """User favorites/saved properties"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'property']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.property.title}"


class PropertyView(models.Model):
    """Track property views for analytics"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"View of {self.property.title}"


class Report(models.Model):
    """Report suspicious or fake listings"""
    
    REPORT_REASONS = (
        ('fake', 'Fake Listing'),
        ('misleading', 'Misleading Information'),
        ('scam', 'Suspected Scam'),
        ('inappropriate', 'Inappropriate Content'),
        ('duplicate', 'Duplicate Listing'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('reviewing', 'Under Review'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    )
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reports')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reason = models.CharField(max_length=20, choices=REPORT_REASONS)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_reviewed'
    )
    admin_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report: {self.property.title} - {self.reason}"
