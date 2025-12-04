from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserViewSet, UserPreferenceViewSet
from .api.urls import router as api_router

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'preferences', UserPreferenceViewSet, basename='preference')

# Include API URLs
urlpatterns = [
    path('', include(router.urls)),
    path('api/', include(api_router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
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
