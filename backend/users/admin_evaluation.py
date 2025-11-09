from django.contrib import admin
from django.utils.html import format_html
from .models_evaluation import OwnerEvaluation

class OwnerEvaluationAdmin(admin.ModelAdmin):
    """Admin interface for managing owner evaluations"""
    
    list_display = [
        'owner_name',
        'evaluator_name',
        'rating_stars',
        'is_approved',
        'created_at',
        'evaluation_actions'
    ]
    
    list_filter = [
        'is_approved',
        'rating',
        'created_at',
    ]
    
    search_fields = [
        'owner__username',
        'owner__email',
        'evaluated_by__username',
        'comments'
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'evaluation_score',
    ]
    
    fieldsets = (
        ('Evaluation Details', {
            'fields': (
                'owner',
                'evaluated_by',
                'rating',
                'comments',
            )
        }),
        ('Evaluation Criteria', {
            'fields': (
                'response_time',
                'property_quality',
                'communication',
                'reliability',
            ),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': (
                'is_approved',
                'reviewed_by',
            )
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def owner_name(self, obj):
        return obj.owner.get_full_name() or obj.owner.username
    owner_name.short_description = 'Owner'
    owner_name.admin_order_field = 'owner__username'
    
    def evaluator_name(self, obj):
        return obj.evaluated_by.get_full_name() or obj.evaluated_by.username
    evaluator_name.short_description = 'Evaluated By'
    evaluator_name.admin_order_field = 'evaluated_by__username'
    
    def rating_stars(self, obj):
        return format_html(
            '<span style="color: #f39c12; font-weight: bold;">{0} ★</span>',
            obj.rating
        )
    rating_stars.short_description = 'Rating'
    rating_stars.admin_order_field = 'rating'
    
    def evaluation_score(self, obj):
        if obj.response_time and obj.property_quality and obj.communication and obj.reliability:
            return f"{obj.rating}/5"
        return "N/A"
    evaluation_score.short_description = 'Overall Score'
    
    def evaluation_actions(self, obj):
        if not obj.is_approved:
            return format_html(
                '<a class="button" href="{}/approve/">Approve</a>&nbsp;',
                obj.id
            )
        return "Approved"
    evaluation_actions.short_description = 'Actions'
    evaluation_actions.allow_tags = True
    
    def get_urls(self):
        from django.urls import path
        
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:evaluation_id>/approve/',
                self.admin_site.admin_view(self.approve_evaluation),
                name='approve-evaluation',
            ),
        ]
        return custom_urls + urls
    
    def approve_evaluation(self, request, evaluation_id, *args, **kwargs):
        from django.shortcuts import redirect
        from django.contrib import messages
        
        evaluation = OwnerEvaluation.objects.get(id=evaluation_id)
        evaluation.is_approved = True
        evaluation.reviewed_by = request.user
        evaluation.save()
        
        messages.success(request, 'Evaluation has been approved.')
        return redirect('admin:users_ownerevaluation_changelist')
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.evaluated_by = request.user
        
        if 'is_approved' in form.changed_data and obj.is_approved and not obj.reviewed_by:
            obj.reviewed_by = request.user
            
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(evaluated_by=request.user)
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        
        if obj and obj.is_approved and not request.user.is_superuser:
            # Make all fields read-only for non-superusers after approval
            readonly_fields.extend([
                f.name for f in self.model._meta.fields 
                if f.name not in readonly_fields
            ])
            
        return readonly_fields
    
    class Media:
        css = {
            'all': ('admin/css/owner_evaluation.css',)
        }
