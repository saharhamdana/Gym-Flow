#!/usr/bin/env python
"""
Script pour créer des centres de test
Exécuter avec: python manage.py shell < create_test_centers.py
"""

import os
import django

# Configurer Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from authentication.models import User, GymCenter
from django.db import IntegrityError

def create_test_centers():
    print("=" * 60)
    print("CRÉATION DES CENTRES DE TEST")
    print("=" * 60)
    
    # 1. Créer ou récupérer un admin
    print("\n1️⃣  Gestion de l'utilisateur admin...")
    try:
        admin = User.objects.filter(role='ADMIN').first()
        if not admin:
            admin = User.objects.create_user(
                username='admin',
                email='admin@gymflow.com',
                password='admin123',
                first_name='Admin',
                last_name='GymFlow',
                role='ADMIN'
            )
            print(f"✅ Admin créé: {admin.email}")
        else:
            print(f"ℹ️  Admin existant trouvé: {admin.email}")
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'admin: {e}")
        return
    
    # 2. Créer les centres
    print("\n2️⃣  Création des centres...")
    
    centers_data = [
        {
            'name': 'PowerFit Gym',
            'subdomain': 'powerfit',
            'email': 'contact@powerfit.com',
            'phone': '0123456789',
            'address': '123 Rue du Sport, Paris 75001',
            'description': 'La meilleure salle de CrossFit à Paris',
        },
        {
            'name': 'TitanGym',
            'subdomain': 'titangym',
            'email': 'info@titangym.com',
            'phone': '0987654321',
            'address': '456 Avenue des Champions, Lyon 69001',
            'description': 'Musculation et fitness à Lyon',
        },
        {
            'name': 'MoveUp Fitness',
            'subdomain': 'moveup',
            'email': 'hello@moveup.com',
            'phone': '0555123456',
            'address': '789 Boulevard de la Forme, Marseille 13001',
            'description': 'Coaching personnalisé et cours collectifs à Marseille',
        }
    ]
    
    created_centers = []
    
    for center_data in centers_data:
        try:
            # Vérifier si le centre existe déjà
            existing = GymCenter.objects.filter(subdomain=center_data['subdomain']).first()
            
            if existing:
                print(f"ℹ️  Centre existant: {existing.name} ({existing.subdomain})")
                created_centers.append(existing)
            else:
                # Créer le centre
                center = GymCenter.objects.create(
                    owner=admin,
                    **center_data
                )
                print(f"✅ Centre créé: {center.name} ({center.subdomain})")
                created_centers.append(center)
                
        except IntegrityError as e:
            print(f"❌ Erreur (doublon): {center_data['name']} - {e}")
        except Exception as e:
            print(f"❌ Erreur: {center_data['name']} - {e}")
    
    # 3. Afficher le résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ DES CENTRES")
    print("=" * 60)
    
    all_centers = GymCenter.objects.all()
    
    if all_centers.exists():
        for center in all_centers:
            print(f"\n📍 {center.name}")
            print(f"   Subdomain: {center.subdomain}")
            print(f"   URL: {center.full_url}")
            print(f"   Email: {center.email}")
            print(f"   Téléphone: {center.phone}")
            print(f"   Actif: {'✅' if center.is_active else '❌'}")
    else:
        print("Aucun centre trouvé dans la base de données.")
    
    print(f"\n📊 Total de centres: {all_centers.count()}")
    print("\n✅ Script terminé avec succès!")
    print("=" * 60)

if __name__ == '__main__':
    create_test_centers()