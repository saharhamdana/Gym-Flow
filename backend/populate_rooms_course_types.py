#!/usr/bin/env python
"""
Script pour remplir les tables Room et CourseType avec des données de test
Usage: python populate_rooms_course_types.py
"""

import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from bookings.models import Room, CourseType

def create_rooms_and_course_types(tenant_id="demo-center"):
    """Créer des salles et types de cours pour un centre donné"""
    
    # Données des salles
    rooms_data = [
        {
            'name': 'Salle Cardio',
            'capacity': 20,
            'description': 'Salle équipée de tapis de course, vélos et elliptiques',
        },
        {
            'name': 'Salle Musculation',
            'capacity': 15,
            'description': 'Espace dédié à la musculation avec poids libres et machines',
        },
        {
            'name': 'Studio Yoga',
            'capacity': 25,
            'description': 'Studio calme avec tapis de yoga et accessoires',
        },
        {
            'name': 'Salle Polyvalente',
            'capacity': 30,
            'description': 'Grande salle pour cours collectifs et activités diverses',
        },
        {
            'name': 'Piscine',
            'capacity': 12,
            'description': 'Bassin de natation pour cours d\'aquagym et natation libre',
        },
        {
            'name': 'Studio Pilates',
            'capacity': 12,
            'description': 'Studio spécialisé avec équipements Pilates (reformer, ballons)',
        },
        {
            'name': 'Salle Boxing',
            'capacity': 10,
            'description': 'Salle avec sacs de frappe et ring pour sports de combat',
        },
        {
            'name': 'Terrain Squash',
            'capacity': 4,
            'description': 'Court de squash professionnel',
        }
    ]
    
    # Données des types de cours
    course_types_data = [
        {
            'name': 'Yoga Vinyasa',
            'description': 'Yoga dynamique avec enchaînements fluides',
            'color': '#8B5CF6',
            'duration_minutes': 75
        },
        {
            'name': 'Yoga Hatha',
            'description': 'Yoga doux avec maintien des postures',
            'color': '#06B6D4',
            'duration_minutes': 90
        },
        {
            'name': 'Pilates Mat',
            'description': 'Pilates au sol pour renforcer le core',
            'color': '#10B981',
            'duration_minutes': 60
        },
        {
            'name': 'Pilates Reformer',
            'description': 'Pilates avec machines pour un travail précis',
            'color': '#F59E0B',
            'duration_minutes': 55
        },
        {
            'name': 'HIIT',
            'description': 'Entraînement fractionné haute intensité',
            'color': '#EF4444',
            'duration_minutes': 45
        },
        {
            'name': 'Zumba',
            'description': 'Danse fitness sur musiques latines',
            'color': '#F97316',
            'duration_minutes': 60
        },
        {
            'name': 'Body Combat',
            'description': 'Cours inspiré des arts martiaux',
            'color': '#DC2626',
            'duration_minutes': 55
        },
        {
            'name': 'Body Pump',
            'description': 'Renforcement musculaire avec barres et poids',
            'color': '#7C3AED',
            'duration_minutes': 60
        },
        {
            'name': 'Spinning',
            'description': 'Vélo en salle avec musique motivante',
            'color': '#059669',
            'duration_minutes': 45
        },
        {
            'name': 'Aquagym',
            'description': 'Gymnastique aquatique douce et tonifiante',
            'color': '#0EA5E9',
            'duration_minutes': 45
        },
        {
            'name': 'Natation Libre',
            'description': 'Séance de natation en autonomie',
            'color': '#0284C7',
            'duration_minutes': 60
        },
        {
            'name': 'Stretching',
            'description': 'Séance d\'étirements et d\'assouplissement',
            'color': '#84CC16',
            'duration_minutes': 30
        },
        {
            'name': 'Functional Training',
            'description': 'Entraînement fonctionnel multi-exercices',
            'color': '#A855F7',
            'duration_minutes': 60
        },
        {
            'name': 'CrossFit',
            'description': 'Entraînement croisé haute intensité',
            'color': '#B91C1C',
            'duration_minutes': 60
        },
        {
            'name': 'Méditation',
            'description': 'Séance de méditation et relaxation',
            'color': '#6366F1',
            'duration_minutes': 30
        }
    ]
    
    print(f"🏢 Création des salles et types de cours pour le centre: {tenant_id}")
    print("=" * 60)
    
    # Créer les salles
    print("\n🏠 CRÉATION DES SALLES:")
    print("-" * 25)
    rooms_created = 0
    rooms_existing = 0
    
    for room_data in rooms_data:
        room, created = Room.objects.get_or_create(
            name=room_data['name'],
            tenant_id=tenant_id,
            defaults={
                'capacity': room_data['capacity'],
                'description': room_data['description'],
                'is_active': True
            }
        )
        
        if created:
            rooms_created += 1
            print(f"✅ Créé: {room.name} (Capacité: {room.capacity})")
        else:
            rooms_existing += 1
            print(f"⚠️  Existe déjà: {room.name}")
    
    # Créer les types de cours
    print(f"\n📚 CRÉATION DES TYPES DE COURS:")
    print("-" * 30)
    types_created = 0
    types_existing = 0
    
    for course_type_data in course_types_data:
        course_type, created = CourseType.objects.get_or_create(
            name=course_type_data['name'],
            tenant_id=tenant_id,
            defaults={
                'description': course_type_data['description'],
                'color': course_type_data['color'],
                'duration_minutes': course_type_data['duration_minutes'],
                'is_active': True
            }
        )
        
        if created:
            types_created += 1
            print(f"✅ Créé: {course_type.name} ({course_type.duration_minutes}min) {course_type.color}")
        else:
            types_existing += 1
            print(f"⚠️  Existe déjà: {course_type.name}")
    
    # Résumé
    print(f"\n📊 RÉSUMÉ POUR LE CENTRE '{tenant_id}':")
    print("-" * 40)
    print(f"🏠 Salles:")
    print(f"   ✅ Nouvelles: {rooms_created}")
    print(f"   ⚠️  Existantes: {rooms_existing}")
    print(f"   📈 Total: {Room.objects.filter(tenant_id=tenant_id).count()}")
    
    print(f"\n📚 Types de cours:")
    print(f"   ✅ Nouveaux: {types_created}")
    print(f"   ⚠️  Existants: {types_existing}")
    print(f"   📈 Total: {CourseType.objects.filter(tenant_id=tenant_id).count()}")
    
    print("\n✅ Salles et types de cours créés avec succès!")

def create_for_multiple_centers():
    """Créer des données pour plusieurs centres de test"""
    centers = [
        "demo-center",
        "fitness-plus", 
        "sport-center",
        "wellness-gym"
    ]
    
    print("🏢 Création pour plusieurs centres...")
    print("=" * 50)
    
    for center in centers:
        print(f"\n🎯 Centre: {center}")
        create_rooms_and_course_types(center)
        print()

if __name__ == "__main__":
    # Vous pouvez choisir de créer pour un seul centre ou plusieurs
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--multiple":
            create_for_multiple_centers()
        else:
            # Utiliser l'ID du centre passé en paramètre
            center_id = sys.argv[1]
            create_rooms_and_course_types(center_id)
    else:
        # Par défaut, créer pour le centre demo
        create_rooms_and_course_types("demo-center")