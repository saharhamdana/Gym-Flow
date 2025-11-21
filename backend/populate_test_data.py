#!/usr/bin/env python
"""
Script complet pour peupler la base de données avec des données de test
Exécuter avec: python manage.py shell < populate_test_data.py
"""

import os
import django
from datetime import date, time, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from authentication.models import User, GymCenter
from members.models import Member, MemberMeasurement
from subscriptions.models import SubscriptionPlan, Subscription
from bookings.models import Room, CourseType, Course, Booking


def create_comprehensive_test_data():
    """Crée un jeu de données complet pour tester l'application"""
    
    print("\n" + "=" * 80)
    print("🚀 CRÉATION COMPLÈTE DES DONNÉES DE TEST")
    print("=" * 80)
    
    # ============================================
    # 1. CRÉER LES CENTRES
    # ============================================
    print("\n📍 ÉTAPE 1 : Création des centres")
    print("-" * 80)
    
    # Créer un super-admin
    superadmin = User.objects.filter(is_superuser=True).first()
    if not superadmin:
        superadmin = User.objects.create_superuser(
            username='superadmin',
            email='superadmin@gymflow.com',
            password='admin123',
            first_name='Super',
            last_name='Admin'
        )
        print(f"✅ Super Admin créé: {superadmin.email}")
    else:
        print(f"ℹ️  Super Admin existant: {superadmin.email}")
    
    # PowerFit
    powerfit, created = GymCenter.objects.get_or_create(
        subdomain='powerfit',
        defaults={
            'name': 'PowerFit Gym',
            'email': 'contact@powerfit.com',
            'phone': '+33123456789',
            'address': '123 Rue du Sport, Paris 75001',
            'description': 'La meilleure salle de CrossFit à Paris',
            'owner': superadmin,
            'tenant_id': 'powerfit_tenant',
        }
    )
    print(f"{'✅ Créé' if created else 'ℹ️  Existant'}: {powerfit.name} ({powerfit.subdomain})")
    
    # TitanGym
    titangym, created = GymCenter.objects.get_or_create(
        subdomain='titangym',
        defaults={
            'name': 'TitanGym',
            'email': 'info@titangym.com',
            'phone': '+33987654321',
            'address': '456 Avenue des Champions, Lyon 69001',
            'description': 'Musculation et fitness à Lyon',
            'owner': superadmin,
            'tenant_id': 'titangym_tenant',
        }
    )
    print(f"{'✅ Créé' if created else 'ℹ️  Existant'}: {titangym.name} ({titangym.subdomain})")
    
    # ============================================
    # 2. CRÉER LES UTILISATEURS POUR POWERFIT
    # ============================================
    print("\n👥 ÉTAPE 2 : Création des utilisateurs PowerFit")
    print("-" * 80)
    
    # Admin PowerFit
    admin_powerfit, created = User.objects.get_or_create(
        email='admin.powerfit@gymflow.com',
        defaults={
            'username': 'admin.powerfit',
            'password': 'pbkdf2_sha256$870000$test$hash',
            'first_name': 'Admin',
            'last_name': 'PowerFit',
            'role': 'ADMIN',
            'tenant_id': powerfit.tenant_id,
        }
    )
    if created:
        admin_powerfit.set_password('admin123')
        admin_powerfit.save()
    print(f"{'✅ Créé' if created else 'ℹ️  Existant'}: Admin - {admin_powerfit.email}")
    
    # Coachs PowerFit
    coaches_data = [
        {
            'username': 'coach.marie',
            'email': 'marie.dupont@powerfit.com',
            'first_name': 'Marie',
            'last_name': 'Dupont',
            'phone': '+33612345671',
        },
        {
            'username': 'coach.thomas',
            'email': 'thomas.martin@powerfit.com',
            'first_name': 'Thomas',
            'last_name': 'Martin',
            'phone': '+33612345672',
        },
        {
            'username': 'coach.sarah',
            'email': 'sarah.bernard@powerfit.com',
            'first_name': 'Sarah',
            'last_name': 'Bernard',
            'phone': '+33612345673',
        }
    ]
    
    coaches = []
    for coach_data in coaches_data:
        coach, created = User.objects.get_or_create(
            email=coach_data['email'],
            defaults={
                **coach_data,
                'password': 'pbkdf2_sha256$870000$test$hash',
                'role': 'COACH',
                'tenant_id': powerfit.tenant_id,
            }
        )
        if created:
            coach.set_password('coach123')
            coach.save()
        coaches.append(coach)
        print(f"{'✅ Créé' if created else 'ℹ️  Existant'}: Coach - {coach.email}")
    
    # Réceptionniste PowerFit
    receptionist, created = User.objects.get_or_create(
        email='reception@powerfit.com',
        defaults={
            'username': 'reception.powerfit',
            'password': 'pbkdf2_sha256$870000$test$hash',
            'first_name': 'Julie',
            'last_name': 'Petit',
            'role': 'RECEPTIONIST',
            'tenant_id': powerfit.tenant_id,
        }
    )
    if created:
        receptionist.set_password('reception123')
        receptionist.save()
    print(f"{'✅ Créé' if created else 'ℹ️  Existant'}: Réceptionniste - {receptionist.email}")
    
    # ============================================
    # 3. CRÉER LES MEMBRES POUR POWERFIT
    # ============================================
    print("\n👤 ÉTAPE 3 : Création des membres PowerFit")
    print("-" * 80)
    
    members_data = [
        {
            'user': {
                'username': 'alice.moreau',
                'email': 'alice.moreau@gmail.com',
                'first_name': 'Alice',
                'last_name': 'Moreau',
            },
            'member': {
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
            'user': {
                'username': 'pierre.durand',
                'email': 'pierre.durand@gmail.com',
                'first_name': 'Pierre',
                'last_name': 'Durand',
            },
            'member': {
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
            'user': {
                'username': 'emma.laurent',
                'email': 'emma.laurent@gmail.com',
                'first_name': 'Emma',
                'last_name': 'Laurent',
            },
            'member': {
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
        },
        {
            'user': {
                'username': 'lucas.bernard',
                'email': 'lucas.bernard@gmail.com',
                'first_name': 'Lucas',
                'last_name': 'Bernard',
            },
            'member': {
                'phone': '+33645678901',
                'date_of_birth': date(1992, 11, 5),
                'gender': 'M',
                'address': '34 Rue Victor Hugo, Paris 75016',
                'emergency_contact_name': 'Claire Bernard',
                'emergency_contact_phone': '+33665432109',
                'height': Decimal('182.00'),
                'weight': Decimal('80.00'),
                'status': 'ACTIVE',
            }
        },
        {
            'user': {
                'username': 'sophie.martin',
                'email': 'sophie.martin@gmail.com',
                'first_name': 'Sophie',
                'last_name': 'Martin',
            },
            'member': {
                'phone': '+33656789012',
                'date_of_birth': date(1988, 7, 18),
                'gender': 'F',
                'address': '89 Boulevard Haussmann, Paris 75008',
                'emergency_contact_name': 'Pierre Martin',
                'emergency_contact_phone': '+33654321098',
                'height': Decimal('168.00'),
                'weight': Decimal('62.00'),
                'status': 'ACTIVE',
            }
        }
    ]
    
    members = []
    for member_info in members_data:
        user_data = member_info['user']
        member_data = member_info['member']
        
        # Créer l'utilisateur
        user, user_created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                **user_data,
                'password': 'pbkdf2_sha256$870000$test$hash',
                'role': 'MEMBER',
                'tenant_id': powerfit.tenant_id,
            }
        )
        if user_created:
            user.set_password('member123')
            user.save()
        
        # Créer le profil membre
        member, member_created = Member.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'user': user,
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'tenant_id': powerfit.tenant_id,
                **member_data
            }
        )
        members.append(member)
        print(f"{'✅ Créé' if member_created else 'ℹ️  Existant'}: Membre - {member.full_name} ({member.member_id})")
    
    # ============================================
    # 4. CRÉER LES PLANS D'ABONNEMENT
    # ============================================
    print("\n📋 ÉTAPE 4 : Création des plans d'abonnement")
    print("-" * 80)
    
    plans_data = [
        {
            'name': 'Mensuel Basic',
            'description': 'Accès illimité pendant 1 mois',
            'duration_days': 30,
            'price': Decimal('49.90'),
        },
        {
            'name': 'Trimestriel Standard',
            'description': 'Accès illimité pendant 3 mois',
            'duration_days': 90,
            'price': Decimal('129.90'),
        },
        {
            'name': 'Annuel Premium',
            'description': 'Accès illimité pendant 1 an + cours offerts',
            'duration_days': 365,
            'price': Decimal('449.90'),
        },
        {
            'name': 'Étudiant Mensuel',
            'description': 'Tarif réduit pour étudiants',
            'duration_days': 30,
            'price': Decimal('39.90'),
        }
    ]
    
    plans = []
    for plan_data in plans_data:
        plan, created = SubscriptionPlan.objects.get_or_create(
            name=plan_data['name'],
            tenant_id=powerfit.tenant_id,
            defaults={
                **plan_data,
                'tenant_id': powerfit.tenant_id,
            }
        )
        plans.append(plan)
        print(f"{'✅ Créé' if created else 'ℹ️  Existant'}: {plan.name} - {plan.price}€ ({plan.duration_days} jours)")
    
    # ============================================
    # 5. CRÉER LES ABONNEMENTS
    # ============================================
    print("\n💳 ÉTAPE 5 : Création des abonnements")
    print("-" * 80)
    
    today = timezone.now().date()
    
    for i, member in enumerate(members[:4]):  # 4 premiers membres ont un abonnement actif
        plan = plans[i % len(plans)]
        
        subscription, created = Subscription.objects.get_or_create(
            member=member,
            plan=plan,
            status='ACTIVE',
            defaults={
                'start_date': today - timedelta(days=10),
                'end_date': today + timedelta(days=plan.duration_days - 10),
                'amount_paid': plan.price,
                'payment_date': timezone.now(),
                'payment_method': 'Carte bancaire',
                'status': 'ACTIVE',
                'tenant_id': powerfit.tenant_id,
            }
        )
        
        if created:
            member.activate()
        
        print(f"{'✅ Créé' if created else 'ℹ️  Existant'}: Abonnement {member.full_name} - {plan.name}")
    
    # ============================================
    # 6. CRÉER LES SALLES
    # ============================================
    print("\n🏠 ÉTAPE 6 : Création des salles")
    print("-" * 80)
    
    rooms_data = [
        {'name': 'Salle A - CrossFit', 'capacity': 20, 'description': 'Salle équipée pour CrossFit'},
        {'name': 'Salle B - Cardio', 'capacity': 30, 'description': 'Vélos, tapis, rameurs'},
        {'name': 'Salle C - Musculation', 'capacity': 25, 'description': 'Poids libres et machines'},
        {'name': 'Studio Yoga', 'capacity': 15, 'description': 'Studio calme pour yoga et pilates'},
    ]
    
    rooms = []
    for room_data in rooms_data:
        room, created = Room.objects.get_or_create(
            name=room_data['name'],
            tenant_id=powerfit.tenant_id,
            defaults={
                **room_data,
                'tenant_id': powerfit.tenant_id,
            }
        )
        rooms.append(room)
        print(f"{'✅ Créé' if created else 'ℹ️  Existant'}: {room.name} (Capacité: {room.capacity})")
    
    # ============================================
    # 7. CRÉER LES TYPES DE COURS
    # ============================================
    print("\n🎓 ÉTAPE 7 : Création des types de cours")
    print("-" * 80)
    
    course_types_data = [
        {'name': 'CrossFit', 'color': '#FF5722', 'duration_minutes': 60},
        {'name': 'Yoga', 'color': '#4CAF50', 'duration_minutes': 75},
        {'name': 'Spinning', 'color': '#2196F3', 'duration_minutes': 45},
        {'name': 'HIIT', 'color': '#FFC107', 'duration_minutes': 30},
        {'name': 'Musculation', 'color': '#9C27B0', 'duration_minutes': 90},
        {'name': 'Pilates', 'color': '#00BCD4', 'duration_minutes': 60},
    ]
    
    course_types = []
    for ct_data in course_types_data:
        course_type, created = CourseType.objects.get_or_create(
            name=ct_data['name'],
            tenant_id=powerfit.tenant_id,
            defaults={
                **ct_data,
                'tenant_id': powerfit.tenant_id,
            }
        )
        course_types.append(course_type)
        print(f"{'✅ Créé' if created else 'ℹ️  Existant'}: {course_type.name} ({course_type.duration_minutes} min)")
    
    # ============================================
    # 8. CRÉER LES COURS
    # ============================================
    print("\n📅 ÉTAPE 8 : Création des cours")
    print("-" * 80)
    
    courses = []
    for day_offset in range(7):  # Cours pour les 7 prochains jours
        course_date = today + timedelta(days=day_offset)
        
        # 3 cours par jour
        times = [
            (time(9, 0), time(10, 0)),
            (time(14, 0), time(15, 30)),
            (time(18, 0), time(19, 0)),
        ]
        
        for start_time, end_time in times:
            course_type = course_types[day_offset % len(course_types)]
            coach = coaches[day_offset % len(coaches)]
            room = rooms[day_offset % len(rooms)]
            
            course, created = Course.objects.get_or_create(
                coach=coach,
                date=course_date,
                start_time=start_time,
                tenant_id=powerfit.tenant_id,
                defaults={
                    'course_type': course_type,
                    'title': f"{course_type.name} - Session {day_offset + 1}",
                    'room': room,
                    'end_time': end_time,
                    'max_participants': room.capacity - 5,
                    'status': 'SCHEDULED',
                    'description': f'Cours de {course_type.name} avec {coach.get_full_name()}',
                    'tenant_id': powerfit.tenant_id,
                }
            )
            courses.append(course)
            
            if created:
                print(f"✅ Créé: {course.title} - {course_date} à {start_time}")
    
    # ============================================
    # 9. CRÉER LES RÉSERVATIONS
    # ============================================
    print("\n🎫 ÉTAPE 9 : Création des réservations")
    print("-" * 80)
    
    # Chaque membre actif réserve 2-3 cours
    active_members = [m for m in members if m.status == 'ACTIVE']
    upcoming_courses = [c for c in courses if c.date >= today][:10]
    
    booking_count = 0
    for member in active_members:
        # Réserver 2-3 cours aléatoires
        import random
        num_bookings = random.randint(2, 3)
        selected_courses = random.sample(upcoming_courses, min(num_bookings, len(upcoming_courses)))
        
        for course in selected_courses:
            booking, created = Booking.objects.get_or_create(
                course=course,
                member=member,
                defaults={
                    'status': 'CONFIRMED',
                    'tenant_id': powerfit.tenant_id,
                }
            )
            
            if created:
                booking_count += 1
    
    print(f"✅ {booking_count} réservations créées")
    
    # ============================================
    # 10. CRÉER DES MESURES PHYSIQUES
    # ============================================
    print("\n📊 ÉTAPE 10 : Création des mesures physiques")
    print("-" * 80)
    
    for member in active_members[:3]:  # Mesures pour 3 membres
        for month_ago in [2, 1, 0]:
            measurement_date = today - timedelta(days=30 * month_ago)
            
            MemberMeasurement.objects.get_or_create(
                member=member,
                date=measurement_date,
                defaults={
                    'weight': member.weight - Decimal(month_ago),
                    'body_fat_percentage': Decimal('20.5') - Decimal(month_ago * 0.5),
                    'muscle_mass': Decimal('45.0') + Decimal(month_ago * 0.3),
                    'chest': Decimal('95.0'),
                    'waist': Decimal('75.0') - Decimal(month_ago * 0.5),
                    'hips': Decimal('98.0'),
                    'notes': f'Mesure du mois {month_ago + 1}'
                }
            )
        
        print(f"✅ Mesures créées pour {member.full_name}")
    
    # ============================================
    # RÉSUMÉ FINAL
    # ============================================
    print("\n" + "=" * 80)
    print("✅ CRÉATION DES DONNÉES TERMINÉE")
    print("=" * 80)
    print(f"""
📊 RÉSUMÉ :
   - Centres : {GymCenter.objects.count()}
   - Utilisateurs : {User.objects.count()}
   - Membres : {Member.objects.count()}
   - Plans d'abonnement : {SubscriptionPlan.objects.filter(tenant_id=powerfit.tenant_id).count()}
   - Abonnements actifs : {Subscription.objects.filter(tenant_id=powerfit.tenant_id, status='ACTIVE').count()}
   - Salles : {Room.objects.filter(tenant_id=powerfit.tenant_id).count()}
   - Types de cours : {CourseType.objects.filter(tenant_id=powerfit.tenant_id).count()}
   - Cours planifiés : {Course.objects.filter(tenant_id=powerfit.tenant_id).count()}
   - Réservations : {Booking.objects.filter(tenant_id=powerfit.tenant_id).count()}

🔐 COMPTES DE TEST :
   - Super Admin : superadmin@gymflow.com / admin123
   - Admin PowerFit : admin.powerfit@gymflow.com / admin123
   - Coach : marie.dupont@powerfit.com / coach123
   - Réceptionniste : reception@powerfit.com / reception123
   - Membre : alice.moreau@gmail.com / member123

🌐 ACCÈS :
   - Admin Panel : http://localhost:8000/admin/
   - API : http://powerfit.gymflow.com:8000/api/
   - Frontend : http://powerfit.gymflow.com:5173/
    """)
    print("=" * 80 + "\n")


if __name__ == '__main__':
    create_comprehensive_test_data()