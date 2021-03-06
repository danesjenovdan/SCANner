from django.contrib import admin
from .models import *

# Register your models here.

class AnalysisAdmin(admin.ModelAdmin):
    list_filter = ['visible', 'published', 'created_at']
    list_display = ['created_at', '__unicode__', 'visible', 'published']
    list_editable = ['visible', 'published']

    fields = ('title', 'data', 'date', 'visible', 'published', 'analysis', 'video_url', 'photo', 'og_title', 'og_desc')

admin.site.register(MarkedText, AnalysisAdmin)