from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import upload_process_audio, get_chunk_data

urlpatterns = [
    path('upload/', upload_process_audio, name='upload-file'),
    path('get-chunk-data/<int:file_id>/<int:chunk_idx>/', get_chunk_data, name='get_chunk_data'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)