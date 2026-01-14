class CustomCORSMiddleware:
    """
    Custom CORS middleware to handle all CORS scenarios
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add CORS headers to all responses
        response['Access-Control-Allow-Origin'] = self.get_origin(request)
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'
        
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response.status_code = 200
            response['Access-Control-Allow-Origin'] = self.get_origin(request)
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'
        
        return response
    
    def get_origin(self, request):
        origin = request.META.get('HTTP_ORIGIN')
        if origin:
            # Allow all Vercel and Railway domains
            allowed_origins = [
                'https://housing-analyzer.vercel.app',
                'https://housing-analyzer-git-main-soklins-projects-7e089e19.vercel.app',
                'https://housing-analyzer-mfj5pg7fz-soklins-projects-7e089e19.vercel.app',
                'https://web-production-6f713.up.railway.app',
                'http://localhost:3000',
                'http://localhost:5173',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:5173'
            ]
            
            if origin in allowed_origins or origin.endswith('.vercel.app') or origin.endswith('.railway.app'):
                return origin
            elif origin.startswith('http://localhost') or origin.startswith('http://127.0.0.1'):
                return origin
        
        return '*'
