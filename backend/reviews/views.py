from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Review
from .serializers import ReviewSerializer, OwnerResponseSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for review management"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Review.objects.select_related('reviewer', 'property')
        
        # Filter by property if specified
        property_id = self.request.query_params.get('property')
        if property_id:
            queryset = queryset.filter(property_id=property_id)
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action == 'respond':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def perform_update(self, serializer):
        """Only allow users to update their own reviews"""
        if serializer.instance.reviewer != self.request.user:
            raise permissions.PermissionDenied("You can only update your own reviews")
        
        # Debug logging
        print(f"Updating review {serializer.instance.id}")
        print(f"User: {self.request.user}")
        print(f"Validated data: {serializer.validated_data}")
        print(f"Instance property: {serializer.instance.property}")
        
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Property owner responds to a review"""
        review = self.get_object()
        
        if review.property.owner != request.user:
            return Response(
                {'error': 'Only property owner can respond to reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = OwnerResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        review.owner_response = serializer.validated_data['owner_response']
        review.responded_at = timezone.now()
        review.save()
        
        return Response(ReviewSerializer(review, context={'request': request}).data)
