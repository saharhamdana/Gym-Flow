#!/usr/bin/env python
"""
Script pour lier les utilisateurs existants aux centres
Exécuter avec: python manage.py shell < link_users_to_centers.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from authentication.models import User, GymCenter

def link_users_to_centers():
    print("=" * 60)
    print("LIAISON DES UTILISATEURS AUX CENTRES")
    print("=" * 60)
    
    # Récupérer tous les centres
    centers = GymCenter.objects.all()
    
    if not centers.exists():
        print("❌ Aucun centre trouvé. Veuillez d'abord créer des centres.")
        return
    
    print(f"\n📊 {centers.count()} centres trouvés\n")
    
    # Afficher les centres disponibles
    for i, center in enumerate(centers, 1):
        print(f"{i}. {center.name} ({center.subdomain})")
    
    print("\n" + "=" * 60)
    print("ATTRIBUTION AUTOMATIQUE")
    print("=" * 60)
    
    # Lier les owners aux centres qu'ils possèdent
    for center in centers:
        owner = center.owner
        if not owner.gym_center:
            owner.gym_center = center
            owner.save()
            print(f"✅ Owner {owner.email} lié à {center.name}")
    
    # Pour les autres utilisateurs sans centre, les lier au premier centre
    # (Vous pouvez personnaliser cette logique)
    users_without_center = User.objects.filter(gym_center__isnull=True)
    
    if users_without_center.exists():
        print(f"\n📋 {users_without_center.count()} utilisateurs sans centre")
        
        default_center = centers.first()
        
        for user in users_without_center:
            user.gym_center = default_center
            user.save()
            print(f"✅ {user.email} lié à {default_center.name}")
    
    # Résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ")
    print("=" * 60)
    
    for center in centers:
        user_count = center.users.count()
        print(f"\n{center.name} ({center.subdomain})")
        print(f"  • {user_count} utilisateur(s)")
        
        for user in center.users.all():
            print(f"    - {user.email} ({user.get_role_display()})")
    
    print("\n✅ Liaison terminée!")

if __name__ == '__main__':
    link_users_to_centers()