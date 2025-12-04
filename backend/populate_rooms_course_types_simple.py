#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import django

# Ajouter le répertoire parent au Python path
sys.path.insert(0, os.path.abspath('.'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from bookings.models import Room, CourseType
from authentication.models import GymCenter
from authentication.models import User


def create_rooms_and_course_types(tenant_id='demo-center'):
    """
    Crée des salles et types de cours pour un centre donné
    """
    
    # Vérifier que le centre existe
    try:
        tenant = GymCenter.objects.get(subdomain=tenant_id)
    except GymCenter.DoesNotExist:
        print(f"[ERREUR] Centre '{tenant_id}' non trouve!")
        return
    
    print(f"Creation des salles et types de cours pour le centre: {tenant_id}")
    print("=" * 60)
    
    # === SALLES ===
    rooms_data = [
        {
            'name': 'Salle de Cardio',
            'description': 'Salle équipée de tapis de course, vélos elliptiques et rameurs',
            'capacity': 25,
            'equipment': 'Tapis de course, vélos, elliptiques, rameurs'
        },
        {
            'name': 'Salle de Musculation',
            'description': 'Salle principale avec machines et poids libres',
            'capacity': 30,
            'equipment': 'Machines guidées, poids libres, bancs, barres'
        },
        {
            'name': 'Studio Yoga',
            'description': 'Studio calme pour yoga et pilates',
            'capacity': 20,
            'equipment': 'Tapis de yoga, blocs, sangles, coussins'
        },
        {
            'name': 'Salle de Cours Collectifs',
            'description': 'Grande salle pour les cours de groupe',
            'capacity': 35,
            'equipment': 'Sono, miroirs, steps, ballons, élastiques'
        },
        {
            'name': 'Piscine',
            'description': 'Bassin 25m pour natation et aqua-fitness',
            'capacity': 15,
            'equipment': 'Lignes d\'eau, planches, frites, accessoires aqua'
        },
        {
            'name': 'Salle de Boxe',
            'description': 'Espace dédié aux sports de combat',
            'capacity': 16,
            'equipment': 'Sacs de frappe, ring, gants, protections'
        },
        {
            'name': 'Studio Spinning',
            'description': 'Salle spécialisée pour les cours de vélo indoor',
            'capacity': 20,
            'equipment': 'Vélos de spinning, sono, éclairage dynamique'
        },
        {
            'name': 'Espace Détente',
            'description': 'Zone relaxation avec sauna et vestiaires',
            'capacity': 12,
            'equipment': 'Sauna, bancs, douches, casiers'
        }
    ]

    print("Creation des salles...")
    rooms_created = 0
    rooms_existing = 0

    for room_data in rooms_data:
        room, created = Room.objects.get_or_create(
            name=room_data['name'],
            tenant_id=tenant.tenant_id,
            defaults={
                'description': room_data['description'],
                'capacity': room_data['capacity'],
                'is_active': True
            }
        )
        
        if created:
            rooms_created += 1
            print(f"  [CREE] {room.name} (capacité: {room.capacity})")
        else:
            rooms_existing += 1
            print(f"  [EXISTE] {room.name}")

    # === TYPES DE COURS ===
    course_types_data = [
        {
            'name': 'HIIT',
            'description': 'High Intensity Interval Training - Entraînement fractionné haute intensité',
            'duration_minutes': 45,
            'difficulty_level': 'INTERMEDIATE',
            'category': 'Cardio',
            'max_participants': 15
        },
        {
            'name': 'Zumba',
            'description': 'Cours de danse fitness sur rythmes latins',
            'duration_minutes': 60,
            'difficulty_level': 'BEGINNER',
            'category': 'Danse Fitness',
            'max_participants': 25
        },
        {
            'name': 'Pilates',
            'description': 'Renforcement musculaire et souplesse',
            'duration_minutes': 50,
            'difficulty_level': 'INTERMEDIATE',
            'category': 'Renforcement',
            'max_participants': 18
        },
        {
            'name': 'Yoga Vinyasa',
            'description': 'Yoga dynamique synchronisé avec la respiration',
            'duration_minutes': 75,
            'difficulty_level': 'INTERMEDIATE',
            'category': 'Yoga',
            'max_participants': 20
        },
        {
            'name': 'CrossFit',
            'description': 'Entraînement fonctionnel haute intensité',
            'duration_minutes': 60,
            'difficulty_level': 'ADVANCED',
            'category': 'Fonctionnel',
            'max_participants': 12
        },
        {
            'name': 'Aqua Fitness',
            'description': 'Cours de fitness dans l\'eau',
            'duration_minutes': 45,
            'difficulty_level': 'BEGINNER',
            'category': 'Aquatique',
            'max_participants': 15
        },
        {
            'name': 'Body Pump',
            'description': 'Renforcement musculaire avec barres et poids',
            'duration_minutes': 55,
            'difficulty_level': 'INTERMEDIATE',
            'category': 'Renforcement',
            'max_participants': 20
        },
        {
            'name': 'Spinning',
            'description': 'Vélo indoor sur musique motivante',
            'duration_minutes': 45,
            'difficulty_level': 'INTERMEDIATE',
            'category': 'Cardio',
            'max_participants': 20
        },
        {
            'name': 'Stretching',
            'description': 'Cours d\'étirements et relaxation',
            'duration_minutes': 30,
            'difficulty_level': 'BEGINNER',
            'category': 'Bien-être',
            'max_participants': 25
        },
        {
            'name': 'Boxe Fitness',
            'description': 'Cours de boxe sans contact, sur musique',
            'duration_minutes': 50,
            'difficulty_level': 'INTERMEDIATE',
            'category': 'Combat',
            'max_participants': 16
        },
        {
            'name': 'TRX',
            'description': 'Entraînement en suspension avec sangles',
            'duration_minutes': 45,
            'difficulty_level': 'ADVANCED',
            'category': 'Fonctionnel',
            'max_participants': 12
        },
        {
            'name': 'Yoga Débutant',
            'description': 'Introduction aux bases du yoga',
            'duration_minutes': 60,
            'difficulty_level': 'BEGINNER',
            'category': 'Yoga',
            'max_participants': 20
        },
        {
            'name': 'Circuit Training',
            'description': 'Parcours d\'exercices variés en rotation',
            'duration_minutes': 50,
            'difficulty_level': 'INTERMEDIATE',
            'category': 'Fonctionnel',
            'max_participants': 18
        },
        {
            'name': 'Abdos-Fessiers',
            'description': 'Renforcement ciblé abdominaux et fessiers',
            'duration_minutes': 30,
            'difficulty_level': 'BEGINNER',
            'category': 'Renforcement',
            'max_participants': 25
        },
        {
            'name': 'Yoga Prénatal',
            'description': 'Yoga adapté aux femmes enceintes',
            'duration_minutes': 60,
            'difficulty_level': 'BEGINNER',
            'category': 'Yoga',
            'max_participants': 12
        }
    ]

    print("\nCreation des types de cours...")
    courses_created = 0
    courses_existing = 0

    for course_data in course_types_data:
        course_type, created = CourseType.objects.get_or_create(
            name=course_data['name'],
            tenant_id=tenant.tenant_id,
            defaults={
                'description': course_data['description'],
                'duration_minutes': course_data['duration_minutes'],
                'is_active': True
            }
        )
        
        if created:
            courses_created += 1
            print(f"  [CREE] {course_type.name} ({course_type.duration_minutes}min)")
        else:
            courses_existing += 1
            print(f"  [EXISTE] {course_type.name}")

    # === RÉSUMÉ ===
    print(f"\n" + "="*60)
    print(f"RESUME POUR LE CENTRE: {tenant_id}")
    print(f"  Salles creees: {rooms_created}")
    print(f"  Salles existantes: {rooms_existing}")
    print(f"  Types de cours crees: {courses_created}")
    print(f"  Types de cours existants: {courses_existing}")
    print(f"  Total salles: {Room.objects.filter(tenant_id=tenant.tenant_id).count()}")
    print(f"  Total types de cours: {CourseType.objects.filter(tenant_id=tenant.tenant_id).count()}")
    print("Salles et types de cours crees avec succes!")


if __name__ == "__main__":
    # Récupérer l'argument tenant_id depuis la ligne de commande
    if len(sys.argv) > 1:
        tenant_id = sys.argv[1]
    else:
        tenant_id = 'demo-center'
    
    create_rooms_and_course_types(tenant_id)