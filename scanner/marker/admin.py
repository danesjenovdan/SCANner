from django.contrib import admin
from .models import *

# Register your models here.

class AnalysisAdmin(admin.ModelAdmin):
    list_filter = ['visible', 'published', 'created_at']
    list_display = ['created_at', '__unicode__', 'visible', 'published']

    fields = ('text', 'data', 'visible', 'published', 'analysis', 'video_url',)

admin.site.register(MarkedText, AnalysisAdmin)