from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserPreference

# Import admin class after models to avoid circular imports
from .admin_evaluation import OwnerEvaluationAdmin
from .models_evaluation import OwnerEvaluation

# Register your models here.
# Register OwnerEvaluation with custom admin
if OwnerEvaluation not in admin.site._registry:
    admin.site.register(OwnerEvaluation, OwnerEvaluationAdmin)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'verification_status', 'trust_score', 'created_at']
    list_filter = ['role', 'verification_status', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role & Verification', {
            'fields': ('role', 'verification_status', 'id_document', 'business_license', 
                      'verified_at', 'verified_by')
        }),
        ('Additional Info', {
            'fields': ('phone', 'profile_picture', 'bio', 'address', 'city', 
                      'country', 'trust_score')
        }),
    )


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'min_price', 'max_price', 'email_notifications']
    search_fields = ['user__username', 'user__email']
