from django.db import models


class RentTrend(models.Model):
    """Store rent trend data by area"""
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True)
    property_type = models.CharField(max_length=20)
    
    # Statistics
    average_rent = models.DecimalField(max_digits=10, decimal_places=2)
    median_rent = models.DecimalField(max_digits=10, decimal_places=2)
    min_rent = models.DecimalField(max_digits=10, decimal_places=2)
    max_rent = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Counts
    property_count = models.IntegerField(default=0)
    
    # Period
    month = models.IntegerField()
    year = models.IntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['city', 'area', 'property_type', 'month', 'year']
        ordering = ['-year', '-month']
    
    def __str__(self):
        return f"{self.city} - {self.property_type} - {self.year}/{self.month}"


class PopularSearch(models.Model):
    """Track popular search terms and filters"""
    search_term = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    property_type = models.CharField(max_length=20, blank=True)
    min_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    search_count = models.IntegerField(default=1)
    last_searched = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-search_count', '-last_searched']
    
    def __str__(self):
        return f"{self.search_term or 'Filter'} - {self.search_count} searches"
