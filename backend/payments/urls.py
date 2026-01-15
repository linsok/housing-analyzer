from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet
from .test_views import public_test_bakong

router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('test-bakong/', public_test_bakong, name='public_test_bakong'),
]
