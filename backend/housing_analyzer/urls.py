"""
URL configuration for housing_analyzer project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.core.management import call_command
import os

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

def run_migrations(request):
    if request.method == 'POST':
        try:
            call_command('makemigrations', interactive=False)
            call_command('migrate', interactive=False)
            call_command('collectstatic', interactive=False)
            return JsonResponse({'status': 'success', 'message': 'Migrations completed successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'POST request required'})

def create_superuser(request):
    if request.method == 'POST':
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            if not User.objects.filter(username='admin').exists():
                User.objects.create_superuser('admin', 'admin@housinganalyzer.com', 'admin123')
                return JsonResponse({'status': 'success', 'message': 'Superuser created: admin/admin123'})
            else:
                return JsonResponse({'status': 'info', 'message': 'Superuser already exists'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'POST request required'})

urlpatterns = [
    path('', api_info, name='api_info'),
    path('run-migrations/', run_migrations, name='run_migrations'),
    path('create-superuser/', create_superuser, name='create_superuser'),
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
