#!/usr/bin/env python
"""
Script pour créer des utilisateurs de test
Exécuter avec: python manage.py shell < create_test_users.py
"""

import os
import django
from datetime import date
from decimal import Decimal

# Configurer Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from authentication.models import User, GymCenter
from members.models import Member

def create_test_users():
    print("=" * 80)
    print("CRÉATION DES UTILISATEURS DE TEST")
    print("=" * 80)
    
    centers = list(GymCenter.objects.all())
    if not centers:
        print("❌ Aucun centre trouvé. Veuillez d'abord exécuter create_test_centers.py")
        return
    
    print(f"\n📍 Centres disponibles: {len(centers)}")
    for center in centers:
        print(f"   - {center.name} ({center.subdomain})")
    
    default_center = centers[0]
    print(f"\n🎯 Centre par défaut: {default_center.name}")
    
    # ============================================
    # 1. CRÉER LES ADMINS
    # ============================================
    print("\n" + "=" * 80)
    print("1️⃣  CRÉATION DES ADMINISTRATEURS")
    print("=" * 80)
    
    admins_data = [
        {
            'username': 'admin',
            'email': 'admin@gymflow.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'Principal',
            'tenant_id': default_center.tenant_id,
        },
        {
            'username': 'director',
            'email': 'director@gymflow.com',
            'password': 'director123',
            'first_name': 'Directeur',
            'last_name': 'Général',
            'tenant_id': default_center.tenant_id,
        }
    ]
    
    created_admins = []
    for admin_data in admins_data:
        try:
            user = User.objects.filter(email=admin_data['email']).first()
            if user:
                print(f"ℹ️  Admin existant: {admin_data['email']}")
            else:
                user = User.objects.create_user(
                    username=admin_data['username'],
                    email=admin_data['email'],
                    password=admin_data['password'],
                    first_name=admin_data['first_name'],
                    last_name=admin_data['last_name'],
                    role='ADMIN',
                    tenant_id=admin_data['tenant_id']
                )
                print(f"✅ Admin créé: {user.email}")
        except Exception as e:
            print(f"❌ Erreur: {admin_data['email']} - {e}")
    
    # ============================================
    # 2. CRÉER LES COACHS
    # ============================================
    print("\n" + "=" * 80)
    print("2️⃣  CRÉATION DES COACHS")
    print("=" * 80)
    
    coaches_data = [
        {
            'username': 'coach.marie',
            'email': 'marie.dupont@gymflow.com',
            'password': 'coach123',
            'first_name': 'Marie',
            'last_name': 'Dupont',
            'tenant_id': default_center.tenant_id,
        },
        {
            'username': 'coach.thomas',
            'email': 'thomas.martin@gymflow.com',
            'password': 'coach123',
            'first_name': 'Thomas',
            'last_name': 'Martin',
            'tenant_id': default_center.tenant_id,
        },
        {
            'username': 'coach.sarah',
            'email': 'sarah.bernard@gymflow.com',
            'password': 'coach123',
            'first_name': 'Sarah',
            'last_name': 'Bernard',
            'tenant_id': default_center.tenant_id,
        }
    ]
    
    for coach_data in coaches_data:
        try:
            user = User.objects.filter(email=coach_data['email']).first()
            if user:
                print(f"ℹ️  Coach existant: {coach_data['email']}")
            else:
                user = User.objects.create_user(
                    username=coach_data['username'],
                    email=coach_data['email'],
                    password=coach_data['password'],
                    first_name=coach_data['first_name'],
                    last_name=coach_data['last_name'],
                    role='COACH',
                    tenant_id=coach_data['tenant_id']
                )
                print(f"✅ Coach créé: {user.email}")
        except Exception as e:
            print(f"❌ Erreur: {coach_data['email']} - {e}")
    
    # ============================================
    # 3. CRÉER LES RÉCEPTIONNISTES
    # ============================================
    print("\n" + "=" * 80)
    print("3️⃣  CRÉATION DES RÉCEPTIONNISTES")
    print("=" * 80)
    
    receptionists_data = [
        {
            'username': 'reception.julie',
            'email': 'julie.petit@gymflow.com',
            'password': 'reception123',
            'first_name': 'Julie',
            'last_name': 'Petit',
            'tenant_id': default_center.tenant_id,
        },
        {
            'username': 'reception.lucas',
            'email': 'lucas.richard@gymflow.com',
            'password': 'reception123',
            'first_name': 'Lucas',
            'last_name': 'Richard',
            'tenant_id': default_center.tenant_id,
        }
    ]
    
    for recep_data in receptionists_data:
        try:
            user = User.objects.filter(email=recep_data['email']).first()
            if user:
                print(f"ℹ️ Réceptionniste existant: {recep_data['email']}")
            else:
                user = User.objects.create_user(
                    username=recep_data['username'],
                    email=recep_data['email'],
                    password=recep_data['password'],
                    first_name=recep_data['first_name'],
                    last_name=recep_data['last_name'],
                    role='RECEPTIONIST',
                    tenant_id=recep_data['tenant_id']
                )
                print(f"✅ Réceptionniste créé: {user.email}")
        except Exception as e:
            print(f"❌ Erreur: {recep_data['email']} - {e}")
    
    # ============================================
    # 4. CRÉER LES MEMBRES
    # ============================================
    print("\n" + "=" * 80)
    print("4️⃣  CRÉATION DES MEMBRES")
    print("=" * 80)
    
    members_data = [
        {
            'user_data': {
                'username': 'membre.alice',
                'email': 'alice.moreau@gmail.com',
                'password': 'member123',
                'first_name': 'Alice',
                'last_name': 'Moreau',
                'tenant_id': default_center.tenant_id,
            },
            'member_data': {
                'phone': '+33612345678',
                'date_of_birth': date(1990, 5, 15),
                'gender': 'F',
                'address': '12 Rue de la Paix, Paris 75001',
                'emergency_contact_name': 'Jean Moreau',
                'emergency_contact_phone': '+33698765432',
                'height': Decimal('165.00'),
                'weight': Decimal('60.00'),
                'status': 'ACTIVE',
            }
        },
        {
            'user_data': {
                'username': 'membre.pierre',
                'email': 'pierre.durand@gmail.com',
                'password': 'member123',
                'first_name': 'Pierre',
                'last_name': 'Durand',
                'tenant_id': default_center.tenant_id,
            },
            'member_data': {
                'phone': '+33623456789',
                'date_of_birth': date(1985, 8, 22),
                'gender': 'M',
                'address': '45 Avenue des Champs, Lyon 69001',
                'emergency_contact_name': 'Sophie Durand',
                'emergency_contact_phone': '+33687654321',
                'height': Decimal('178.00'),
                'weight': Decimal('75.00'),
                'status': 'ACTIVE',
            }
        },
        {
            'user_data': {
                'username': 'membre.emma',
                'email': 'emma.laurent@gmail.com',
                'password': 'member123',
                'first_name': 'Emma',
                'last_name': 'Laurent',
                'tenant_id': default_center.tenant_id,
            },
            'member_data': {
                'phone': '+33634567890',
                'date_of_birth': date(1995, 3, 10),
                'gender': 'F',
                'address': '78 Boulevard Saint-Germain, Paris 75006',
                'emergency_contact_name': 'Marc Laurent',
                'emergency_contact_phone': '+33676543210',
                'height': Decimal('170.00'),
                'weight': Decimal('58.00'),
                'status': 'ACTIVE',
            }
        }
    ]
    
    for member_info in members_data:
        try:
            user_data = member_info['user_data']
            member_data = member_info['member_data']
            
            user = User.objects.filter(email=user_data['email']).first()
            
            if user:
                print(f"ℹ️ Utilisateur existant: {user_data['email']}")
            else:
                user = User.objects.create_user(
                    username=user_data['username'],
                    email=user_data['email'],
                    password=user_data['password'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    role='MEMBER',
                    tenant_id=user_data['tenant_id']
                )
                print(f"✅ Utilisateur créé: {user.email}")
            
            member = Member.objects.filter(email=user_data['email']).first()
            
            if member:
                print(f"   ℹ️  Profil membre existant: {member.member_id}")
            else:
                member = Member.objects.create(
                    user=user,
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    email=user_data['email'],
                    tenant_id=default_center.tenant_id,
                    **member_data
                )
                print(f"   ✅ Profil membre créé: {member.member_id}")
                
        except Exception as e:
            print(f"❌ Erreur: {user_data['email']} - {e}")
    

    print("\n✅ Script terminé avec succès!")
    print("=" * 80)

if __name__ == '__main__':
    create_test_users()
