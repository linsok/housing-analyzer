from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, MessageViewSet
from .renter_views import RenterDashboardViewSet

# Regular booking routes
router = DefaultRouter()
router.register(r'', BookingViewSet, basename='booking')
router.register(r'messages', MessageViewSet, basename='message')

# Renter dashboard routes
renter_router = DefaultRouter()
renter_router.register(r'renter', RenterDashboardViewSet, basename='renter-dashboard')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(renter_router.urls)),
]
