from rest_framework import serializers
from .models import Resource, LessonResource


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            'id', 'teacher', 'title', 'description', 'language_name',
            'resource_type', 'file_url', 'content_text', 'visibility', 'created_at',
        ]
        read_only_fields = ['id', 'teacher', 'created_at']


class LessonResourceSerializer(serializers.ModelSerializer):
    resource = ResourceSerializer(read_only=True)
    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=Resource.objects.all(), source='resource', write_only=True
    )

    class Meta:
        model = LessonResource
        fields = ['id', 'booking', 'resource', 'resource_id', 'created_at']
        read_only_fields = ['id', 'created_at']
