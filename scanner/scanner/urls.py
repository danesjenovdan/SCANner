"""scanner URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from marker.views import *

urlpatterns = [
    #path('', test_view, name='test_root'),
    path('admin/', admin.site.urls),
    path('test/', test_view, name='test'),
    path('mark-text/', mark_text, name='mark-text'),
    path('view-marked/', view_marked, name='view-marked'),
    path('update-marked/', update_marked, name='update-marked'),
    path('new/', enter_text, name='view-marked'),
    path('', all, name='view-all'),
]
