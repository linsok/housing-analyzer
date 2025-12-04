"""
Recommendation engine for property suggestions
"""
from django.db.models import Q, Count, Avg
from properties.models import Property, PropertyView, Favorite
from users.models import UserPreference


def get_recommendations(user, limit=12):
    """
    Get property recommendations for a user based on:
    1. User preferences
    2. Viewing history
    3. Favorites
    4. Popular properties
    """
    
    # Get user preferences
    try:
        preferences = user.preferences
    except UserPreference.DoesNotExist:
        # Return popular properties if no preferences
        return get_popular_properties(limit)
    
    # Start with all available verified properties
    queryset = Property.objects.filter(
        verification_status='verified',
        status='available'
    )
    
    # Apply preference filters
    filters = Q()
    
    # City preferences
    if preferences.preferred_cities:
        filters |= Q(city__in=preferences.preferred_cities)
    
    # Area preferences
    if preferences.preferred_areas:
        filters |= Q(area__in=preferences.preferred_areas)
    
    # Price range
    if preferences.min_price:
        filters &= Q(rent_price__gte=preferences.min_price)
    if preferences.max_price:
        filters &= Q(rent_price__lte=preferences.max_price)
    
    # Property types
    if preferences.property_types:
        filters &= Q(property_type__in=preferences.property_types)
    
    # Furnished preference
    if preferences.furnished is not None:
        filters &= Q(is_furnished=preferences.furnished)
    
    # Apply filters
    if filters:
        queryset = queryset.filter(filters)
    
    # Get user's viewed properties
    viewed_property_ids = list(PropertyView.objects.filter(
        user=user
    ).values_list('property_id', flat=True)[:20])
    
    # Get user's favorite properties
    favorited_property_ids = list(Favorite.objects.filter(
        user=user
    ).values_list('property_id', flat=True))
    
    # Exclude already viewed and favorited
    if viewed_property_ids:
        queryset = queryset.exclude(id__in=viewed_property_ids)
    if favorited_property_ids:
        queryset = queryset.exclude(id__in=favorited_property_ids)
    
    # Find similar properties based on viewed properties
    if viewed_property_ids:
        viewed_properties = Property.objects.filter(id__in=viewed_property_ids)
        
        # Get common characteristics
        common_cities = viewed_properties.values_list('city', flat=True).distinct()
        common_types = viewed_properties.values_list('property_type', flat=True).distinct()
        
        # Boost properties with similar characteristics
        similar_filters = Q()
        if common_cities:
            similar_filters |= Q(city__in=common_cities)
        if common_types:
            similar_filters |= Q(property_type__in=common_types)
        
        if similar_filters:
            queryset = queryset.filter(similar_filters)
    
    # Order by rating and view count
    queryset = queryset.order_by('-rating', '-view_count', '-created_at')
    
    # If not enough results, add popular properties
    results = list(queryset[:limit])
    if len(results) < limit:
        popular = get_popular_properties(limit - len(results))
        results.extend([p for p in popular if p not in results])
    
    return results[:limit]


def get_popular_properties(limit=12):
    """Get popular properties based on views, favorites, and ratings"""
    return Property.objects.filter(
        verification_status='verified',
        status='available'
    ).order_by('-rating', '-view_count', '-favorite_count')[:limit]


def get_similar_properties(property_obj, limit=6):
    """Get properties similar to a given property"""
    return Property.objects.filter(
        verification_status='verified',
        status='available',
        property_type=property_obj.property_type,
        city=property_obj.city
    ).exclude(
        id=property_obj.id
    ).filter(
        rent_price__gte=property_obj.rent_price * 0.8,
        rent_price__lte=property_obj.rent_price * 1.2
    ).order_by('-rating', '-view_count')[:limit]
