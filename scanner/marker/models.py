from django.db import models
from jsonfield import JSONField

# Create your models here.
class MarkedText(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    data = JSONField(blank=True, null=True)

    def __str__(self):
        return self.text[:50]

    def __unicode__(self):
        return self.text[:50]