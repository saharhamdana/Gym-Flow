from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({'status': 'ok'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
