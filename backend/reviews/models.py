from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from properties.models import Property
from bookings.models import Booking

User = get_user_model()


class Review(models.Model):
    """Review model for properties"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reviews')
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review', null=True, blank=True)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    
    # Ratings
    overall_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    cleanliness = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    accuracy = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    location = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    value = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    
    # Review content
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField()
    
    # Verification
    is_verified = models.BooleanField(default=False)  # Verified if user actually rented
    
    # Response from owner
    owner_response = models.TextField(blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['property', 'reviewer']
    
    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.property.title}"
    
    def save(self, *args, **kwargs):
        # Mark as verified if linked to a completed booking
        if self.booking and self.booking.status == 'completed':
            self.is_verified = True
        
        super().save(*args, **kwargs)
        
        # Update property rating
        self.update_property_rating()
    
    def update_property_rating(self):
        """Update property's average rating"""
        from django.db.models import Avg
        avg_rating = Review.objects.filter(property=self.property).aggregate(
            avg=Avg('overall_rating')
        )['avg']
        
        if avg_rating:
            self.property.rating = round(avg_rating, 2)
            self.property.save(update_fields=['rating'])
