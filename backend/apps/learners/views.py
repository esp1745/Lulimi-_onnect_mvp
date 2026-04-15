from rest_framework import generics, permissions
from .models import Learner
from .serializers import LearnerSerializer


class LearnerProfileView(generics.RetrieveUpdateAPIView):
    """Learner views/updates their own profile."""
    serializer_class = LearnerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        learner, _ = Learner.objects.get_or_create(user=self.request.user)
        return learner
