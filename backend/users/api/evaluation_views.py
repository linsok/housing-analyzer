from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from django.contrib.auth import get_user_model

from ..models_evaluation import OwnerEvaluation
from .serializers import OwnerEvaluationSerializer, OwnerEvaluationCreateSerializer

User = get_user_model()

class OwnerEvaluationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing owner evaluations.
    """
    queryset = OwnerEvaluation.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return OwnerEvaluationCreateSerializer
        return OwnerEvaluationSerializer
    
    def get_queryset(self):
        """
        Filter evaluations based on user role and permissions.
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Admins can see all evaluations
        if user.is_staff or user.role == 'admin':
            return queryset.select_related('owner', 'evaluated_by', 'reviewed_by')
        
        # Property owners can see their own evaluations
        if user.role == 'owner':
            return queryset.filter(owner=user).select_related('evaluated_by', 'reviewed_by')
        
        # Regular users can only see their own evaluations if they made them
        return queryset.filter(evaluated_by=user).select_related('owner', 'reviewed_by')
    
    def perform_create(self, serializer):
        """Set the evaluator to the current user when creating an evaluation."""
        serializer.save(evaluated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_evaluations(self, request):
        """Get evaluations created by the current user."""
        queryset = self.get_queryset().filter(evaluated_by=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an evaluation (admin only)."""
        if not request.user.is_staff and request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can approve evaluations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        evaluation = self.get_object()
        evaluation.is_approved = True
        evaluation.reviewed_by = request.user
        evaluation.save()
        
        serializer = self.get_serializer(evaluation)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path=r'owner/(?P<owner_id>\d+)')
    def owner_evaluations(self, request, owner_id=None):
        """Get all evaluations for a specific owner."""
        try:
            owner = User.objects.get(id=owner_id, role='owner')
        except User.DoesNotExist:
            return Response(
                {'detail': 'Owner not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        queryset = self.get_queryset().filter(owner=owner, is_approved=True)
        
        # Calculate average rating
        avg_rating = queryset.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        
        # Get rating distribution
        rating_distribution = queryset.values('rating').annotate(count=Count('id')).order_by('rating')
        
        # Get evaluations with pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['average_rating'] = round(avg_rating, 2)
            response.data['rating_distribution'] = rating_distribution
            return response
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'average_rating': round(avg_rating, 2),
            'rating_distribution': rating_distribution
        })
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary statistics for evaluations."""
        if not request.user.is_staff and request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can view evaluation summaries.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Total evaluations
        total_evaluations = OwnerEvaluation.objects.count()
        
        # Average rating
        avg_rating = OwnerEvaluation.objects.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        
        # Evaluations by status
        evaluations_by_status = OwnerEvaluation.objects.values('is_approved').annotate(
            count=Count('id')
        ).order_by('is_approved')
        
        # Rating distribution
        rating_distribution = OwnerEvaluation.objects.values('rating').annotate(
            count=Count('id')
        ).order_by('rating')
        
        # Evaluations over time (last 12 months)
        from django.db.models.functions import TruncMonth
        from django.utils import timezone
        from datetime import timedelta
        
        twelve_months_ago = timezone.now() - timedelta(days=365)
        evaluations_over_time = OwnerEvaluation.objects.filter(
            created_at__gte=twelve_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        return Response({
            'total_evaluations': total_evaluations,
            'average_rating': round(avg_rating, 2),
            'evaluations_by_status': {
                'approved': evaluations_by_status.filter(is_approved=True).first()['count'] if evaluations_by_status.filter(is_approved=True).exists() else 0,
                'pending': evaluations_by_status.filter(is_approved=False).first()['count'] if evaluations_by_status.filter(is_approved=False).exists() else 0,
            },
            'rating_distribution': rating_distribution,
            'evaluations_over_time': evaluations_over_time,
        })


class OwnerEvaluationMetricsViewSet(viewsets.ViewSet):
    """
    API endpoint for retrieving owner evaluation metrics.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """Get evaluation metrics for the current user if they're an owner."""
        if request.user.role != 'owner':
            return Response(
                {'detail': 'Only property owners can view evaluation metrics.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get approved evaluations for the current user
        evaluations = OwnerEvaluation.objects.filter(
            owner=request.user,
            is_approved=True
        )
        
        # Calculate metrics
        metrics = {
            'total_evaluations': evaluations.count(),
            'average_rating': evaluations.aggregate(avg=Avg('rating'))['avg'] or 0,
            'rating_distribution': evaluations.values('rating').annotate(count=Count('id')).order_by('rating'),
            'average_response_time': evaluations.aggregate(avg=Avg('response_time'))['avg'] or 0,
            'average_property_quality': evaluations.aggregate(avg=Avg('property_quality'))['avg'] or 0,
            'average_communication': evaluations.aggregate(avg=Avg('communication'))['avg'] or 0,
            'average_reliability': evaluations.aggregate(avg=Avg('reliability'))['avg'] or 0,
            'recent_evaluations': OwnerEvaluationSerializer(
                evaluations.order_by('-created_at')[:5], 
                many=True
            ).data
        }
        
        # Calculate percentile rank for each metric compared to other owners
        from django.db.models import F, Window, functions as Fn
        from django.db.models.functions import DenseRank, Coalesce
        
        # Get all owners with their average ratings
        owner_ratings = User.objects.filter(
            role='owner',
            evaluations_received__is_approved=True
        ).annotate(
            avg_rating=Coalesce(Avg('evaluations_received__rating'), 0.0),
            avg_response=Coalesce(Avg('evaluations_received__response_time'), 0.0),
            avg_quality=Coalesce(Avg('evaluations_received__property_quality'), 0.0),
            avg_comm=Coalesce(Avg('evaluations_received__communication'), 0.0),
            avg_reliability=Coalesce(Avg('evaluations_received__reliability'), 0.0),
        ).annotate(
            rating_rank=Window(
                expression=DenseRank(),
                order_by=F('avg_rating').desc()
            ),
            response_rank=Window(
                expression=DenseRank(),
                order_by=F('avg_response').desc()
            ),
            quality_rank=Window(
                expression=DenseRank(),
                order_by=F('avg_quality').desc()
            ),
            comm_rank=Window(
                expression=DenseRank(),
                order_by=F('avg_comm').desc()
            ),
            reliability_rank=Window(
                expression=DenseRank(),
                order_by=F('avg_reliability').desc()
            ),
            total_owners=Window(
                expression=Fn.Count('id')
            )
        ).values(
            'id',
            'avg_rating',
            'avg_response',
            'avg_quality',
            'avg_comm',
            'avg_reliability',
            'rating_rank',
            'response_rank',
            'quality_rank',
            'comm_rank',
            'reliability_rank',
            'total_owners'
        )
        
        # Find the current owner's metrics
        owner_metrics = next(
            (m for m in owner_ratings if m['id'] == request.user.id),
            None
        )
        
        if owner_metrics:
            metrics.update({
                'percentile_rank': {
                    'rating': self._calculate_percentile(
                        owner_metrics['rating_rank'],
                        owner_metrics['total_owners']
                    ),
                    'response_time': self._calculate_percentile(
                        owner_metrics['response_rank'],
                        owner_metrics['total_owners']
                    ),
                    'property_quality': self._calculate_percentile(
                        owner_metrics['quality_rank'],
                        owner_metrics['total_owners']
                    ),
                    'communication': self._calculate_percentile(
                        owner_metrics['comm_rank'],
                        owner_metrics['total_owners']
                    ),
                    'reliability': self._calculate_percentile(
                        owner_metrics['reliability_rank'],
                        owner_metrics['total_owners']
                    ),
                },
                'overall_percentile': self._calculate_percentile(
                    owner_metrics['rating_rank'],
                    owner_metrics['total_owners']
                )
            })
        
        return Response(metrics)
    
    def _calculate_percentile(self, rank, total):
        """Calculate the percentile rank (0-100)."""
        if total <= 1:
            return 100
        return round(((total - rank) / (total - 1)) * 100, 2)
