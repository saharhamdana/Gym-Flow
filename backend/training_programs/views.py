from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TrainingProgram
from .serializers import TrainingProgramSerializer

class TrainingProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for viewing assigned training programs.
    """
    serializer_class = TrainingProgramSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the training programs
        for the currently authenticated user.
        """
        user = self.request.user
        return TrainingProgram.objects.filter(member=user)
