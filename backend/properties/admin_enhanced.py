from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.utils import timezone
from .models import Property, PropertyImage, PropertyDocument, Report


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    readonly_fields = ['preview']
    
    def preview(self, obj):
        if obj.image:
            return mark_safe(
                f'<img src="{obj.image.url}" style="max-height: 100px;" />'
            )
        return 'No image'
    preview.short_description = 'Preview'


class PropertyDocumentInline(admin.TabularInline):
    model = PropertyDocument
    extra = 1
    readonly_fields = ['preview']
    
    def preview(self, obj):
        if obj.document:
            return mark_safe(
                f'<a href="{obj.document.url}" target="_blank">View Document</a>'
            )
        return 'No document'
    preview.short_description = 'Preview'


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'owner', 'property_type', 'status_badge', 
        'verification_status_badge', 'price_display', 'created_at', 'action_buttons'
    ]
    list_filter = [
        'property_type', 'status', 'verification_status',
        'is_furnished', 'city', 'created_at'
    ]
    search_fields = [
        'title', 'description', 'address', 'city',
        'owner__username', 'owner__email'
    ]
    list_select_related = ['owner']
    inlines = [PropertyImageInline, PropertyDocumentInline]
    readonly_fields = ['view_count', 'favorite_count', 'rating', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'description', 'property_type', 'owner',
                'status', 'verification_status', 'verified_at', 'verified_by'
            )
        }),
        ('Location', {
            'fields': (
                'address', 'city', 'district', 'area',
                'postal_code', 'latitude', 'longitude'
            )
        }),
        ('Pricing', {
            'fields': ('rent_price', 'deposit', 'currency')
        }),
        ('Property Details', {
            'fields': (
                'bedrooms', 'bathrooms', 'area_sqm', 'floor_number',
                'is_furnished', 'facilities', 'pets_allowed', 'smoking_allowed', 'rules'
            )
        }),
        ('Metrics', {
            'classes': ('collapse',),
            'fields': ('view_count', 'favorite_count', 'rating')
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def status_badge(self, obj):
        status_colors = {
            'available': 'green',
            'rented': 'blue',
            'pending': 'orange',
            'maintenance': 'red'
        }
        return format_html(
            '<span style="color: white; background-color: {}; '
            'padding: 3px 8px; border-radius: 4px; font-size: 12px;">
            {}
            </span>',
            status_colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def verification_status_badge(self, obj):
        status_colors = {
            'pending': 'orange',
            'verified': 'green',
            'rejected': 'red'
        }
        return format_html(
            '<span style="color: white; background-color: {}; '
            'padding: 3px 8px; border-radius: 4px; font-size: 12px;">
            {}
            </span>',
            status_colors.get(obj.verification_status, 'gray'),
            obj.get_verification_status_display()
        )
    verification_status_badge.short_description = 'Verification'
    verification_status_badge.admin_order_field = 'verification_status'
    
    def price_display(self, obj):
        return f"{obj.currency} {obj.rent_price:,.2f}/month"
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'rent_price'
    
    def action_buttons(self, obj):
        buttons = []
        if obj.verification_status != 'verified':
            buttons.append(
                f'<a class="button" href="{reverse("admin:properties_property_verify", args=[obj.id])}" '
                f'style="background: #4CAF50; color: white; padding: 5px 10px; '
                f'border-radius: 4px; text-decoration: none;">Verify</a>'
            )
        if obj.verification_status != 'rejected':
            buttons.append(
                f'<a class="button" href="{reverse("admin:properties_property_reject", args=[obj.id])}" '
                f'style="background: #f44336; color: white; padding: 5px 10px; '
                f'border-radius: 4px; margin-left: 5px; text-decoration: none;">Reject</a>'
            )
        return mark_safe(' '.join(buttons)) if buttons else '-'
    action_buttons.short_description = 'Actions'
    action_buttons.allow_tags = True
    
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:property_id>/verify/',
                self.admin_site.admin_view(self.verify_property),
                name='properties_property_verify',
            ),
            path(
                '<int:property_id>/reject/',
                self.admin_site.admin_view(self.reject_property),
                name='properties_property_reject',
            ),
        ]
        return custom_urls + urls
    
    def verify_property(self, request, property_id):
        from django.contrib import messages
        try:
            prop = Property.objects.get(id=property_id)
            prop.verification_status = 'verified'
            prop.verified_at = timezone.now()
            prop.verified_by = request.user
            prop.save()
            messages.success(request, f'Successfully verified property: {prop.title}')
        except Property.DoesNotExist:
            messages.error(request, 'Property not found')
        return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/admin/'))
    
    def reject_property(self, request, property_id):
        from django.contrib import messages
        try:
            prop = Property.objects.get(id=property_id)
            prop.verification_status = 'rejected'
            prop.save()
            messages.warning(request, f'Property marked as rejected: {prop.title}')
        except Property.DoesNotExist:
            messages.error(request, 'Property not found')
        return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/admin/'))


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['property', 'reported_by', 'reason', 'status_badge', 'created_at']
    list_filter = ['status', 'reason', 'created_at']
    search_fields = ['property__title', 'reported_by__username', 'description']
    list_select_related = ['property', 'reported_by', 'reviewed_by']
    
    def status_badge(self, obj):
        status_colors = {
            'pending': 'orange',
            'reviewing': 'blue',
            'resolved': 'green',
            'dismissed': 'gray'
        }
        return format_html(
            '<span style="color: white; background-color: {}; '
            'padding: 3px 8px; border-radius: 4px; font-size: 12px;">
            {}
            </span>',
            status_colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
