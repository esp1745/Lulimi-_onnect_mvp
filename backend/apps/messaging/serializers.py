from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'recipient', 'text', 'read_at', 'created_at']
        read_only_fields = ['id', 'sender', 'recipient', 'read_at', 'created_at']
