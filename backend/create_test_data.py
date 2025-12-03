# backend/create_test_data.py

import os
import django
from django.utils import timezone
from datetime import timedelta, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from authentication.models import User, GymCenter
from members.models import Member
from subscriptions.models import SubscriptionPlan, Subscription
from bookings.models import Room, CourseType, Course, Booking
from coaching.models import (
    ExerciseCategory, Exercise, TrainingProgram,
    WorkoutSession, WorkoutExercise, ProgressTracking
)

def create_test_data():
    print("🚀 Création des données de test...")
    
    # ============================================
    # 1. CRÉER LES CENTRES (TENANTS)
    # ============================================
    print("\n📍 Création des centres...")
    
    # Super admin global
    super_admin = User.objects.create_superuser(
        username='superadmin',
        email='superadmin@gymflow.com',
        password='Admin123!',
        first_name='Super',
        last_name='Admin'
    )
    print("✅ Super Admin créé")
    
    # Centre 1: PowerFit
    powerfit = GymCenter.objects.create(
        name='PowerFit',
        subdomain='powerfit',
        email='contact@powerfit.com',
        phone='+21612345678',
        address='123 Rue de la Force, Tunis',
        owner=super_admin,
        tenant_id='powerfit',
        description='Centre de musculation et fitness de haute performance'
    )
    print("✅ Centre PowerFit créé")
    
    # Centre 2: MoveUp
    moveup = GymCenter.objects.create(
        name='MoveUp',
        subdomain='moveup',
        email='contact@moveup.com',
        phone='+21687654321',
        address='456 Avenue du Sport, Tunis',
        owner=super_admin,
        tenant_id='moveup',
        description='Studio de yoga et pilates'
    )
    print("✅ Centre MoveUp créé")
    
    # ============================================
    # 2. CRÉER LES UTILISATEURS POUR POWERFIT
    # ============================================
    print("\n👥 Création des utilisateurs PowerFit...")
    
    # Admin PowerFit
    admin_powerfit = User.objects.create_user(
        username='admin_powerfit',
        email='admin@powerfit.com',
        password='Admin123!',
        first_name='Admin',
        last_name='PowerFit',
        role='ADMIN',
        tenant_id='powerfit',
        phone='+21611111111'
    )
    print("✅ Admin PowerFit créé")
    
    # Coach PowerFit
    coach_powerfit = User.objects.create_user(
        username='coach_powerfit',
        email='coach@powerfit.com',
        password='Coach123!',
        first_name='Ahmed',
        last_name='Benali',
        role='COACH',
        tenant_id='powerfit',
        phone='+21622222222'
    )
    print("✅ Coach PowerFit créé")
    
    # Réceptionniste PowerFit
    receptionist_powerfit = User.objects.create_user(
        username='receptionist_powerfit',
        email='reception@powerfit.com',
        password='Reception123!',
        first_name='Fatima',
        last_name='Trabelsi',
        role='RECEPTIONIST',
        tenant_id='powerfit',
        phone='+21633333333'
    )
    print("✅ Réceptionniste PowerFit créée")
    
    # Membre PowerFit
    member_user_powerfit = User.objects.create_user(
        username='john_powerfit',
        email='john@powerfit.com',
        password='Member123!',
        first_name='John',
        last_name='Doe',
        role='MEMBER',
        tenant_id='powerfit',
        phone='+21644444444'
    )
    print("✅ Utilisateur membre PowerFit créé")
    
    # ============================================
    # 3. CRÉER LE PROFIL MEMBRE POUR POWERFIT
    # ============================================
    print("\n🏋️ Création du profil membre PowerFit...")
    
    member_powerfit = Member.objects.create(
        user=member_user_powerfit,
        first_name='John',
        last_name='Doe',
        email='john@powerfit.com',
        phone='+21644444444',
        date_of_birth=date(1990, 5, 15),
        gender='M',
        address='789 Rue Test, Tunis',
        emergency_contact_name='Jane Doe',
        emergency_contact_phone='+21655555555',
        height=180,
        weight=85,
        status='INACTIVE',  # Sera activé lors de la souscription
        tenant_id='powerfit'
    )
    print(f"✅ Membre PowerFit créé: {member_powerfit.member_id}")
    
    # ============================================
    # 4. CRÉER LES PLANS D'ABONNEMENT
    # ============================================
    print("\n💳 Création des plans d'abonnement...")
    
    plan_mensuel = SubscriptionPlan.objects.create(
        name='Mensuel',
        description='Accès illimité pendant 1 mois',
        duration_days=30,
        price=150.00,
        is_active=True
    )
    
    plan_trimestriel = SubscriptionPlan.objects.create(
        name='Trimestriel',
        description='Accès illimité pendant 3 mois',
        duration_days=90,
        price=400.00,
        is_active=True
    )
    
    plan_annuel = SubscriptionPlan.objects.create(
        name='Annuel',
        description='Accès illimité pendant 1 an',
        duration_days=365,
        price=1500.00,
        is_active=True
    )
    print("✅ Plans d'abonnement créés")
    
    # ============================================
    # 5. CRÉER UN ABONNEMENT ACTIF
    # ============================================
    print("\n📅 Création d'un abonnement actif...")
    
    today = timezone.now().date()
    subscription = Subscription.objects.create(
        member=member_powerfit,
        plan=plan_trimestriel,
        start_date=today,
        end_date=today + timedelta(days=90),
        status='PENDING',  # Sera activé ensuite
        amount_paid=400.00,
        payment_method='Carte bancaire'
    )
    subscription.activate()  # Active l'abonnement ET le membre
    print(f"✅ Abonnement actif créé (expire le {subscription.end_date})")
    
    # ============================================
    # 6. CRÉER LES SALLES ET TYPES DE COURS
    # ============================================
    print("\n🏢 Création des salles et types de cours...")
    
    salle_musculation = Room.objects.create(
        name='Salle de Musculation',
        capacity=30,
        description='Équipement complet de musculation',
        is_active=True
    )
    
    salle_cardio = Room.objects.create(
        name='Salle Cardio',
        capacity=20,
        description='Vélos, tapis de course, elliptiques',
        is_active=True
    )
    
    type_muscu = CourseType.objects.create(
        name='Musculation',
        description='Renforcement musculaire',
        color='#FF5722',
        duration_minutes=60,
        is_active=True
    )
    
    type_cardio = CourseType.objects.create(
        name='Cardio Training',
        description='Entraînement cardiovasculaire',
        color='#2196F3',
        duration_minutes=45,
        is_active=True
    )
    print("✅ Salles et types de cours créés")
    
    # ============================================
    # 7. CRÉER DES COURS
    # ============================================
    print("\n📚 Création des cours...")
    
    # Cours dans 2 jours
    course_1 = Course.objects.create(
        title='Musculation Débutants',
        description='Session pour débutants',
        course_type=type_muscu,
        coach=coach_powerfit,
        room=salle_musculation,
        date=today + timedelta(days=2),
        start_time='09:00',
        end_time='10:00',
        max_participants=15,
        status='SCHEDULED'
    )
    
    # Cours dans 5 jours
    course_2 = Course.objects.create(
        title='Cardio Intensif',
        description='Session cardio haute intensité',
        course_type=type_cardio,
        coach=coach_powerfit,
        room=salle_cardio,
        date=today + timedelta(days=5),
        start_time='10:00',
        end_time='10:45',
        max_participants=20,
        status='SCHEDULED'
    )
    print("✅ Cours créés")
    
    # ============================================
    # 8. CRÉER UNE RÉSERVATION
    # ============================================
    print("\n🎫 Création d'une réservation...")
    
    booking = Booking.objects.create(
        course=course_1,
        member=member_powerfit,
        status='CONFIRMED',
        notes='Première réservation'
    )
    print("✅ Réservation créée")
    
    # ============================================
    # 9. CRÉER LES CATÉGORIES D'EXERCICES
    # ============================================
    print("\n💪 Création des catégories d'exercices...")
    
    cat_pectoraux = ExerciseCategory.objects.create(
        name='Pectoraux',
        description='Exercices pour les pectoraux'
    )
    
    cat_dos = ExerciseCategory.objects.create(
        name='Dos',
        description='Exercices pour le dos'
    )
    
    cat_jambes = ExerciseCategory.objects.create(
        name='Jambes',
        description='Exercices pour les jambes'
    )
    print("✅ Catégories d'exercices créées")
    
    # ============================================
    # 10. CRÉER DES EXERCICES
    # ============================================
    print("\n🏋️ Création des exercices...")
    
    exercise_1 = Exercise.objects.create(
        name='Développé Couché',
        description='Exercice de base pour les pectoraux',
        category=cat_pectoraux,
        difficulty='intermediate',
        equipment_needed='Barre, disques',
        created_by=coach_powerfit
    )
    
    exercise_2 = Exercise.objects.create(
        name='Tractions',
        description='Exercice au poids du corps pour le dos',
        category=cat_dos,
        difficulty='advanced',
        equipment_needed='Barre de traction',
        created_by=coach_powerfit
    )
    
    exercise_3 = Exercise.objects.create(
        name='Squat',
        description='Exercice roi pour les jambes',
        category=cat_jambes,
        difficulty='intermediate',
        equipment_needed='Barre, disques',
        created_by=coach_powerfit
    )
    print("✅ Exercices créés")
    
    # ============================================
    # 11. CRÉER UN PROGRAMME D'ENTRAÎNEMENT
    # ============================================
    print("\n📋 Création d'un programme d'entraînement...")
    
    program = TrainingProgram.objects.create(
        title='Programme Full Body Débutant',
        description='Programme complet 3 fois par semaine',
        member=member_powerfit,
        coach=coach_powerfit,
        status='active',
        start_date=today,
        end_date=today + timedelta(weeks=8),
        duration_weeks=8,
        goal='Prise de masse musculaire et amélioration de la condition physique',
        target_weight=90.0,
        notes='Progression progressive sur 8 semaines'
    )
    print("✅ Programme créé")
    
    # ============================================
    # 12. CRÉER UNE SESSION D'ENTRAÎNEMENT
    # ============================================
    print("\n📝 Création d'une session d'entraînement...")
    
    session = WorkoutSession.objects.create(
        program=program,
        title='Séance A - Full Body',
        day_of_week=1,  # Lundi
        week_number=1,
        duration_minutes=60,
        notes='Échauffement 10 min avant',
        order=1
    )
    print("✅ Session créée")
    
    # ============================================
    # 13. AJOUTER DES EXERCICES À LA SESSION
    # ============================================
    print("\n➕ Ajout d'exercices à la session...")
    
    WorkoutExercise.objects.create(
        workout_session=session,
        exercise=exercise_1,
        sets=3,
        reps='10-12',
        rest_seconds=90,
        weight='20kg',
        order=1
    )
    
    WorkoutExercise.objects.create(
        workout_session=session,
        exercise=exercise_3,
        sets=4,
        reps='8-10',
        rest_seconds=120,
        weight='40kg',
        order=2
    )
    print("✅ Exercices ajoutés à la session")
    
    # ============================================
    # 14. CRÉER UN SUIVI DE PROGRESSION
    # ============================================
    print("\n📊 Création d'un suivi de progression...")
    
    ProgressTracking.objects.create(
        member=member_powerfit,
        program=program,
        date=today,
        weight=85.0,
        body_fat_percentage=18.5,
        chest=100.0,
        waist=85.0,
        hips=95.0,
        arms=35.0,
        thighs=55.0,
        notes='Mesures initiales'
    )
    print("✅ Suivi de progression créé")
    
    # ============================================
    # 15. CRÉER DES UTILISATEURS POUR MOVEUP
    # ============================================
    print("\n👥 Création des utilisateurs MoveUp...")
    
    admin_moveup = User.objects.create_user(
        username='admin_moveup',
        email='admin@moveup.com',
        password='Admin123!',
        first_name='Admin',
        last_name='MoveUp',
        role='ADMIN',
        tenant_id='moveup',
        phone='+21666666666'
    )
    print("✅ Admin MoveUp créé")
    
    # ============================================
    # RÉSUMÉ
    # ============================================
    print("\n" + "="*50)
    print("✅ DONNÉES DE TEST CRÉÉES AVEC SUCCÈS!")
    print("="*50)
    print("\n📍 CENTRES CRÉÉS:")
    print(f"  • PowerFit (powerfit.gymflow.com)")
    print(f"  • MoveUp (moveup.gymflow.com)")
    
    print("\n👥 UTILISATEURS POWERFIT:")
    print(f"  • Admin: admin@powerfit.com / Admin123!")
    print(f"  • Coach: coach@powerfit.com / Coach123!")
    print(f"  • Réception: reception@powerfit.com / Reception123!")
    print(f"  • Membre: john@powerfit.com / Member123!")
    
    print("\n👥 UTILISATEURS MOVEUP:")
    print(f"  • Admin: admin@moveup.com / Admin123!")
    
    print("\n📋 DONNÉES CRÉÉES:")
    print(f"  • Membre ID: {member_powerfit.member_id}")
    print(f"  • Abonnement actif jusqu'au: {subscription.end_date}")
    print(f"  • {Course.objects.count()} cours planifiés")
    print(f"  • {Booking.objects.count()} réservation(s)")
    print(f"  • {Exercise.objects.count()} exercices")
    print(f"  • {TrainingProgram.objects.count()} programme(s)")
    print(f"  • {ProgressTracking.objects.count()} suivi(s) de progression")
    
    print("\n🎯 PRÊT POUR LES TESTS POSTMAN!")
    print("="*50)

if __name__ == '__main__':
    create_test_data()