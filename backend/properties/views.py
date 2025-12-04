from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Avg
from .models import Property, PropertyImage, Favorite, PropertyView, Report
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer, PropertyCreateUpdateSerializer,
    PropertyImageSerializer, FavoriteSerializer, ReportSerializer, PropertyVerificationSerializer
)
from .filters import PropertyFilter


class PropertyViewSet(viewsets.ModelViewSet):
    """ViewSet for property management"""
    queryset = Property.objects.select_related('owner').prefetch_related('images')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'description', 'city', 'area', 'address']
    ordering_fields = ['rent_price', 'created_at', 'rating', 'view_count']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PropertyCreateUpdateSerializer
        return PropertyDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by owner for 'my_properties' action
        if self.action == 'my_properties':
            return queryset.filter(owner=self.request.user)
        
        # Show only verified properties for non-owners
        if not self.request.user.is_authenticated or self.request.user.role != 'owner':
            queryset = queryset.filter(verification_status='verified')
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Get property detail and track view"""
        instance = self.get_object()
        
        # Track view
        PropertyView.objects.create(
            property=instance,
            user=request.user if request.user.is_authenticated else None,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Increment view count
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @action(detail=False, methods=['get'])
    def my_properties(self, request):
        """Get current user's properties"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = PropertyListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PropertyListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        """Upload images for a property"""
        property_obj = self.get_object()
        
        if property_obj.owner != request.user:
            return Response(
                {'error': 'You can only upload images to your own properties'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        images = request.FILES.getlist('images')
        if not images:
            return Response(
                {'error': 'No images provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_images = []
        for idx, image in enumerate(images):
            property_image = PropertyImage.objects.create(
                property=property_obj,
                image=image,
                order=idx,
                is_primary=(idx == 0 and not property_obj.images.exists())
            )
            created_images.append(property_image)
        
        serializer = PropertyImageSerializer(created_images, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """Add or remove property from favorites"""
        property_obj = self.get_object()
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            property=property_obj
        )
        
        if not created:
            favorite.delete()
            property_obj.favorite_count = max(0, property_obj.favorite_count - 1)
            property_obj.save(update_fields=['favorite_count'])
            return Response({'message': 'Removed from favorites', 'is_favorited': False})
        
        property_obj.favorite_count += 1
        property_obj.save(update_fields=['favorite_count'])
        return Response({'message': 'Added to favorites', 'is_favorited': True})
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """Get user's favorite properties"""
        favorites = Favorite.objects.filter(user=request.user).select_related('property')
        page = self.paginate_queryset(favorites)
        
        if page is not None:
            serializer = FavoriteSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        """Admin verifies a property"""
        property_obj = self.get_object()
        serializer = PropertyVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        verification_status = serializer.validated_data['verification_status']
        property_obj.verification_status = verification_status
        
        if verification_status == 'verified':
            property_obj.verified_at = timezone.now()
            property_obj.verified_by = request.user
        
        property_obj.save()
        
        return Response({
            'message': f'Property {verification_status} successfully',
            'property': PropertyDetailSerializer(property_obj, context={'request': request}).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending_verifications(self, request):
        """Get all properties pending verification"""
        properties = Property.objects.filter(verification_status='pending')
        page = self.paginate_queryset(properties)
        
        if page is not None:
            serializer = PropertyListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PropertyListSerializer(properties, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Get recommended properties for user"""
        if not request.user.is_authenticated:
            # Return popular properties for anonymous users
            properties = Property.objects.filter(
                verification_status='verified',
                status='available'
            ).order_by('-rating', '-view_count')[:12]
        else:
            # Get recommendations based on user preferences
            from analytics.recommendation import get_recommendations
            properties = get_recommendations(request.user)
        
        serializer = PropertyListSerializer(properties, many=True, context={'request': request})
        return Response(serializer.data)


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for property reports"""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Report.objects.all()
        return Report.objects.filter(reported_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def review(self, request, pk=None):
        """Admin reviews a report"""
        report = self.get_object()
        
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')
        
        if new_status not in ['reviewing', 'resolved', 'dismissed']:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report.status = new_status
        report.admin_notes = admin_notes
        report.reviewed_by = request.user
        report.save()
        
        # If resolved, take action on property
        if new_status == 'resolved':
            property_obj = report.property
            property_obj.verification_status = 'rejected'
            property_obj.status = 'maintenance'
            property_obj.save()
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)
