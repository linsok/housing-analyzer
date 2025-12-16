from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class OwnerEvaluation(models.Model):
    """Model for admin to evaluate property owners"""
    
    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Fair'),
        (3, 'Good'),
        (4, 'Very Good'),
        (5, 'Excellent')
    ]
    
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='evaluations_received',
        limit_choices_to={'role': 'owner'}
    )
    
    evaluated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='evaluations_given',
        limit_choices_to={'is_staff': True}
    )
    
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    comments = models.TextField(blank=True)
    
    # Evaluation criteria
    response_time = models.PositiveSmallIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    property_quality = models.PositiveSmallIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    communication = models.PositiveSmallIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    reliability = models.PositiveSmallIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    
    # Status
    is_approved = models.BooleanField(default=False)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='evaluations_reviewed',
        limit_choices_to={'is_staff': True}
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['owner', 'evaluated_by']
    
    def __str__(self):
        return f"Evaluation for {self.owner.username} by {self.evaluated_by.username}"
    
    def save(self, *args, **kwargs):
        # Calculate overall rating if individual criteria are provided
        if all([self.response_time, self.property_quality, self.communication, self.reliability]):
            self.rating = round((self.response_time + self.property_quality + 
                               self.communication + self.reliability) / 4)
        super().save(*args, **kwargs)
        
        # Update owner's trust score
        self.update_owner_trust_score()
    
    def update_owner_trust_score(self):
        """Update the owner's trust score based on all evaluations"""
        from django.db.models import Avg
        
        avg_rating = OwnerEvaluation.objects.filter(
            owner=self.owner,
            is_approved=True
        ).aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        
        # Convert to 0-100 scale (5-star to 100-point scale)
        self.owner.trust_score = (avg_rating / 5) * 100
        self.owner.save(update_fields=['trust_score'])


# Add this to the end of users/models.py to create a signal for updating trust scores
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=OwnerEvaluation)
def update_owner_trust_score_signal(sender, instance, **kwargs):
    """Signal to update owner's trust score when evaluations change"""
    instance.update_owner_trust_score()
