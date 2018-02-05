from django.db import models
from jsonfield import JSONField
from ckeditor.fields import RichTextField

# Create your models here.
class MarkedText(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    data = JSONField(blank=True, null=True)
    analysis = RichTextField(blank=True, null=True)
    visible = models.BooleanField(default=True)
    published = models.BooleanField(default=False)
    video_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.text[:50]

    def __unicode__(self):
        return self.text[:50]