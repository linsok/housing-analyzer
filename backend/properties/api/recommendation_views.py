from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from ..models import Property
from ..serializers import PropertySerializer
from ..recommendations import PropertyRecommender


class RecommendationPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class RecommendationView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = RecommendationPagination
    
    def get(self, request, format=None):
        recommender = PropertyRecommender(user=request.user)
        
        # Get filter parameters
        filters = {}
        
        # Apply filters from query parameters
        filter_mapping = {
            'city': 'city__iexact',
            'min_price': 'rent_price__gte',
            'max_price': 'rent_price__lte',
            'property_type': 'property_type__iexact',
            'bedrooms': 'bedrooms',
            'bathrooms': 'bathrooms',
            'is_furnished': 'is_furnished',
        }
        
        for param, field in filter_mapping.items():
            value = request.query_params.get(param)
            if value is not None and value != '':
                # Handle boolean values
                if value.lower() in ('true', 'false'):
                    filters[field] = value.lower() == 'true'
                else:
                    filters[field] = value
        
        # Get recommendations
        limit = min(int(request.query_params.get('limit', 20)), 50)
        recommended_properties = recommender.get_recommendations(limit=limit, **filters)
        
        # Paginate results
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(recommended_properties, request)
        
        if page is not None:
            serializer = PropertySerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        serializer = PropertySerializer(recommended_properties, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class SimilarPropertiesView(APIView):
    """
    Get properties similar to a specific property
    """
    def get(self, request, property_id, format=None):
        try:
            property = Property.objects.get(id=property_id, status='available')
            recommender = PropertyRecommender()
            similar_properties = recommender.get_similar_properties(property_id, limit=5)
            serializer = PropertySerializer(
                similar_properties, 
                many=True, 
                context={'request': request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found or not available"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class PopularPropertiesView(APIView):
    """
    Get popular properties (for anonymous users or fallback)
    """
    pagination_class = RecommendationPagination
    
    def get(self, request, format=None):
        recommender = PropertyRecommender()
        limit = min(int(request.query_params.get('limit', 20)), 50)
        popular_properties = recommender.get_popular_properties(
            Property.objects.filter(status='available', verification_status='verified'),
            limit=limit
        )
        
        # Paginate results
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(popular_properties, request)
        
        if page is not None:
            serializer = PropertySerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        serializer = PropertySerializer(popular_properties, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
