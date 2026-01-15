"""
Test media file serving
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.conf import settings
import os

@require_http_methods(["GET"])
def test_media_serving(request):
    """Test if media files are being served correctly"""
    try:
        media_root = settings.MEDIA_ROOT
        media_url = settings.MEDIA_URL
        
        # Check if media directory exists
        media_exists = os.path.exists(media_root)
        
        # List some files in media directory
        media_files = []
        if media_exists:
            for root, dirs, files in os.walk(media_root):
                for file in files[:10]:  # Limit to first 10 files
                    rel_path = os.path.relpath(os.path.join(root, file), media_root)
                    media_files.append({
                        'file': rel_path,
                        'url': media_url + rel_path.replace('\\', '/'),
                        'exists': os.path.exists(os.path.join(root, file))
                    })
        
        return JsonResponse({
            'success': True,
            'media_root': str(media_root),
            'media_url': media_url,
            'media_exists': media_exists,
            'media_files': media_files,
            'debug_info': {
                'DEBUG': settings.DEBUG,
                'RAILWAY_PUBLIC_DOMAIN': os.getenv('RAILWAY_PUBLIC_DOMAIN'),
                'environment': 'production' if not settings.DEBUG else 'development'
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
