import os
from django.http import FileResponse, HttpResponse
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from .card_generator import generate_membership_card
from .models import Member

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_member_card(request, member_id):
    """
    Génère et renvoie la carte de membre au format PNG.
    """
    try:
        # Vérifier si l'utilisateur a le droit d'accéder à cette carte
        if not request.user.is_staff:  # Pour les non-admin
            if hasattr(request.user, 'member'):
                if request.user.member.member_id != member_id:
                    return Response(
                        {"error": "Vous n'avez pas accès à cette carte"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                return Response(
                    {"error": "Accès non autorisé"},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Générer la carte
        card_path = generate_membership_card(member_id)
        
        if not card_path or not os.path.exists(card_path):
            return Response(
                {"error": "Erreur lors de la génération de la carte"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Renvoyer le fichier
        response = FileResponse(
            open(card_path, 'rb'),
            content_type='image/png'
        )
        response['Content-Disposition'] = f'attachment; filename="member_card_{member_id}.png"'
        return response

    except Member.DoesNotExist:
        return Response(
            {"error": "Membre non trouvé"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )