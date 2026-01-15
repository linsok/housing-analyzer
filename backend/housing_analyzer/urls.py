"""
URL configuration for housing_analyzer project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse, HttpResponse, Http404
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.management import call_command
import os
from payments.health_check import health_check
from payments.test_media import test_media_serving

def serve_media(request, path):
    """Serve media files in production"""
    import mimetypes
    from django.conf import settings
    
    # Construct the full file path
    full_path = os.path.join(settings.MEDIA_ROOT, path)
    
    # Security check - ensure the path is within MEDIA_ROOT
    if not os.path.abspath(full_path).startswith(os.path.abspath(settings.MEDIA_ROOT)):
        raise Http404("File not found")
    
    # Check if file exists
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise Http404("File not found")
    
    # Determine MIME type
    mime_type, _ = mimetypes.guess_type(full_path)
    if mime_type is None:
        mime_type = 'application/octet-stream'
    
    # Serve the file
    with open(full_path, 'rb') as f:
        response = HttpResponse(f.read(), content_type=mime_type)
    
    # Set cache headers
    response['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
    response['Access-Control-Allow-Origin'] = '*'  # Allow CORS for images
    
    return response

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

@csrf_exempt
def debug_media(request):
    try:
        from django.conf import settings
        import os
        from properties.models import PropertyImage
        
        media_root = settings.MEDIA_ROOT
        media_url = settings.MEDIA_URL
        
        # Check if media directory exists
        media_exists = os.path.exists(media_root)
        
        # Get all property images
        images = PropertyImage.objects.all()
        image_list = []
        
        for img in images:
            img_path = os.path.join(media_root, img.image.name) if img.image else None
            file_exists = os.path.exists(img_path) if img_path else False
            
            image_list.append({
                'id': img.id,
                'property': img.property.title,
                'filename': img.image.name if img.image else None,
                'full_path': img_path,
                'file_exists': file_exists,
                'url': img.image.url if img.image else None
            })
        
        return JsonResponse({
            'media_root': media_root,
            'media_url': media_url,
            'media_directory_exists': media_exists,
            'images': image_list
        })
    except Exception as e:
        return JsonResponse({'error': str(e)})

@csrf_exempt
def test_media(request):
    """Simple test to check if media files are accessible"""
    try:
        from django.conf import settings
        import os
        
        # Check if media directory exists
        media_root = settings.MEDIA_ROOT
        media_exists = os.path.exists(media_root)
        
        # List files in media directory
        media_files = []
        if media_exists:
            for root, dirs, files in os.walk(media_root):
                for file in files:
                    if file.endswith(('.jpg', '.jpeg', '.png', '.gif')):
                        rel_path = os.path.relpath(file, media_root)
                        full_url = f"https://web-production-6f713.up.railway.app/media/{rel_path}"
                        media_files.append({
                            'filename': file,
                            'relative_path': rel_path,
                            'full_url': full_url,
                            'exists': True
                        })
        
        return JsonResponse({
            'media_root': str(media_root),
            'media_url': settings.MEDIA_URL,
            'media_exists': media_exists,
            'media_files': media_files[:10]  # Limit to first 10 files
        })
    except Exception as e:
        return JsonResponse({'error': str(e)})

@csrf_exempt
def fix_property_images(request):
    """Fix property image references to match existing media files"""
    if request.method == 'POST':
        try:
            # Import and run the fix script
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.abspath(__file__)))
            
            from fix_property_images import fix_property_images as run_fix
            run_fix()
            
            return JsonResponse({'status': 'success', 'message': 'Property images fixed successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'POST request required'})

@csrf_exempt
def upload_sample_images(request):
    """Upload sample property images for testing"""
    try:
        from django.core.files.base import ContentFile
        from properties.models import PropertyImage, Property
        import requests
        
        # Get first property
        property = Property.objects.first()
        if not property:
            return JsonResponse({'error': 'No properties found'})
        
        # Sample image URLs
        sample_images = [
            {
                'filename': 'property1.jpg',
                'url': 'https://picsum.photos/400/300?random=1'
            },
            {
                'filename': 'property2.jpg', 
                'url': 'https://picsum.photos/400/300?random=2'
            },
            {
                'filename': 'property3.jpg',
                'url': 'https://picsum.photos/400/300?random=3'
            }
        ]
        
        uploaded_images = []
        
        for i, img_data in enumerate(sample_images):
            # Download image
            response = requests.get(img_data['url'])
            if response.status_code == 200:
                # Create ContentFile
                image_content = ContentFile(response.content, img_data['filename'])
                
                # Save to property image
                property_image = PropertyImage.objects.create(
                    property=property,
                    image=image_content,
                    caption=f'Sample property image {i+1}',
                    is_primary=(i == 0),  # First image is primary
                    order=i
                )
                
                uploaded_images.append({
                    'id': property_image.id,
                    'filename': img_data['filename'],
                    'url': property_image.image.url if property_image.image else None
                })
        
        return JsonResponse({
            'success': True,
            'uploaded_images': uploaded_images
        })
    except Exception as e:
        return JsonResponse({'error': str(e)})

urlpatterns = [
    path('', api_info, name='api_info'),
    path('run-migrations/', run_migrations, name='run_migrations'),
    path('create-superuser/', create_superuser, name='create_superuser'),
    path('check-users/', check_users, name='check_users'),
    path('debug-auth/', debug_auth, name='debug_auth'),
    path('debug-media/', debug_media, name='debug_media'),
    path('test-media/', test_media, name='test_media'),
    path('fix-property-images/', fix_property_images, name='fix_property_images'),
    path('upload-sample-images/', upload_sample_images, name='upload_sample_images'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/properties/', include('properties.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('test-media-serving/', test_media_serving, name='test_media_serving'),
    path('health/', health_check, name='health_check'),
]

# Add media serving for production
if not settings.DEBUG:
    urlpatterns += [
        path('media/<path:path>', serve_media, name='serve_media'),
    ]
else:
    # In development, use Django's built-in media serving
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
