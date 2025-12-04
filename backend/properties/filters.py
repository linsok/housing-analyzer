import django_filters
from .models import Property


class PropertyFilter(django_filters.FilterSet):
    """Advanced filtering for properties"""
    
    # Price range
    min_price = django_filters.NumberFilter(field_name='rent_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='rent_price', lookup_expr='lte')
    
    # Location
    city = django_filters.CharFilter(lookup_expr='iexact')
    area = django_filters.CharFilter(lookup_expr='icontains')
    
    # Property details
    min_bedrooms = django_filters.NumberFilter(field_name='bedrooms', lookup_expr='gte')
    max_bedrooms = django_filters.NumberFilter(field_name='bedrooms', lookup_expr='lte')
    min_bathrooms = django_filters.NumberFilter(field_name='bathrooms', lookup_expr='gte')
    
    # Features
    is_furnished = django_filters.BooleanFilter()
    pets_allowed = django_filters.BooleanFilter()
    
    # Status
    status = django_filters.CharFilter()
    property_type = django_filters.CharFilter()
    
    class Meta:
        model = Property
        fields = [
            'property_type', 'city', 'status', 'is_furnished',
            'pets_allowed', 'bedrooms', 'bathrooms'
        ]
