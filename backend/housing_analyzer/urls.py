"""
URL configuration for housing_analyzer project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_info(request):
    return JsonResponse({
        'message': 'Housing & Rent Analyzer API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'auth': '/api/auth/',
            'properties': '/api/properties/',
            'bookings': '/api/bookings/',
            'analytics': '/api/analytics/',
            'payments': '/api/payments/',
            'reviews': '/api/reviews/',
        }
    })

urlpatterns = [
    path('', api_info, name='api_info'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/properties/', include('properties.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/reviews/', include('reviews.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
