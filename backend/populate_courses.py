#!/usr/bin/env python
"""
Script pour remplir la table Course avec des données de test
Usage: python populate_courses.py [tenant_id]
"""

import os
import sys
import django
from datetime import datetime, timedelta, time
import random

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from bookings.models import Room, CourseType, Course
from authentication.models import User

def create_courses(tenant_id="demo-center", days_ahead=14):
    """Créer des cours pour les prochains jours"""
    
    # Récupérer les salles, types de cours et coachs pour ce centre
    rooms = list(Room.objects.filter(tenant_id=tenant_id, is_active=True))
    course_types = list(CourseType.objects.filter(tenant_id=tenant_id, is_active=True))
    coaches = list(User.objects.filter(role__in=['COACH', 'ADMIN']))
    
    if not rooms:
        print(f"❌ Aucune salle trouvée pour le centre '{tenant_id}'")
        print("💡 Exécutez d'abord: python populate_rooms_course_types.py")
        return
    
    if not course_types:
        print(f"❌ Aucun type de cours trouvé pour le centre '{tenant_id}'")
        print("💡 Exécutez d'abord: python populate_rooms_course_types.py")
        return
    
    if not coaches:
        print("❌ Aucun coach trouvé dans la base de données")
        print("💡 Créez d'abord des utilisateurs avec le rôle COACH ou ADMIN")
        return
    
    print(f"📅 Création des cours pour le centre: {tenant_id}")
    print(f"📊 Ressources disponibles:")
    print(f"   🏠 Salles: {len(rooms)}")
    print(f"   📚 Types de cours: {len(course_types)}")
    print(f"   👨‍💼 Coachs: {len(coaches)}")
    print("=" * 60)
    
    # Créneaux horaires possibles
    time_slots = [
        (time(7, 0), time(8, 0)),    # 07:00-08:00
        (time(8, 30), time(9, 30)),  # 08:30-09:30
        (time(10, 0), time(11, 0)),  # 10:00-11:00
        (time(11, 30), time(12, 30)), # 11:30-12:30
        (time(14, 0), time(15, 0)),  # 14:00-15:00
        (time(15, 30), time(16, 30)), # 15:30-16:30
        (time(17, 0), time(18, 0)),  # 17:00-18:00
        (time(18, 30), time(19, 30)), # 18:30-19:30
        (time(19, 45), time(20, 45)), # 19:45-20:45
    ]
    
    courses_created = 0
    courses_existing = 0
    start_date = datetime.now().date()
    
    # Mapping des types de cours vers les salles appropriées
    course_room_mapping = {
        'Yoga': ['Studio Yoga', 'Salle Polyvalente'],
        'Pilates': ['Studio Pilates', 'Studio Yoga', 'Salle Polyvalente'],
        'HIIT': ['Salle Polyvalente', 'Salle Cardio'],
        'Zumba': ['Salle Polyvalente'],
        'Body Combat': ['Salle Boxing', 'Salle Polyvalente'],
        'Body Pump': ['Salle Musculation', 'Salle Polyvalente'],
        'Spinning': ['Salle Cardio'],
        'Aqua': ['Piscine'],
        'Natation': ['Piscine'],
        'Stretching': ['Studio Yoga', 'Salle Polyvalente'],
        'Functional': ['Salle Polyvalente', 'Salle Musculation'],
        'CrossFit': ['Salle Polyvalente'],
        'Méditation': ['Studio Yoga']
    }
    
    for day_offset in range(days_ahead):
        current_date = start_date + timedelta(days=day_offset)
        
        # Éviter les dimanches (moins de cours)
        is_weekend = current_date.weekday() >= 5
        num_courses = random.randint(3, 6) if not is_weekend else random.randint(1, 3)
        
        print(f"\n📅 {current_date.strftime('%A %d/%m/%Y')} - {num_courses} cours prévus")
        
        # Sélectionner des créneaux aléatoirement
        selected_slots = random.sample(time_slots, min(num_courses, len(time_slots)))
        
        for start_time, end_time in selected_slots:
            # Sélectionner un type de cours aléatoirement
            course_type = random.choice(course_types)
            
            # Trouver une salle appropriée
            suitable_rooms = []
            for keyword, room_names in course_room_mapping.items():
                if keyword.lower() in course_type.name.lower():
                    suitable_rooms.extend([r for r in rooms if any(rn in r.name for rn in room_names)])
                    break
            
            # Si aucune salle spécifique, utiliser n'importe quelle salle
            if not suitable_rooms:
                suitable_rooms = rooms
            
            room = random.choice(suitable_rooms)
            coach = random.choice(coaches)
            
            # Vérifier si le coach est disponible à ce créneau
            existing_course = Course.objects.filter(
                coach=coach,
                date=current_date,
                start_time=start_time,
                tenant_id=tenant_id
            ).exists()
            
            if existing_course:
                # Essayer un autre coach
                available_coaches = [c for c in coaches if not Course.objects.filter(
                    coach=c, date=current_date, start_time=start_time, tenant_id=tenant_id
                ).exists()]
                
                if available_coaches:
                    coach = random.choice(available_coaches)
                else:
                    print(f"  ⚠️  Aucun coach disponible pour {start_time} - cours ignoré")
                    continue
            
            # Créer le titre du cours
            title = f"{course_type.name} avec {coach.first_name or coach.email.split('@')[0]}"
            
            # Capacité max (80-100% de la capacité de la salle)
            max_participants = random.randint(
                max(1, int(room.capacity * 0.8)),
                room.capacity
            )
            
            course_data = {
                'course_type': course_type,
                'coach': coach,
                'room': room,
                'title': title,
                'description': f"Séance de {course_type.name} dans {room.name}. {course_type.description}",
                'date': current_date,
                'start_time': start_time,
                'end_time': end_time,
                'max_participants': max_participants,
                'status': 'SCHEDULED',
                'tenant_id': tenant_id
            }
            
            # Créer le cours s'il n'existe pas déjà
            course, created = Course.objects.get_or_create(
                coach=coach,
                date=current_date,
                start_time=start_time,
                tenant_id=tenant_id,
                defaults=course_data
            )
            
            if created:
                courses_created += 1
                print(f"  ✅ {start_time}-{end_time}: {course_type.name} ({room.name}) - {coach.first_name or coach.email}")
            else:
                courses_existing += 1
                print(f"  ⚠️  Cours existant: {start_time} - {coach.first_name or coach.email}")
    
    print(f"\n📊 RÉSUMÉ POUR LE CENTRE '{tenant_id}':")
    print("-" * 40)
    print(f"✅ Nouveaux cours: {courses_created}")
    print(f"⚠️  Cours existants: {courses_existing}")
    print(f"📈 Total des cours: {Course.objects.filter(tenant_id=tenant_id).count()}")
    print("✅ Cours créés avec succès!")

def create_for_multiple_centers():
    """Créer des cours pour plusieurs centres"""
    centers = ["demo-center", "fitness-plus", "sport-center", "wellness-gym"]
    
    for center in centers:
        print(f"\n🎯 Centre: {center}")
        create_courses(center, days_ahead=7)  # 1 semaine pour chaque centre

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--multiple":
            create_for_multiple_centers()
        else:
            # Utiliser l'ID du centre passé en paramètre
            center_id = sys.argv[1]
            days = int(sys.argv[2]) if len(sys.argv) > 2 else 14
            create_courses(center_id, days)
    else:
        # Par défaut, créer pour le centre demo
        create_courses("demo-center", 14)