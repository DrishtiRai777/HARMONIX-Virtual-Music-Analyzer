from rest_framework import serializers
from .models import UploadFile

class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadFile
        fields = ['id', 'file', 'uploaded_at']