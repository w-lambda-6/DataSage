from django.urls import path
from . import apps

# /api/{app.urls}
urlpatterns = [
    path('fileList', apps.fileList, name='fileList'),
    path('history', apps.history, name='history'),
    path('fileAdd', apps.fileAdd, name='fileAdd'),
    path('promptAdd', apps.promptAdd, name='promptAdd'),
]
