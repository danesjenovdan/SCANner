from django.contrib import admin
from .models import *

# Register your models here.

class AnalysisAdmin(admin.ModelAdmin):
    list_filter = ['visible', 'published', 'created_at']
    list_display = ['created_at', '__unicode__', 'visible', 'published']
    list_editable = ['visible', 'published']

    fields = ('title', 'date', 'visible', 'published', 'analysis', 'video_url', 'photo',)

admin.site.register(MarkedText, AnalysisAdmin)