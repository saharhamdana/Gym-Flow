# Fichier : backend/members/card_generator.py

import os
from PIL import Image, ImageDraw, ImageFont
import qrcode
from django.conf import settings
from django.utils import timezone
from .models import Member
from subscriptions.models import Subscription

# ---------------- CONFIGURATION ----------------
CARD_WIDTH = 856  # Taille standard d'une carte de crédit/fidélité (pixels)
CARD_HEIGHT = 540 
OUTPUT_DIR = os.path.join(settings.MEDIA_ROOT, 'membership_cards')
FONT_PATH = os.path.join(settings.BASE_DIR, 'static/fonts/Roboto-Bold.ttf') # 👈 Ajustez ce chemin !

# Assurez-vous que le répertoire de sortie existe
os.makedirs(OUTPUT_DIR, exist_ok=True)
# ----------------------------------------------


def generate_membership_card(member_id):
    """
    Génère une carte membre au format image (PNG).
    """
    try:
        member = Member.objects.get(member_id=member_id)
        
        # Récupérer l'abonnement actif (ou le plus récent)
        latest_sub = Subscription.objects.filter(member=member, status='ACTIVE').order_by('-end_date').first()
        
        if not latest_sub:
            # Gérer le cas où il n'y a pas d'abonnement actif
            expiry_date_str = "Abonnement Expiré"
            plan_name = "N/A"
        else:
            expiry_date_str = latest_sub.end_date.strftime("%d/%m/%Y")
            plan_name = latest_sub.plan.name
        
        # 1. Créer une image de base (fond blanc)
        img = Image.new('RGB', (CARD_WIDTH, CARD_HEIGHT), color='#FFFFFF')
        draw = ImageDraw.Draw(img)

        # Définir les couleurs
        RED_COLOR = "#9b0e16"
        BLUE_COLOR = "#00357a"

        # Charger la police
        try:
            font_title = ImageFont.truetype(FONT_PATH, 40)
            font_label = ImageFont.truetype(FONT_PATH, 24)
            font_data = ImageFont.truetype(FONT_PATH, 32)
        except IOError:
            font_title = ImageFont.load_default()
            font_label = ImageFont.load_default()
            font_data = ImageFont.load_default()

        # 2. Ajouter la photo du membre si disponible
        photo_size = 150
        photo_margin = 30
        if member.photo:
            try:
                member_photo = Image.open(member.photo.path).convert('RGB')
                # Redimensionner l'image tout en conservant le ratio
                member_photo.thumbnail((photo_size, photo_size))
                # Calculer la position pour coller la photo (en haut à droite)
                photo_x = CARD_WIDTH - photo_size - photo_margin
                photo_y = photo_margin
                img.paste(member_photo, (photo_x, photo_y))
            except Exception as e:
                print(f"Erreur lors du chargement de la photo: {e}")

        # 3. Informations de la salle de sport
        draw.text((30, 30), "GYMFLOW", fill=RED_COLOR, font=font_title)
        draw.text((30, 80), "Carte Membre", fill=BLUE_COLOR, font=font_label)
        
        # 4. Informations du membre
        full_name = f"{member.first_name} {member.last_name}"
        
        # Nom complet
        draw.text((30, 150), "NOM COMPLET", fill=BLUE_COLOR, font=font_label)
        draw.text((30, 185), full_name, fill=RED_COLOR, font=font_data)

        # ID Membre
        draw.text((30, 270), "ID MEMBRE", fill=BLUE_COLOR, font=font_label)
        draw.text((30, 305), member.member_id, fill=RED_COLOR, font=font_data)

        # Plan
        draw.text((30, 390), "PLAN", fill=BLUE_COLOR, font=font_label)
        draw.text((30, 425), plan_name, fill=RED_COLOR, font=font_data)

        # Date d'expiration
        draw.text((350, 390), "EXPIRATION", fill=BLUE_COLOR, font=font_label)
        draw.text((350, 425), expiry_date_str, fill=RED_COLOR, font=font_data)
        
        # 5. Génération du QR Code
        qr_data = member.member_id 
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=5,
            border=2,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color=RED_COLOR, back_color="white").convert('RGB')
        
        # Positionner le QR code en bas à droite
        qr_margin = 30
        qr_pos_x = CARD_WIDTH - qr_img.size[0] - qr_margin
        qr_pos_y = CARD_HEIGHT - qr_img.size[1] - qr_margin
        img.paste(qr_img, (qr_pos_x, qr_pos_y))
        

        # 5. Sauvegarde du fichier
        file_name = f"card_{member_id}.png"
        file_path = os.path.join(OUTPUT_DIR, file_name)
        img.save(file_path)
        return file_path
        full_path = os.path.join(OUTPUT_DIR, file_name)
        
        img.save(full_path)
        
        # 6. Mise à jour du modèle
        member.membership_card_path = f"membership_cards/{file_name}" # Chemin relatif pour l'URL
        member.save(update_fields=['membership_card_path'])
        
        return member.membership_card_path
        
    except Member.DoesNotExist:
        print(f"Erreur : Membre ID {member_id} non trouvé.")
        return None
    except Exception as e:
        print(f"Erreur lors de la génération de la carte : {e}")
        return None