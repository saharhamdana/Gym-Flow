#!/usr/bin/env python
"""
SCRIPT ADMIN - Création des données administratives (corrigé pour vos modèles)
Exécuter avec: python manage.py shell < create_admin_data_fixed.py
"""

import os
import django
from decimal import Decimal

# Configurer Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from django.db import transaction
from authentication.models import User
from subscriptions.models import SubscriptionPlan
from bookings.models import CourseType
from coaching.models import ExerciseCategory, Exercise

def create_admin_data_fixed():
    print("CRÉATION DES DONNÉES ADMINISTRATIVES")
    print("=" * 60)
    
    with transaction.atomic():
        # 1. Créer un tenant_id par défaut pour les données globales
        default_tenant = "global_admin"
        
        # 2. Super Admin et administrateurs
        admin_users = create_admin_users(default_tenant)
        
        # 3. Plans d'abonnement globaux (CORRIGÉ)
        subscription_plans = create_global_subscription_plans_fixed(default_tenant)
        
        # 4. Types de cours standards
        course_types = create_global_course_types_fixed(default_tenant)
        
        # 5. Bibliothèque d'exercices complète
        exercises_data = create_complete_exercises_library_fixed(default_tenant, admin_users[0])
        
        # 6. Afficher le résumé
        print_admin_summary_fixed(admin_users, subscription_plans, course_types, exercises_data)
    
    print("\nDONNÉES ADMINISTRATIVES CRÉÉES AVEC SUCCÈS!")
    print("=" * 60)

def create_admin_users(tenant_id):
    """Créer les utilisateurs administrateurs avec tenant_id"""
    print("\n1. CRÉATION DES ADMINISTRATEURS...")
    
    admin_users = []
    
    # Super Admin
    superadmin, created = User.objects.get_or_create(
        username='superadmin',
        defaults={
            'email': 'superadmin@gymflow.com',
            'first_name': 'Super',
            'last_name': 'Admin',
            'role': 'ADMIN',
            'is_superuser': True,
            'is_staff': True,
            'is_active': True,
            'tenant_id': tenant_id,
        }
    )
    if created:
        superadmin.set_password('superadmin123')
        superadmin.save()
        print(f"SUPERADMIN CRÉÉ: {superadmin.email}")
    else:
        print(f"SUPERADMIN EXISTANT: {superadmin.email}")
    admin_users.append(superadmin)
    
    # Administrateurs système
    system_admins = [
        {
            'username': 'admin.system',
            'email': 'system.admin@gymflow.com',
            'first_name': 'System',
            'last_name': 'Administrator',
            'role': 'ADMIN',
        },
        {
            'username': 'admin.technical',
            'email': 'technical.admin@gymflow.com',
            'first_name': 'Technical',
            'last_name': 'Manager',
            'role': 'ADMIN',
        }
    ]
    
    for admin_data in system_admins:
        user, created = User.objects.get_or_create(
            username=admin_data['username'],
            defaults={
                'email': admin_data['email'],
                'first_name': admin_data['first_name'],
                'last_name': admin_data['last_name'],
                'role': admin_data['role'],
                'is_staff': True,
                'is_active': True,
                'tenant_id': tenant_id,
            }
        )
        if created:
            user.set_password('admin123')
            user.save()
            print(f"ADMIN SYSTÈME CRÉÉ: {user.email}")
            admin_users.append(user)
        else:
            print(f"ADMIN SYSTÈME EXISTANT: {user.email}")
    
    return admin_users

def create_global_subscription_plans_fixed(tenant_id):
    """Créer les plans d'abonnement globaux - CORRIGÉ pour votre modèle"""
    print("\n2. CRÉATION DES PLANS D'ABONNEMENT...")
    
    plans_data = [
        {
            'name': 'Starter',
            'description': 'Plan de base pour petites salles',
            'duration_days': 30,
            'price': Decimal('99.00'),
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Business',
            'description': 'Plan recommandé pour salles moyennes',
            'duration_days': 30,
            'price': Decimal('199.00'),
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Enterprise',
            'description': 'Plan premium pour grands centres',
            'duration_days': 30,
            'price': Decimal('399.00'),
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Annuel Business',
            'description': 'Plan annuel avec économie',
            'duration_days': 365,
            'price': Decimal('1990.00'),
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Essai Gratuit',
            'description': 'Essai de 14 jours',
            'duration_days': 14,
            'price': Decimal('0.00'),
            'is_active': True,
            'tenant_id': tenant_id,
        }
    ]
    
    created_plans = []
    for plan_data in plans_data:
        plan, created = SubscriptionPlan.objects.get_or_create(
            name=plan_data['name'],
            tenant_id=tenant_id,
            defaults=plan_data
        )
        if created:
            print(f"PLAN CRÉÉ: {plan.name} - {plan.price}€ - {plan.duration_days} jours")
            created_plans.append(plan)
        else:
            print(f"PLAN EXISTANT: {plan.name}")
    
    return created_plans

def create_global_course_types_fixed(tenant_id):
    """Créer les types de cours standards avec tenant_id"""
    print("\n3. CRÉATION DES TYPES DE COURS...")
    
    course_types_data = [
        {
            'name': 'Yoga',
            'description': 'Cours de yoga et relaxation',
            'color': '#10b981',
            'duration_minutes': 60,
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Pilates',
            'description': 'Renforcement musculaire et posture',
            'color': '#8b5cf6',
            'duration_minutes': 60,
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Cardio Training',
            'description': 'Entraînement cardiovasculaire intensif',
            'color': '#3b82f6',
            'duration_minutes': 45,
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Musculation',
            'description': 'Renforcement musculaire avec poids',
            'color': '#ef4444',
            'duration_minutes': 90,
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Zumba',
            'description': 'Danse fitness énergique',
            'color': '#f59e0b',
            'duration_minutes': 45,
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'CrossFit',
            'description': 'Entraînement fonctionnel haute intensité',
            'color': '#dc2626',
            'duration_minutes': 60,
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Stretching',
            'description': 'Étirements et flexibilité',
            'color': '#06b6d4',
            'duration_minutes': 30,
            'is_active': True,
            'tenant_id': tenant_id,
        },
        {
            'name': 'Boxe Fitness',
            'description': 'Cardio avec techniques de boxe',
            'color': '#7c3aed',
            'duration_minutes': 50,
            'is_active': True,
            'tenant_id': tenant_id,
        }
    ]
    
    created_types = []
    for type_data in course_types_data:
        course_type, created = CourseType.objects.get_or_create(
            name=type_data['name'],
            tenant_id=tenant_id,
            defaults=type_data
        )
        if created:
            print(f"TYPE DE COURS CRÉÉ: {course_type.name}")
            created_types.append(course_type)
        else:
            print(f"TYPE DE COURS EXISTANT: {course_type.name}")
    
    return created_types

def create_complete_exercises_library_fixed(tenant_id, admin_user):
    """Créer la bibliothèque complète d'exercices"""
    print("\n4. CRÉATION DE LA BIBLIOTHÈQUE D'EXERCICES...")
    
    # Créer les catégories d'exercices
    categories_data = [
        {
            'name': 'Bodybuilding',
            'description': 'Exercices de musculation pour le développement musculaire'
        },
        {
            'name': 'Cardio',
            'description': 'Exercices cardiovasculaires pour l endurance'
        },
        {
            'name': 'CrossFit',
            'description': 'Exercices fonctionnels haute intensité'
        },
        {
            'name': 'Stretching',
            'description': 'Exercices d étirement et de flexibilité'
        },
        {
            'name': 'Pilates',
            'description': 'Exercices de renforcement profond'
        },
        {
            'name': 'Yoga',
            'description': 'Postures et enchainements de yoga'
        }
    ]
    
    categories = {}
    for cat_data in categories_data:
        category, created = ExerciseCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        categories[cat_data['name']] = category
        if created:
            print(f"CATÉGORIE CRÉÉE: {category.name}")
    
    # Créer les exercices
    exercises_data = [
        # BODYBUILDING
        {
            'name': 'Développé Couché', 
            'category': 'Bodybuilding', 
            'difficulty': 'intermediate', 
            'equipment': 'Barre, Banc, Poids',
            'description': 'Exercice de base pour les pectoraux. Allongé sur un banc, descendez la barre jusqu à la poitrine puis poussez vers le haut.'
        },
        {
            'name': 'Squat', 
            'category': 'Bodybuilding', 
            'difficulty': 'intermediate', 
            'equipment': 'Barre, Rack à squat',
            'description': 'Exercice fondamental pour les jambes et fessiers. Descendez en gardant le dos droit, genoux alignés avec les pieds.'
        },
        {
            'name': 'Soulevé de Terre', 
            'category': 'Bodybuilding', 
            'difficulty': 'advanced', 
            'equipment': 'Barre, Poids',
            'description': 'Exercice complet du corps. Soulevez la barre du sol en gardant le dos droit et en poussant avec les jambes.'
        },
        {
            'name': 'Curl Biceps', 
            'category': 'Bodybuilding', 
            'difficulty': 'beginner', 
            'equipment': 'Haltères',
            'description': 'Exercice d isolation pour les biceps. Fléchissez les coudes en gardant les bras le long du corps.'
        },
        
        # CARDIO
        {
            'name': 'Course à Pied', 
            'category': 'Cardio', 
            'difficulty': 'beginner', 
            'equipment': 'Tapis de course',
            'description': 'Exercice cardiovasculaire de base. Maintenez un rythme constant adapté à votre niveau.'
        },
        {
            'name': 'Vélo', 
            'category': 'Cardio', 
            'difficulty': 'beginner', 
            'equipment': 'Vélo stationnaire',
            'description': 'Exercice cardio à faible impact. Pédalez à intensité modérée à élevée.'
        },
        {
            'name': 'Rameur', 
            'category': 'Cardio', 
            'difficulty': 'intermediate', 
            'equipment': 'Rameur',
            'description': 'Exercice cardio complet du corps. Tirez la poignée vers vous en poussant avec les jambes.'
        },
        
        # CROSSFIT
        {
            'name': 'Wall Balls', 
            'category': 'CrossFit', 
            'difficulty': 'intermediate', 
            'equipment': 'Medicine Ball',
            'description': 'Lancez un medecine ball contre un mur en faisant un squat.'
        },
        {
            'name': 'Box Jumps', 
            'category': 'CrossFit', 
            'difficulty': 'intermediate', 
            'equipment': 'Box de saut',
            'description': 'Sautez sur une box en atterrissant avec les deux pieds.'
        },
        
        # STRETCHING
        {
            'name': 'Étirement Ischio-Jambiers', 
            'category': 'Stretching', 
            'difficulty': 'beginner', 
            'equipment': 'Tapis',
            'description': 'Allongé sur le dos, levez une jambe tendue et tirez doucement vers vous.'
        },
        {
            'name': 'Étirement Quadriceps', 
            'category': 'Stretching', 
            'difficulty': 'beginner', 
            'equipment': 'Aucun',
            'description': 'Debout, pliez une jambe derrière vous et tenez votre cheville.'
        },
        
        # PILATES
        {
            'name': 'Hundred', 
            'category': 'Pilates', 
            'difficulty': 'beginner', 
            'equipment': 'Tapis',
            'description': 'Exercice de respiration et de renforcement abdominal.'
        },
        
        # YOGA
        {
            'name': 'Sun Salutation', 
            'category': 'Yoga', 
            'difficulty': 'beginner', 
            'equipment': 'Tapis de yoga',
            'description': 'Enchainement de postures de yoga pour échauffer le corps.'
        },
    ]
    
    created_count = 0
    for exercise_data in exercises_data:
        exercise, created = Exercise.objects.get_or_create(
            name=exercise_data['name'],
            defaults={
                'description': exercise_data['description'],
                'category': categories[exercise_data['category']],
                'difficulty': exercise_data['difficulty'],
                'equipment_needed': exercise_data['equipment'],
                'created_by': admin_user
            }
        )
        if created:
            created_count += 1
            print(f"  EXERCICE CRÉÉ: {exercise.name}")
    
    print(f"TOTAL EXERCICES CRÉÉS: {created_count}")
    
    return {
        'categories': len(categories),
        'exercises': created_count,
        'by_category': {cat: Exercise.objects.filter(category=cat_obj).count() 
                       for cat, cat_obj in categories.items()}
    }

def print_admin_summary_fixed(admin_users, subscription_plans, course_types, exercises_data):
    """Afficher le résumé des données créées"""
    print("\n" + "=" * 60)
    print("RÉSUMÉ DES DONNÉES ADMINISTRATIVES")
    print("=" * 60)
    
    print(f"\nADMINISTRATEURS: {len(admin_users)}")
    for admin in admin_users:
        print(f"  - {admin.username} ({admin.email}) - Tenant: {admin.tenant_id}")
    
    print(f"\nPLANS D'ABONNEMENT: {len(subscription_plans)}")
    for plan in subscription_plans:
        print(f"  - {plan.name} - {plan.price}€ - {plan.duration_days} jours - Tenant: {plan.tenant_id}")
    
    print(f"\nTYPES DE COURS: {len(course_types)}")
    for course_type in course_types:
        print(f"  - {course_type.name} ({course_type.duration_minutes}min) - Tenant: {course_type.tenant_id}")
    
    print(f"\nBIBLIOTHÈQUE D'EXERCICES:")
    print(f"  - Catégories: {exercises_data['categories']}")
    print(f"  - Exercices totaux: {exercises_data['exercises']}")
    for category, count in exercises_data['by_category'].items():
        print(f"    * {category}: {count} exercices")
    
    print("\nIDENTIFIANTS DE CONNEXION:")
    print("  SuperAdmin: superadmin / superadmin123")
    print("  Admin système: admin.system / admin123")
    print("  Admin technique: admin.technical / admin123")

if __name__ == '__main__':
    create_admin_data_fixed()