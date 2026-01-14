from django.db.models import Q, Count, Avg, F
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.utils import timezone
from datetime import timedelta
from .models import Property, PropertyView, Favorite

class PropertyRecommender:
    def __init__(self, user=None):
        self.user = user
    
    def get_recommendations(self, limit=10, **filters):
        """
        Get property recommendations based on user preferences and behavior
        """
        # Start with all active properties
        queryset = Property.objects.filter(
            status='available',
            verification_status='verified'
        )
        
        # Apply filters if any
        if filters:
            queryset = queryset.filter(**filters)
        
        # If user is authenticated, personalize recommendations
        if self.user and self.user.is_authenticated:
            return self.get_personalized_recommendations(queryset, limit)
        
        # For anonymous users, return popular properties
        return self.get_popular_properties(queryset, limit)
    
    def get_personalized_recommendations(self, queryset, limit):
        """
        Get personalized property recommendations based on user preferences and behavior
        """
        from users.models import UserPreference
        
        recommendations = []
        
        # 1. Get user preferences if they exist
        preferences = None
        try:
            preferences = self.user.preferences
        except UserPreference.DoesNotExist:
            pass
        
        # 2. Get user's viewed properties (for content-based filtering)
        viewed_properties = set(PropertyView.objects.filter(
            user=self.user
        ).values_list('property_id', flat=True))
        
        # 3. Get user's favorite properties (for collaborative filtering)
        favorite_properties = set(Favorite.objects.filter(
            user=self.user
        ).values_list('property_id', flat=True))
        
        # 4. Create a base queryset with annotations for scoring
        base_qs = queryset.annotate(
            popularity_score=Count('views', distinct=True) + Count('favorited_by', distinct=True) * 2,
            recency_score=Count('id', filter=Q(created_at__gte=timezone.now() - timedelta(days=30)))
        )
        
        # 5. Apply preference filters if available
        if preferences:
            # Filter by preferred cities/areas
            if preferences.preferred_cities:
                base_qs = base_qs.filter(city__in=preferences.preferred_cities)
            
            # Filter by price range
            if preferences.min_price is not None:
                base_qs = base_qs.filter(rent_price__gte=preferences.min_price)
            if preferences.max_price is not None:
                base_qs = base_qs.filter(rent_price__lte=preferences.max_price)
            
            # Filter by property type
            if preferences.property_types:
                base_qs = base_qs.filter(property_type__in=preferences.property_types)
            
            # Filter by furnished status
            if preferences.furnished is not None:
                base_qs = base_qs.filter(is_furnished=preferences.furnished)
            
            # Filter by required facilities
            if preferences.required_facilities:
                for facility in preferences.required_facilities:
                    base_qs = base_qs.filter(facilities__contains=[facility])
        
        # 6. Exclude already viewed properties
        if viewed_properties:
            base_qs = base_qs.exclude(id__in=viewed_properties)
        
        # 7. Get similar properties based on favorites (collaborative filtering)
        if favorite_properties:
            # Find users who favorited the same properties
            similar_users = Favorite.objects.filter(
                property_id__in=favorite_properties
            ).exclude(user=self.user).values_list('user_id', flat=True).distinct()
            
            if similar_users:
                # Get properties favorited by similar users
                similar_properties = Favorite.objects.filter(
                    user_id__in=similar_users
                ).exclude(
                    property_id__in=favorite_properties | viewed_properties
                ).values('property').annotate(
                    score=Count('user')
                ).order_by('-score')[:limit*2]
                
                if similar_properties:
                    property_ids = [p['property'] for p in similar_properties]
                    recommendations = list(Property.objects.filter(
                        id__in=property_ids
                    ).annotate(
                        score=F('popularity_score') * 0.5 + F('recency_score') * 0.5
                    ).order_by('-score')[:limit])
        
        # 8. If not enough recommendations, add popular properties
        if len(recommendations) < limit:
            remaining = limit - len(recommendations)
            popular = base_qs.exclude(
                id__in=[p.id for p in recommendations]
            ).order_by(
                '-popularity_score', '-recency_score'
            )[:remaining]
            
            for prop in popular:
                if prop not in recommendations:
                    recommendations.append(prop)
        
        return recommendations[:limit]
    
    def get_popular_properties(self, queryset, limit):
        """
        Get popular properties for anonymous users or when personalization is not possible
        """
        return queryset.annotate(
            popularity=Count('views', distinct=True) + Count('favorited_by', distinct=True) * 2
        ).order_by('-popularity', '-created_at')[:limit]
    
    def get_similar_properties(self, property_id, limit=5):
        """
        Get properties similar to the given property
        """
        try:
            target = Property.objects.get(id=property_id)
            
            # Find similar properties in the same area and price range
            similar = Property.objects.filter(
                city=target.city,
                property_type=target.property_type,
                rent_price__gte=target.rent_price * 0.7,
                rent_price__lte=target.rent_price * 1.3,
                status='available',
                verification_status='verified'
            ).exclude(id=property_id)
            
            # If we have location data, prioritize nearby properties
            if target.latitude and target.longitude:
                point = Point(target.longitude, target.latitude, srid=4326)
                similar = similar.annotate(
                    distance=Distance('location', point)
                ).order_by('distance')
            
            # Add some randomness to the results
            similar = similar.order_by('?')[:limit*2]
            
            # Sort by similarity score (simplified)
            return sorted(
                similar,
                key=lambda p: (
                    p.property_type == target.property_type,
                    p.bedrooms == target.bedrooms,
                    p.bathrooms == target.bathrooms,
                    -p.view_count
                ),
                reverse=True
            )[:limit]
            
        except Property.DoesNotExist:
            return Property.objects.none()
