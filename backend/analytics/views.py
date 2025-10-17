from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Avg, Count, Min, Max, Q, Sum, F
from django.db.models.functions import TruncMonth, TruncDate, TruncYear
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from properties.models import Property, PropertyView
from bookings.models import Booking
from .models import RentTrend
from decimal import Decimal


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def rent_trends(request):
    """Get rent trends by city and property type"""
    city = request.query_params.get('city')
    property_type = request.query_params.get('property_type')
    months = int(request.query_params.get('months', 6))
    
    # Calculate trends
    queryset = Property.objects.filter(verification_status='verified')
    
    if city:
        queryset = queryset.filter(city=city)
    if property_type:
        queryset = queryset.filter(property_type=property_type)
    
    # Get statistics by month
    trends = queryset.annotate(
        month=TruncMonth('created_at')
    ).values('month', 'city', 'property_type').annotate(
        avg_rent=Avg('rent_price'),
        min_rent=Min('rent_price'),
        max_rent=Max('rent_price'),
        count=Count('id')
    ).order_by('-month')[:months]
    
    return Response(list(trends))


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def city_comparison(request):
    """Compare rent prices across cities"""
    cities = request.query_params.getlist('cities')
    property_type = request.query_params.get('property_type')
    
    queryset = Property.objects.filter(verification_status='verified', status='available')
    
    if property_type:
        queryset = queryset.filter(property_type=property_type)
    
    if cities:
        queryset = queryset.filter(city__in=cities)
    
    # Get statistics by city
    comparison = queryset.values('city').annotate(
        avg_rent=Avg('rent_price'),
        min_rent=Min('rent_price'),
        max_rent=Max('rent_price'),
        property_count=Count('id')
    ).order_by('-avg_rent')
    
    return Response(list(comparison))


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def popular_areas(request):
    """Get most popular areas based on property count and demand"""
    city = request.query_params.get('city')
    
    queryset = Property.objects.filter(verification_status='verified')
    
    if city:
        queryset = queryset.filter(city=city)
    
    # Get statistics by area
    areas = queryset.values('city', 'area').annotate(
        property_count=Count('id'),
        avg_rent=Avg('rent_price'),
        avg_rating=Avg('rating'),
        total_views=Count('views')
    ).order_by('-property_count', '-total_views')[:20]
    
    return Response(list(areas))


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def property_demand(request):
    """Analyze property demand by type and features"""
    
    # Demand by property type
    by_type = Property.objects.filter(
        verification_status='verified'
    ).values('property_type').annotate(
        count=Count('id'),
        avg_views=Avg('view_count'),
        avg_favorites=Avg('favorite_count')
    ).order_by('-count')
    
    # Most wanted features
    all_properties = Property.objects.filter(verification_status='verified')
    
    # Count furnished vs unfurnished
    furnished_count = all_properties.filter(is_furnished=True).count()
    unfurnished_count = all_properties.filter(is_furnished=False).count()
    
    # Pets allowed
    pets_allowed_count = all_properties.filter(pets_allowed=True).count()
    
    return Response({
        'by_type': list(by_type),
        'features': {
            'furnished': furnished_count,
            'unfurnished': unfurnished_count,
            'pets_allowed': pets_allowed_count,
            'total': all_properties.count()
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def owner_analytics(request):
    """Enhanced analytics for property owners with detailed metrics"""
    
    if request.user.role != 'owner':
        return Response({'error': 'Only property owners can access this endpoint'}, status=403)
    
    # Get owner's properties
    properties = Property.objects.filter(owner=request.user)
    
    # Overall statistics
    total_properties = properties.count()
    verified_properties = properties.filter(verification_status='verified').count()
    total_views = sum(p.view_count for p in properties)
    total_favorites = sum(p.favorite_count for p in properties)
    
    # Bookings
    bookings = Booking.objects.filter(property__owner=request.user)
    total_bookings = bookings.count()
    confirmed_bookings = bookings.filter(status='confirmed').count()
    pending_bookings = bookings.filter(status='pending').count()
    
    # Revenue (estimated)
    completed_bookings = bookings.filter(status='completed')
    total_revenue = sum(b.total_amount for b in completed_bookings)
    
    # Monthly guest/booking statistics (last 12 months)
    monthly_guests = []
    for i in range(12):
        month_start = (datetime.now() - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_bookings = bookings.filter(
            created_at__gte=month_start,
            created_at__lte=month_end
        )
        
        monthly_guests.insert(0, {
            'month': month_start.strftime('%b %Y'),
            'guests': month_bookings.filter(status__in=['confirmed', 'completed']).count(),
            'pending': month_bookings.filter(status='pending').count(),
            'revenue': float(sum(b.total_amount for b in month_bookings.filter(status='completed')))
        })
    
    # Yearly guest statistics (last 3 years)
    yearly_guests = []
    current_year = datetime.now().year
    for i in range(3):
        year = current_year - i
        year_bookings = bookings.filter(created_at__year=year)
        
        yearly_guests.insert(0, {
            'year': year,
            'guests': year_bookings.filter(status__in=['confirmed', 'completed']).count(),
            'revenue': float(sum(b.total_amount for b in year_bookings.filter(status='completed')))
        })
    
    # Property performance with detailed metrics
    property_performance = []
    for prop in properties:
        prop_bookings = bookings.filter(property=prop)
        property_performance.append({
            'id': prop.id,
            'title': prop.title,
            'views': prop.view_count,
            'favorites': prop.favorite_count,
            'rating': float(prop.rating),
            'bookings': prop_bookings.count(),
            'confirmed_bookings': prop_bookings.filter(status='confirmed').count(),
            'revenue': float(sum(b.total_amount for b in prop_bookings.filter(status='completed'))),
            'status': prop.status,
            'rent_price': float(prop.rent_price)
        })
    
    # Sort by views
    property_performance.sort(key=lambda x: x['views'], reverse=True)
    
    # Views trend (last 30 days)
    views_trend = []
    for i in range(30):
        date = datetime.now().date() - timedelta(days=29-i)
        daily_views = PropertyView.objects.filter(
            property__owner=request.user,
            viewed_at__date=date
        ).count()
        views_trend.append({
            'date': date.strftime('%Y-%m-%d'),
            'views': daily_views
        })
    
    # Market comparison - pricing by property type
    owner_city = properties.first().city if properties.exists() else None
    market_comparison = {}
    
    if owner_city:
        # City average by property type
        city_properties = Property.objects.filter(
            city=owner_city,
            verification_status='verified'
        )
        
        # Overall city average
        city_avg = city_properties.aggregate(avg_rent=Avg('rent_price'))
        owner_avg = properties.filter(verification_status='verified').aggregate(avg_rent=Avg('rent_price'))
        
        # By property type
        property_types = properties.values_list('property_type', flat=True).distinct()
        type_comparison = []
        
        for prop_type in property_types:
            city_type_avg = city_properties.filter(property_type=prop_type).aggregate(
                avg_rent=Avg('rent_price'),
                count=Count('id')
            )
            owner_type_avg = properties.filter(
                property_type=prop_type,
                verification_status='verified'
            ).aggregate(avg_rent=Avg('rent_price'))
            
            type_comparison.append({
                'property_type': prop_type,
                'your_avg': float(owner_type_avg['avg_rent'] or 0),
                'market_avg': float(city_type_avg['avg_rent'] or 0),
                'market_count': city_type_avg['count']
            })
        
        market_comparison = {
            'your_avg_rent': float(owner_avg['avg_rent'] or 0),
            'city_avg_rent': float(city_avg['avg_rent'] or 0),
            'by_type': type_comparison
        }
    else:
        market_comparison = {
            'your_avg_rent': 0,
            'city_avg_rent': 0,
            'by_type': []
        }
    
    # Competitor analysis - most popular properties in same city
    competitor_properties = []
    if owner_city:
        competitors = Property.objects.filter(
            city=owner_city,
            verification_status='verified'
        ).exclude(owner=request.user).order_by('-view_count', '-favorite_count')[:10]
        
        for comp in competitors:
            competitor_properties.append({
                'title': comp.title,
                'property_type': comp.property_type,
                'rent_price': float(comp.rent_price),
                'views': comp.view_count,
                'favorites': comp.favorite_count,
                'rating': float(comp.rating),
                'bedrooms': comp.bedrooms
            })
    
    # Occupancy rate
    total_days = 365
    occupied_days = bookings.filter(status__in=['confirmed', 'completed']).count() * 30  # Rough estimate
    occupancy_rate = (occupied_days / (total_days * max(total_properties, 1))) * 100 if total_properties > 0 else 0
    
    return Response({
        'overview': {
            'total_properties': total_properties,
            'verified_properties': verified_properties,
            'total_views': total_views,
            'total_favorites': total_favorites,
            'total_bookings': total_bookings,
            'confirmed_bookings': confirmed_bookings,
            'pending_bookings': pending_bookings,
            'total_revenue': float(total_revenue),
            'occupancy_rate': round(occupancy_rate, 2)
        },
        'monthly_guests': monthly_guests,
        'yearly_guests': yearly_guests,
        'views_trend': views_trend,
        'property_performance': property_performance,
        'pricing_comparison': market_comparison,
        'competitor_analysis': competitor_properties
    })


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_dashboard(request):
    """Analytics for admin dashboard with user activity charts"""
    
    # User statistics
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    total_users = User.objects.count()
    renters = User.objects.filter(role='renter').count()
    owners = User.objects.filter(role='owner').count()
    verified_owners = User.objects.filter(role='owner', verification_status='verified').count()
    pending_verifications = User.objects.filter(role='owner', verification_status='pending').count()
    
    # Property statistics
    total_properties = Property.objects.count()
    verified_properties = Property.objects.filter(verification_status='verified').count()
    pending_properties = Property.objects.filter(verification_status='pending').count()
    available_properties = Property.objects.filter(status='available').count()
    rented_properties = Property.objects.filter(status='rented').count()
    
    # Booking statistics
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status='pending').count()
    confirmed_bookings = Booking.objects.filter(status='confirmed').count()
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    new_users = User.objects.filter(created_at__gte=thirty_days_ago).count()
    new_properties = Property.objects.filter(created_at__gte=thirty_days_ago).count()
    new_bookings = Booking.objects.filter(created_at__gte=thirty_days_ago).count()
    
    # Reports
    from properties.models import Report
    pending_reports = Report.objects.filter(status='pending').count()
    
    # User Activity Analytics (Last 30 days)
    # User signups by day
    user_signups = []
    for i in range(30):
        date = datetime.now().date() - timedelta(days=29-i)
        count = User.objects.filter(created_at__date=date).count()
        user_signups.append({
            'date': date.strftime('%Y-%m-%d'),
            'signups': count
        })
    
    # User logins by day (using last_login field)
    user_logins = []
    for i in range(30):
        date = datetime.now().date() - timedelta(days=29-i)
        count = User.objects.filter(last_login__date=date).count()
        user_logins.append({
            'date': date.strftime('%Y-%m-%d'),
            'logins': count
        })
    
    # Active users (logged in within last 7 days)
    seven_days_ago = datetime.now() - timedelta(days=7)
    active_users = User.objects.filter(last_login__gte=seven_days_ago).count()
    
    # Active users by role
    active_by_role = {
        'renters': User.objects.filter(role='renter', last_login__gte=seven_days_ago).count(),
        'owners': User.objects.filter(role='owner', last_login__gte=seven_days_ago).count(),
        'admins': User.objects.filter(role='admin', last_login__gte=seven_days_ago).count(),
    }
    
    # User growth over last 6 months
    user_growth = []
    for i in range(6):
        month_start = (datetime.now() - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        count = User.objects.filter(created_at__gte=month_start, created_at__lte=month_end).count()
        user_growth.insert(0, {
            'month': month_start.strftime('%b %Y'),
            'users': count
        })
    
    return Response({
        'users': {
            'total': total_users,
            'renters': renters,
            'owners': owners,
            'verified_owners': verified_owners,
            'pending_verifications': pending_verifications,
            'new_last_30_days': new_users,
            'active_users': active_users,
            'active_by_role': active_by_role
        },
        'properties': {
            'total': total_properties,
            'verified': verified_properties,
            'pending': pending_properties,
            'available': available_properties,
            'rented': rented_properties,
            'new_last_30_days': new_properties
        },
        'bookings': {
            'total': total_bookings,
            'pending': pending_bookings,
            'confirmed': confirmed_bookings,
            'new_last_30_days': new_bookings
        },
        'reports': {
            'pending': pending_reports
        },
        'user_activity': {
            'signups_30_days': user_signups,
            'logins_30_days': user_logins,
            'growth_6_months': user_growth
        }
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def market_trends_comprehensive(request):
    """Comprehensive market trends with charts for all user roles"""
    
    user = request.user if request.user.is_authenticated else None
    user_role = user.role if user and hasattr(user, 'role') else 'guest'
    
    # Base queryset
    properties = Property.objects.filter(verification_status='verified')
    
    # 1. Price trends over time (last 6 months)
    six_months_ago = datetime.now() - timedelta(days=180)
    price_trends = properties.filter(
        created_at__gte=six_months_ago
    ).annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        avg_price=Avg('rent_price'),
        min_price=Min('rent_price'),
        max_price=Max('rent_price'),
        count=Count('id')
    ).order_by('month')
    
    # 2. Price by city
    price_by_city = properties.values('city').annotate(
        avg_price=Avg('rent_price'),
        median_price=Avg('rent_price'),  # Simplified median
        min_price=Min('rent_price'),
        max_price=Max('rent_price'),
        count=Count('id')
    ).order_by('-avg_price')[:10]
    
    # 3. Price by property type
    price_by_type = properties.values('property_type').annotate(
        avg_price=Avg('rent_price'),
        min_price=Min('rent_price'),
        max_price=Max('rent_price'),
        count=Count('id')
    ).order_by('-count')
    
    # 4. Property distribution by bedrooms
    bedroom_distribution = properties.values('bedrooms').annotate(
        count=Count('id'),
        avg_price=Avg('rent_price')
    ).order_by('bedrooms')
    
    # 5. Furnished vs Unfurnished
    furnished_stats = {
        'furnished': properties.filter(is_furnished=True).aggregate(
            count=Count('id'),
            avg_price=Avg('rent_price')
        ),
        'unfurnished': properties.filter(is_furnished=False).aggregate(
            count=Count('id'),
            avg_price=Avg('rent_price')
        )
    }
    
    # 6. Top performing areas
    top_areas = properties.values('city', 'area').annotate(
        count=Count('id'),
        avg_price=Avg('rent_price'),
        avg_views=Avg('view_count'),
        avg_rating=Avg('rating')
    ).order_by('-count')[:10]
    
    # 7. Price range distribution
    price_ranges = [
        {'range': 'Under $500', 'min': 0, 'max': 500},
        {'range': '$500-$1000', 'min': 500, 'max': 1000},
        {'range': '$1000-$1500', 'min': 1000, 'max': 1500},
        {'range': '$1500-$2000', 'min': 1500, 'max': 2000},
        {'range': '$2000-$3000', 'min': 2000, 'max': 3000},
        {'range': 'Over $3000', 'min': 3000, 'max': 999999}
    ]
    
    price_distribution = []
    for pr in price_ranges:
        count = properties.filter(
            rent_price__gte=pr['min'],
            rent_price__lt=pr['max']
        ).count()
        if count > 0:
            price_distribution.append({
                'range': pr['range'],
                'count': count
            })
    
    # Role-specific data
    role_specific_data = {}
    
    if user_role == 'owner' and user:
        # Owner-specific analytics
        owner_properties = properties.filter(owner=user)
        owner_bookings = Booking.objects.filter(property__owner=user)
        
        role_specific_data = {
            'my_properties': {
                'total': owner_properties.count(),
                'available': owner_properties.filter(status='available').count(),
                'rented': owner_properties.filter(status='rented').count(),
                'avg_price': float(owner_properties.aggregate(Avg('rent_price'))['rent_price__avg'] or 0),
                'total_views': owner_properties.aggregate(Sum('view_count'))['view_count__sum'] or 0
            },
            'bookings': {
                'total': owner_bookings.count(),
                'pending': owner_bookings.filter(status='pending').count(),
                'confirmed': owner_bookings.filter(status='confirmed').count()
            },
            'property_performance': list(owner_properties.values(
                'id', 'title', 'rent_price', 'view_count', 'favorite_count', 'rating'
            ).order_by('-view_count')[:5])
        }
    
    elif user_role == 'renter' and user:
        # Renter-specific analytics
        user_bookings = Booking.objects.filter(renter=user)
        user_favorites = user.favorites.all() if hasattr(user, 'favorites') else []
        
        role_specific_data = {
            'my_bookings': {
                'total': user_bookings.count(),
                'active': user_bookings.filter(status__in=['confirmed', 'pending']).count(),
                'completed': user_bookings.filter(status='completed').count()
            },
            'favorites': {
                'count': len(user_favorites),
                'avg_price': float(properties.filter(
                    id__in=[f.property_id for f in user_favorites]
                ).aggregate(Avg('rent_price'))['rent_price__avg'] or 0) if user_favorites else 0
            },
            'recommendations': list(properties.order_by('-rating', '-view_count')[:5].values(
                'id', 'title', 'city', 'rent_price', 'property_type', 'rating'
            ))
        }
    
    elif user_role == 'admin' and user:
        # Admin-specific analytics
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        role_specific_data = {
            'platform_stats': {
                'total_users': User.objects.count(),
                'total_properties': Property.objects.count(),
                'total_bookings': Booking.objects.count(),
                'pending_verifications': Property.objects.filter(verification_status='pending').count()
            },
            'recent_activity': {
                'new_users_30d': User.objects.filter(created_at__gte=thirty_days_ago).count(),
                'new_properties_30d': Property.objects.filter(created_at__gte=thirty_days_ago).count(),
                'new_bookings_30d': Booking.objects.filter(created_at__gte=thirty_days_ago).count()
            },
            'revenue_estimate': float(
                Booking.objects.filter(status='completed').aggregate(
                    Sum('total_amount')
                )['total_amount__sum'] or 0
            )
        }
    
    return Response({
        'user_role': user_role,
        'market_overview': {
            'total_properties': properties.count(),
            'avg_rent': float(properties.aggregate(Avg('rent_price'))['rent_price__avg'] or 0),
            'cities_count': properties.values('city').distinct().count()
        },
        'price_trends': list(price_trends),
        'price_by_city': list(price_by_city),
        'price_by_type': list(price_by_type),
        'bedroom_distribution': list(bedroom_distribution),
        'furnished_stats': furnished_stats,
        'top_areas': list(top_areas),
        'price_distribution': price_distribution,
        'role_specific': role_specific_data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def renter_analytics(request):
    """Get comprehensive analytics for renters"""
    user = request.user
    
    if user.role != 'renter':
        return Response({'error': 'Only renters can access this endpoint'}, status=403)
    
    # Get all bookings for the renter
    bookings = Booking.objects.filter(renter=user).select_related('property')
    
    # Overview statistics
    total_bookings = bookings.count()
    confirmed_bookings = bookings.filter(status='confirmed').count()
    completed_bookings = bookings.filter(status='completed').count()
    pending_bookings = bookings.filter(status='pending').count()
    
    # Calculate total spent
    total_spent = float(bookings.filter(
        status__in=['confirmed', 'completed']
    ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0)
    
    # Current active rentals
    active_rentals = bookings.filter(
        status='confirmed',
        booking_type='rental',
        start_date__lte=datetime.now().date()
    ).filter(
        Q(end_date__gte=datetime.now().date()) | Q(end_date__isnull=True)
    )
    
    # Monthly spending (last 12 months)
    twelve_months_ago = datetime.now() - relativedelta(months=12)
    monthly_spending = bookings.filter(
        status__in=['confirmed', 'completed'],
        created_at__gte=twelve_months_ago
    ).annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        amount=Sum('total_amount'),
        count=Count('id')
    ).order_by('month')
    
    monthly_spending_data = []
    for item in monthly_spending:
        monthly_spending_data.append({
            'month': item['month'].strftime('%b %Y'),
            'amount': float(item['amount'] or 0),
            'bookings': item['count']
        })
    
    # Yearly spending (last 3 years)
    three_years_ago = datetime.now() - relativedelta(years=3)
    yearly_spending = bookings.filter(
        status__in=['confirmed', 'completed'],
        created_at__gte=three_years_ago
    ).annotate(
        year=TruncYear('created_at')
    ).values('year').annotate(
        amount=Sum('total_amount'),
        count=Count('id')
    ).order_by('year')
    
    yearly_spending_data = []
    for item in yearly_spending:
        yearly_spending_data.append({
            'year': item['year'].year,
            'amount': float(item['amount'] or 0),
            'bookings': item['count']
        })
    
    # Rental history with property details
    rental_history = []
    for booking in bookings.filter(booking_type='rental').order_by('-created_at')[:20]:
        property_data = booking.property
        rental_history.append({
            'id': booking.id,
            'property_id': property_data.id,
            'property_title': property_data.title,
            'property_address': property_data.address,
            'property_city': property_data.city,
            'property_type': property_data.property_type,
            'monthly_rent': float(booking.monthly_rent),
            'deposit': float(booking.deposit_amount),
            'total_amount': float(booking.total_amount),
            'start_date': booking.start_date.isoformat(),
            'end_date': booking.end_date.isoformat() if booking.end_date else None,
            'status': booking.status,
            'created_at': booking.created_at.isoformat(),
            'confirmed_at': booking.confirmed_at.isoformat() if booking.confirmed_at else None,
        })
    
    # Upcoming payment reminders (for active rentals)
    payment_reminders = []
    for rental in active_rentals:
        # Calculate next payment date (assuming monthly payments)
        start_date = rental.start_date
        today = datetime.now().date()
        
        # Find the next payment date
        months_since_start = (today.year - start_date.year) * 12 + (today.month - start_date.month)
        next_payment_date = start_date + relativedelta(months=months_since_start + 1)
        
        # Only include if payment is due within next 30 days
        days_until_payment = (next_payment_date - today).days
        if 0 <= days_until_payment <= 30:
            payment_reminders.append({
                'property_id': rental.property.id,
                'property_title': rental.property.title,
                'property_address': rental.property.address,
                'monthly_rent': float(rental.monthly_rent),
                'next_payment_date': next_payment_date.isoformat(),
                'days_until_payment': days_until_payment,
                'is_urgent': days_until_payment <= 7,
                'booking_id': rental.id
            })
    
    # Sort reminders by urgency
    payment_reminders.sort(key=lambda x: x['days_until_payment'])
    
    # Spending by property type
    spending_by_type = bookings.filter(
        status__in=['confirmed', 'completed']
    ).values('property__property_type').annotate(
        total=Sum('total_amount'),
        count=Count('id')
    ).order_by('-total')
    
    spending_by_type_data = []
    for item in spending_by_type:
        spending_by_type_data.append({
            'property_type': item['property__property_type'],
            'total_spent': float(item['total'] or 0),
            'bookings': item['count']
        })
    
    # Average rent paid
    avg_rent_paid = float(bookings.filter(
        status__in=['confirmed', 'completed'],
        booking_type='rental'
    ).aggregate(Avg('monthly_rent'))['monthly_rent__avg'] or 0)
    
    # Favorite properties count
    from properties.models import Favorite
    favorites_count = Favorite.objects.filter(user=user).count()
    
    return Response({
        'overview': {
            'total_bookings': total_bookings,
            'confirmed_bookings': confirmed_bookings,
            'completed_bookings': completed_bookings,
            'pending_bookings': pending_bookings,
            'total_spent': total_spent,
            'active_rentals': active_rentals.count(),
            'avg_rent_paid': avg_rent_paid,
            'favorites_count': favorites_count
        },
        'monthly_spending': monthly_spending_data,
        'yearly_spending': yearly_spending_data,
        'rental_history': rental_history,
        'payment_reminders': payment_reminders,
        'spending_by_type': spending_by_type_data
    })
