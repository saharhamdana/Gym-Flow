# -*- coding: utf-8 -*-
#!/usr/bin/env python
"""
Script de test pour le système de sous-domaines
Exécuter directement avec: python test_subdomain.py
"""

import os
import django

# 1️⃣ Configurer Django
# Remplace 'backend.settings' par le chemin vers ton settings.py si nécessaire
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

# 2️⃣ Importer les modèles
from authentication.models import User, GymCenter
from django.db import IntegrityError

def test_subdomain_system():
    print("=" * 60)
    print("TEST DU SYSTÈME DE SOUS-DOMAINES")
    print("=" * 60)
    
    # 1️⃣ Créer un utilisateur admin si nécessaire
    print("\n1️⃣ Création d'un utilisateur admin...")
    try:
        admin = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='admin123',
            first_name='Admin',
            last_name='Test',
            role=User.Role.ADMIN
        )
        print("✅ Admin créé:", admin.email)
    except IntegrityError:
        admin = User.objects.get(email='admin@test.com')
        print("ℹ️ Admin existe déjà:", admin.email)
    
    # 2️⃣ Créer des centres avec sous-domaines
    print("\n2️⃣ Création de centres avec sous-domaines...")
    test_centers = [
        {'name': 'PowerFit Gym', 'subdomain': 'powerfit', 'email': 'contact@powerfit.com', 'phone': '123456789', 'address': '123 Rue du Sport, Paris'},
        {'name': 'TitanGym', 'subdomain': 'titangym', 'email': 'info@titangym.com', 'phone': '987654321', 'address': '456 Avenue des Champions, Lyon'},
        {'name': 'MoveUp Fitness', 'subdomain': 'moveup', 'email': 'hello@moveup.com', 'phone': '555123456', 'address': '789 Boulevard de la Forme, Marseille'}
    ]
    
    for center_data in test_centers:
        try:
            center = GymCenter.objects.create(owner=admin, **center_data)
            print(f"✅ Centre créé: {center.name} ({center.subdomain})")
        except IntegrityError:
            center = GymCenter.objects.get(subdomain=center_data['subdomain'])
            print(f"ℹ️ Centre existe déjà: {center.name} ({center.subdomain})")
    
    # 3️⃣ Vérifier la recherche par sous-domaine
    print("\n3️⃣ Test de recherche par sous-domaine...")
    for sd in ['powerfit', 'titangym', 'moveup']:
        try:
            center = GymCenter.objects.get(subdomain=sd)
            print(f"✅ Trouvé: {center.name} avec sous-domaine '{sd}'")
        except GymCenter.DoesNotExist:
            print(f"❌ Échec: sous-domaine '{sd}' introuvable")
    
    # 4️⃣ Tester validations
    print("\n4️⃣ Test des validations...")

    # Sous-domaine invalide
    try:
        invalid_center = GymCenter(
            name='Invalid Center',
            subdomain='Invalid_Name!',
            email='test@test.com',
            phone='123',
            address='Test',
            owner=admin
        )
        invalid_center.full_clean()
        print("❌ Validation incorrecte - caractères invalides acceptés")
    except Exception:
        print("✅ Validation correcte - caractères invalides rejetés")
    
    # Sous-domaine dupliqué
    try:
        duplicate_center = GymCenter.objects.create(
            name='Duplicate Center',
            subdomain='powerfit',
            email='test@test.com',
            phone='123',
            address='Test',
            owner=admin
        )
        print("❌ Validation incorrecte - doublon accepté")
    except IntegrityError:
        print("✅ Validation correcte - doublon rejeté")
    
    # 5️⃣ Résumé final
    print("\n" + "=" * 60)
    print("RÉSUMÉ FINAL DES CENTRES")
    print("=" * 60)
    for center in GymCenter.objects.all():
        print(f"• {center.name:20} → {center.full_url} (Sous-domaine: {center.subdomain})")
    print(f"\nTotal de centres: {GymCenter.objects.count()}")
    print("\n✅ Tests terminés !")

if __name__ == '__main__':
    test_subdomain_system()
