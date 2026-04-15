from rest_framework import serializers
from .models import Learner


class LearnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Learner
        fields = ['id', 'goals', 'proficiency_level', 'created_at']
        read_only_fields = ['id', 'created_at']
