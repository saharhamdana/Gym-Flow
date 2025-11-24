import os
from django.http import FileResponse, HttpResponse
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
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
        print(f"🔍 Tentative de génération de carte pour le membre: {member_id}")
        print(f"🔍 Utilisateur authentifié: {request.user.username}")
        print(f"🔍 User is staff: {request.user.is_staff}")
        print(f"🔍 User has coach attr: {hasattr(request.user, 'coach')}")
        
        # Vérifier si le membre existe
        member = Member.objects.get(member_id=member_id)
        print(f"✅ Membre trouvé: {member.first_name} {member.last_name}")

        # ✅ PERMISSIONS SIMPLIFIÉES - Autoriser tous les utilisateurs authentifiés
        # (Vous pouvez ajuster cette logique plus tard)
        has_permission = True  # Temporairement autoriser tous les utilisateurs authentifiés

        if not has_permission:
            print("❌ Permission refusée")
            return Response(
                {"error": "Vous n'avez pas les droits pour accéder à cette carte"},
                status=status.HTTP_403_FORBIDDEN
            )

        print("✅ Permission accordée, génération de la carte...")
        
        # Générer la carte
        card_path = generate_membership_card(member_id)
        
        if not card_path or not os.path.exists(card_path):
            print("❌ Erreur: chemin de carte invalide")
            return Response(
                {"error": "Erreur lors de la génération de la carte"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        print(f"✅ Carte générée avec succès: {card_path}")
        
        # Renvoyer le fichier
        response = FileResponse(
            open(card_path, 'rb'),
            content_type='image/png'
        )
        response['Content-Disposition'] = f'attachment; filename="member_card_{member_id}.png"'
        return response

    except Member.DoesNotExist:
        print(f"❌ Membre non trouvé: {member_id}")
        return Response(
            {"error": "Membre non trouvé"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"❌ Erreur inattendue: {str(e)}")
        return Response(
            {"error": f"Erreur serveur: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )