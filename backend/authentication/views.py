from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, UserSerializer
from subscriptions.serializers import GymCenterSerializer
from authentication.models import GymCenter


# ---------- Auth / Utilisateur ----------

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Utilisateur créé avec succès"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# ---------- GymCenter ViewSet ----------

class GymCenterViewSet(viewsets.ModelViewSet):
    queryset = GymCenter.objects.all()
    serializer_class = GymCenterSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # si tu veux assigner automatiquement l'utilisateur connecté comme owner
        serializer.save(owner=self.request.user)
