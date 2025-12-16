from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models_evaluation import OwnerEvaluation
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=OwnerEvaluation)
@receiver(post_delete, sender=OwnerEvaluation)
def update_owner_trust_score(sender, instance, **kwargs):
    """
    Update the owner's trust score when an evaluation is saved or deleted.
    """
    owner = instance.owner
    
    # Only process if the evaluation is approved
    if not instance.is_approved and not kwargs.get('created', False):
        return
    
    # Calculate new trust score based on approved evaluations
    evaluations = OwnerEvaluation.objects.filter(
        owner=owner,
        is_approved=True
    )
    
    # Calculate average rating (weight: 70%)
    avg_rating = evaluations.aggregate(avg=Avg('rating'))['avg'] or 0
    
    # Calculate response time score (weight: 10%)
    avg_response = evaluations.aggregate(avg=Avg('response_time'))['avg'] or 0
    response_score = (avg_response / 5.0) * 0.1
    
    # Calculate property quality score (weight: 10%)
    avg_quality = evaluations.aggregate(avg=Avg('property_quality'))['avg'] or 0
    quality_score = (avg_quality / 5.0) * 0.1
    
    # Calculate communication score (weight: 5%)
    avg_comm = evaluations.aggregate(avg=Avg('communication'))['avg'] or 0
    comm_score = (avg_comm / 5.0) * 0.05
    
    # Calculate reliability score (weight: 5%)
    avg_reliability = evaluations.aggregate(avg=Avg('reliability'))['avg'] or 0
    reliability_score = (avg_reliability / 5.0) * 0.05
    
    # Calculate total trust score (0-1 scale)
    trust_score = min(1.0, max(0.0, (
        (avg_rating / 5.0 * 0.7) + 
        response_score + 
        quality_score + 
        comm_score + 
        reliability_score
    )))
    
    # Update the owner's trust score
    owner.trust_score = round(trust_score, 4)
    owner.save(update_fields=['trust_score'])


def connect_signals():
    """
    Connect signals when the app is ready.
    This function should be called in apps.py.
    """
    pass  # Signals are connected using the @receiver decorator
