from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'', BookingViewSet, basename='booking')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]
