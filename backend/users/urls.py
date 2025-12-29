from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, UserPreferenceViewSet, EmailTokenObtainPairView, PublicAuthViewSet
from .api.urls import router as api_router

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'preferences', UserPreferenceViewSet, basename='preference')

# Public auth router (no authentication required)
public_router = DefaultRouter()
public_router.register(r'public', PublicAuthViewSet, basename='public-auth')

# Include API URLs
urlpatterns = [
    path('', include(router.urls)),
    path('api/', include(api_router.urls)),
    path('token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Public auth endpoints
    path('forgot_password/', PublicAuthViewSet.as_view({'post': 'forgot_password'}), name='forgot_password'),
    path('verify_otp/', PublicAuthViewSet.as_view({'post': 'verify_otp'}), name='verify_otp'),
    path('reset_password/', PublicAuthViewSet.as_view({'post': 'reset_password'}), name='reset_password'),
]

# If we want to include the API browser in development
# from rest_framework.schemas import get_schema_view
# from rest_framework.documentation import include_docs_urls
# 
# urlpatterns += [
#     path('api/schema/', get_schema_view(
#         title="Housing API",
#         description="API for the Housing Platform",
#         version="1.0.0"
#     ), name='openapi-schema'),
#     path('api/docs/', include_docs_urls(title='Housing API Documentation')),
# ]
