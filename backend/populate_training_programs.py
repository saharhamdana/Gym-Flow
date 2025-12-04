#!/usr/bin/env python
"""
Script pour remplir la table TrainingProgram avec des données de test
Usage: python populate_training_programs.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from training_programs.models import TrainingProgram, Exercise as TPExercise
from authentication.models import User

def create_training_programs():
    """Créer des programmes d'entraînement de test"""
    
    # Récupérer les membres
    members = list(User.objects.filter(role='MEMBER'))
    
    if not members:
        print("❌ Aucun membre trouvé dans la base de données")
        print("💡 Créez d'abord des utilisateurs avec le rôle MEMBER")
        return
    
    print(f"💪 Création des programmes d'entraînement")
    print(f"📊 Membres disponibles: {len(members)}")
    print("=" * 50)
    
    # Programmes types
    program_templates = [
        {
            'name': 'Programme Débutant - Force',
            'description': 'Programme d\'initiation à la musculation pour développer la force de base',
            'exercises': [
                {'name': 'Squats au poids du corps', 'sets': 3, 'reps': '12-15', 'rest_period': '60s'},
                {'name': 'Pompes', 'sets': 3, 'reps': '8-12', 'rest_period': '60s'},
                {'name': 'Planche', 'sets': 3, 'reps': '30s', 'rest_period': '60s'},
                {'name': 'Fentes alternées', 'sets': 3, 'reps': '10 par jambe', 'rest_period': '60s'},
                {'name': 'Rowing avec élastique', 'sets': 3, 'reps': '12-15', 'rest_period': '60s'}
            ]
        },
        {
            'name': 'Programme Cardio Intensif',
            'description': 'Programme HIIT pour améliorer l\'endurance et brûler les graisses',
            'exercises': [
                {'name': 'Burpees', 'sets': 4, 'reps': '10', 'rest_period': '30s'},
                {'name': 'Mountain Climbers', 'sets': 4, 'reps': '20', 'rest_period': '30s'},
                {'name': 'Jumping Jacks', 'sets': 4, 'reps': '30', 'rest_period': '30s'},
                {'name': 'High Knees', 'sets': 4, 'reps': '20', 'rest_period': '30s'},
                {'name': 'Sprint sur place', 'sets': 4, 'reps': '30s', 'rest_period': '60s'}
            ]
        },
        {
            'name': 'Programme Haut du Corps',
            'description': 'Développement de la musculature du haut du corps',
            'exercises': [
                {'name': 'Développé couché', 'sets': 4, 'reps': '8-10', 'rest_period': '90s'},
                {'name': 'Tractions assistées', 'sets': 3, 'reps': '6-8', 'rest_period': '90s'},
                {'name': 'Développé militaire', 'sets': 3, 'reps': '10-12', 'rest_period': '90s'},
                {'name': 'Rowing haltères', 'sets': 3, 'reps': '10-12', 'rest_period': '90s'},
                {'name': 'Dips', 'sets': 3, 'reps': '8-12', 'rest_period': '90s'}
            ]
        },
        {
            'name': 'Programme Bas du Corps',
            'description': 'Renforcement des jambes et des fessiers',
            'exercises': [
                {'name': 'Squats avec barre', 'sets': 4, 'reps': '10-12', 'rest_period': '2min'},
                {'name': 'Soulevé de terre jambes tendues', 'sets': 3, 'reps': '10-12', 'rest_period': '90s'},
                {'name': 'Fentes avec haltères', 'sets': 3, 'reps': '12 par jambe', 'rest_period': '90s'},
                {'name': 'Hip Thrust', 'sets': 3, 'reps': '12-15', 'rest_period': '90s'},
                {'name': 'Mollets debout', 'sets': 4, 'reps': '15-20', 'rest_period': '60s'}
            ]
        },
        {
            'name': 'Programme Flexibilité & Mobilité',
            'description': 'Programme d\'étirements et de mobilité pour la récupération',
            'exercises': [
                {'name': 'Étirement ischio-jambiers', 'sets': 2, 'reps': '30s', 'rest_period': '30s'},
                {'name': 'Étirement quadriceps', 'sets': 2, 'reps': '30s par jambe', 'rest_period': '30s'},
                {'name': 'Étirement dorsaux', 'sets': 2, 'reps': '30s', 'rest_period': '30s'},
                {'name': 'Mobilité des épaules', 'sets': 2, 'reps': '10 rotations', 'rest_period': '30s'},
                {'name': 'Posture du chat-vache', 'sets': 2, 'reps': '10', 'rest_period': '30s'}
            ]
        },
        {
            'name': 'Programme Fonctionnel',
            'description': 'Exercices fonctionnels pour la vie quotidienne',
            'exercises': [
                {'name': 'Kettlebell Swings', 'sets': 3, 'reps': '15', 'rest_period': '90s'},
                {'name': 'Farmer\'s Walk', 'sets': 3, 'reps': '30m', 'rest_period': '90s'},
                {'name': 'Turkish Get-Up', 'sets': 3, 'reps': '5 par côté', 'rest_period': '90s'},
                {'name': 'Box Step-Up', 'sets': 3, 'reps': '12 par jambe', 'rest_period': '90s'},
                {'name': 'Battle Ropes', 'sets': 3, 'reps': '30s', 'rest_period': '90s'}
            ]
        }
    ]
    
    created_count = 0
    existing_count = 0
    
    # Créer des programmes pour des membres aléatoirement sélectionnés
    selected_members = random.sample(members, min(len(members), 20))  # Max 20 programmes
    
    for i, member in enumerate(selected_members):
        # Sélectionner un programme template aléatoirement
        template = random.choice(program_templates)
        
        # Créer des dates de début et fin
        start_date = datetime.now().date() - timedelta(days=random.randint(0, 30))
        end_date = start_date + timedelta(days=random.randint(30, 90))
        
        # Personnaliser le nom du programme
        program_name = f"{template['name']} - {member.first_name or member.email.split('@')[0]}"
        
        # Créer le programme d'entraînement
        program, created = TrainingProgram.objects.get_or_create(
            member=member,
            name=program_name,
            defaults={
                'description': template['description'],
                'start_date': start_date,
                'end_date': end_date
            }
        )
        
        if created:
            created_count += 1
            print(f"✅ Programme créé: {program_name}")
            
            # Ajouter les exercices au programme
            exercise_count = 0
            for ex_data in template['exercises']:
                exercise = TPExercise.objects.create(
                    program=program,
                    name=ex_data['name'],
                    sets=ex_data['sets'],
                    reps=ex_data['reps'],
                    rest_period=ex_data['rest_period']
                )
                exercise_count += 1
            
            print(f"   📋 {exercise_count} exercices ajoutés")
            
        else:
            existing_count += 1
            print(f"⚠️  Programme existant: {program_name}")
    
    print(f"\n📊 RÉSUMÉ:")
    print("-" * 30)
    print(f"✅ Nouveaux programmes: {created_count}")
    print(f"⚠️  Programmes existants: {existing_count}")
    print(f"📈 Total des programmes: {TrainingProgram.objects.count()}")
    print(f"🏋️ Total des exercices: {TPExercise.objects.count()}")
    print("✅ Programmes d'entraînement créés avec succès!")

if __name__ == "__main__":
    create_training_programs()