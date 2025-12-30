"""
Recommendation engine for property suggestions
"""
from django.db.models import Q, Count, Avg, Sum
from properties.models import Property, PropertyView, Favorite
from users.models import UserPreference
from bookings.models import Booking
from django.utils import timezone
from datetime import timedelta


def get_recommendations(user, limit=12):
    """
    Get property recommendations for a user based on the 4 criteria:
    1. Most Booked Rooms / Properties
    2. Highest Rating Star Rooms / Properties  
    3. Most Searched by That User or Renter
    4. Average Price Property
    """
    
    # Get all verified available properties as base
    base_queryset = Property.objects.filter(
        verification_status='verified',
        status='available'
    )
    
    recommendations = []
    
    # 1. Most Booked Rooms / Properties
    most_booked = get_most_booked_properties(limit=3)
    recommendations.extend(most_booked)
    
    # 2. Highest Rating Star Rooms / Properties
    highest_rated = get_highest_rated_properties(limit=3)
    recommendations.extend(highest_rated)
    
    # 3. Most Searched by That User or Renter (Personalized)
    user_search_based = get_user_search_based_properties(user, limit=3)
    recommendations.extend(user_search_based)
    
    # 4. Average Price Properties (Best Value)
    average_price = get_average_price_properties(limit=3)
    recommendations.extend(average_price)
    
    # Remove duplicates and limit to requested number
    unique_recommendations = []
    seen_ids = set()
    
    for prop in recommendations:
        if prop.id not in seen_ids:
            unique_recommendations.append(prop)
            seen_ids.add(prop.id)
            if len(unique_recommendations) >= limit:
                break
    
    # If we still need more properties, fill with popular ones
    if len(unique_recommendations) < limit:
        popular = get_popular_properties(limit - len(unique_recommendations))
        for prop in popular:
            if prop.id not in seen_ids:
                unique_recommendations.append(prop)
                seen_ids.add(prop.id)
    
    return unique_recommendations[:limit]


def get_most_booked_properties(limit=3):
    """
    1. Most Booked Rooms / Properties
    Rooms or properties that have been booked the highest number of times.
    Used for: Showing popular and trusted options, Helping new users decide quickly
    """
    # Get properties with booking counts
    properties_with_bookings = Property.objects.filter(
        verification_status='verified',
        status='available'
    ).annotate(
        booking_count=Count('bookings')
    ).order_by('-booking_count', '-rating')
    
    return list(properties_with_bookings[:limit])


def get_highest_rated_properties(limit=3):
    """
    2. Highest Rating Star Rooms / Properties
    Rooms or properties with the highest average user review rating.
    Used for: Highlighting quality and satisfaction, Users who value comfort and service
    """
    return list(Property.objects.filter(
        verification_status='verified',
        status='available',
        rating__gt=0  # Only include properties with ratings
    ).order_by('-rating', '-favorite_count', '-view_count')[:limit])


def get_user_search_based_properties(user, limit=3):
    """
    3. Most Searched by That User or Renter
    Properties similar to what the user searches for most often.
    Used for: Personalized recommendations, Returning users
    """
    if not user.is_authenticated:
        return []
    
    # Get user's viewed properties to understand preferences
    viewed_properties = PropertyView.objects.filter(
        user=user
    ).select_related('property').order_by('-viewed_at')[:20]
    
    if not viewed_properties:
        return get_popular_properties(limit)
    
    # Analyze user's viewing patterns
    viewed_property_list = [vp.property for vp in viewed_properties]
    
    # Get common characteristics from user's viewing history
    common_cities = list(set([p.city for p in viewed_property_list if p.city]))
    common_property_types = list(set([p.property_type for p in viewed_property_list if p.property_type]))
    
    # Calculate average price range from user's views
    prices = [p.rent_price for p in viewed_property_list if p.rent_price]
    if prices:
        avg_price = sum(prices) / len(prices)
        min_price = avg_price * 0.7  # 30% below average
        max_price = avg_price * 1.3  # 30% above average
    else:
        min_price = None
        max_price = None
    
    # Build recommendation query based on user patterns
    queryset = Property.objects.filter(
        verification_status='verified',
        status='available'
    ).exclude(
        id__in=[p.id for p in viewed_property_list]  # Exclude already viewed
    )
    
    # Apply user preference filters
    filters = Q()
    if common_cities:
        city_filter = Q(city__in=common_cities)
        filters |= city_filter
    
    if common_property_types:
        type_filter = Q(property_type__in=common_property_types)
        filters |= type_filter
    
    if filters:
        queryset = queryset.filter(filters)
    
    # Apply price range if available
    if min_price is not None and max_price is not None:
        queryset = queryset.filter(rent_price__gte=min_price, rent_price__lte=max_price)
    
    # Order by relevance to user preferences
    queryset = queryset.order_by('-view_count', '-rating', '-favorite_count')
    
    return list(queryset[:limit])


def get_average_price_properties(limit=3):
    """
    4. Average Price Property
    Properties priced around the average market price.
    Used for: Showing good value options, Users who don't want very cheap or very expensive rooms
    """
    # Calculate average price for available verified properties
    avg_price_data = Property.objects.filter(
        verification_status='verified',
        status='available',
        rent_price__gt=0
    ).aggregate(
        avg_price=Avg('rent_price')
    )
    
    if not avg_price_data['avg_price']:
        return get_popular_properties(limit)
    
    avg_price = float(avg_price_data['avg_price'])
    min_price = avg_price * 0.7  # 30% below average
    max_price = avg_price * 1.3  # 30% above average
    
    # Get properties around the average price range
    return list(Property.objects.filter(
        verification_status='verified',
        status='available',
        rent_price__gte=min_price,
        rent_price__lte=max_price
    ).order_by('-rating', '-view_count', '-favorite_count')[:limit])


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
