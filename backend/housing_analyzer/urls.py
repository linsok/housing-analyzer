"""
URL configuration for housing_analyzer project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.core.management import call_command
from django.views.decorators.csrf import csrf_exempt
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

@csrf_exempt
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

@csrf_exempt
def create_superuser(request):
    if request.method == 'POST':
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # Check if user exists
            if User.objects.filter(username='admin').exists():
                user = User.objects.get(username='admin')
                return JsonResponse({
                    'status': 'info', 
                    'message': 'Superuser already exists',
                    'username': user.username,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'is_active': user.is_active
                })
            else:
                # Create superuser
                user = User.objects.create_superuser('admin', 'admin@housinganalyzer.com', 'admin123')
                return JsonResponse({
                    'status': 'success', 
                    'message': 'Superuser created: admin/admin123',
                    'username': user.username,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'is_active': user.is_active
                })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'POST request required'})

@csrf_exempt
def check_users(request):
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        users = User.objects.all()
        user_list = []
        for user in users:
            user_list.append({
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_active': user.is_active
            })
        return JsonResponse({'users': user_list})
    except Exception as e:
        return JsonResponse({'error': str(e)})

@csrf_exempt
def debug_auth(request):
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if hasattr(request, 'user') and request.user.is_authenticated:
            return JsonResponse({
                'authenticated': True,
                'user': {
                    'username': request.user.username,
                    'email': request.user.email,
                    'is_staff': request.user.is_staff,
                    'is_active': request.user.is_active
                }
            })
        else:
            return JsonResponse({
                'authenticated': False,
                'message': 'User not authenticated'
            })
    except Exception as e:
        return JsonResponse({'error': str(e)})

urlpatterns = [
    path('', api_info, name='api_info'),
    path('run-migrations/', run_migrations, name='run_migrations'),
    path('create-superuser/', create_superuser, name='create_superuser'),
    path('check-users/', check_users, name='check_users'),
    path('debug-auth/', debug_auth, name='debug_auth'),
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
