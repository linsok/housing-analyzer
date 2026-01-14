from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import evaluation_views

router = DefaultRouter()
router.register(r'evaluations', evaluation_views.OwnerEvaluationViewSet, basename='owner-evaluation')
router.register(r'evaluation-metrics', evaluation_views.OwnerEvaluationMetricsViewSet, basename='evaluation-metrics')

urlpatterns = [
    path('', include(router.urls)),
]
