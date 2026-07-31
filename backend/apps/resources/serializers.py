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

    def validate(self, attrs):
        resource_type = attrs.get('resource_type', getattr(self.instance, 'resource_type', None))
        file_url = attrs.get('file_url', getattr(self.instance, 'file_url', ''))
        content_text = attrs.get('content_text', getattr(self.instance, 'content_text', ''))

        if resource_type in ('pdf', 'audio', 'image', 'link') and not file_url:
            raise serializers.ValidationError({'file_url': f'A file or link URL is required for a {resource_type} resource.'})
        if resource_type == 'text' and not content_text:
            raise serializers.ValidationError({'content_text': 'Text content is required for a text resource.'})
        return attrs


class LessonResourceSerializer(serializers.ModelSerializer):
    resource = ResourceSerializer(read_only=True)
    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=Resource.objects.all(), source='resource', write_only=True
    )

    class Meta:
        model = LessonResource
        fields = ['id', 'booking', 'resource', 'resource_id', 'created_at']
        read_only_fields = ['id', 'booking', 'created_at']
