#!/usr/bin/env python
"""
Script pour remplir la table Exercise avec des données de test
Usage: python populate_exercises.py
"""

import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from coaching.models import ExerciseCategory, Exercise
from authentication.models import User

def create_exercises():
    """Créer des exercices de base"""
    
    # Récupérer les catégories existantes
    categories = {}
    for cat in ExerciseCategory.objects.all():
        categories[cat.name] = cat
    
    # Récupérer un utilisateur coach ou admin pour created_by
    coach_user = User.objects.filter(role__in=['COACH', 'ADMIN']).first()
    
    exercises_data = [
        # MUSCULATION
        {
            'name': 'Développé couché',
            'description': 'Allongé sur un banc, poussez la barre depuis la poitrine vers le haut avec les bras tendus.',
            'category': 'Musculation',
            'difficulty': 'intermediate',
            'equipment_needed': 'Barre, poids, banc'
        },
        {
            'name': 'Squat',
            'description': 'Debout, descendez en fléchissant les genoux comme pour s\'asseoir, puis remontez.',
            'category': 'Musculation',
            'difficulty': 'beginner',
            'equipment_needed': 'Poids (optionnel)'
        },
        {
            'name': 'Soulevé de terre',
            'description': 'Soulevez une barre du sol jusqu\'aux hanches en gardant le dos droit.',
            'category': 'Musculation',
            'difficulty': 'advanced',
            'equipment_needed': 'Barre, poids'
        },
        {
            'name': 'Tractions',
            'description': 'Suspendez-vous à une barre et tirez votre corps vers le haut.',
            'category': 'Musculation',
            'difficulty': 'intermediate',
            'equipment_needed': 'Barre de traction'
        },
        {
            'name': 'Pompes',
            'description': 'En position de planche, descendez et remontez en poussant avec les bras.',
            'category': 'Musculation',
            'difficulty': 'beginner',
            'equipment_needed': 'Aucun'
        },
        
        # CARDIO
        {
            'name': 'Course à pied',
            'description': 'Course continue à rythme modéré pour améliorer l\'endurance cardiovasculaire.',
            'category': 'Cardio',
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis de course (optionnel)'
        },
        {
            'name': 'Burpees',
            'description': 'Enchaînement squat, planche, pompe, saut vertical.',
            'category': 'Cardio',
            'difficulty': 'intermediate',
            'equipment_needed': 'Aucun'
        },
        {
            'name': 'Mountain climbers',
            'description': 'En position de planche, alternez rapidement les genoux vers la poitrine.',
            'category': 'Cardio',
            'difficulty': 'intermediate',
            'equipment_needed': 'Aucun'
        },
        {
            'name': 'Jumping jacks',
            'description': 'Sautillez en écartant et rapprochant les jambes tout en levant les bras.',
            'category': 'Cardio',
            'difficulty': 'beginner',
            'equipment_needed': 'Aucun'
        },
        
        # ÉTIREMENT
        {
            'name': 'Étirement des ischio-jambiers',
            'description': 'Assis, jambes tendues, penchez-vous vers l\'avant pour étirer l\'arrière des cuisses.',
            'category': 'Étirement',
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis'
        },
        {
            'name': 'Étirement des quadriceps',
            'description': 'Debout, pliez une jambe derrière vous et tirez le pied vers les fesses.',
            'category': 'Étirement',
            'difficulty': 'beginner',
            'equipment_needed': 'Aucun'
        },
        
        # YOGA
        {
            'name': 'Chien tête en bas',
            'description': 'Position en V inversé, mains et pieds au sol, fesses vers le haut.',
            'category': 'Yoga',
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis de yoga'
        },
        {
            'name': 'Warrior I',
            'description': 'Position de guerrier avec une jambe en avant, bras levés vers le ciel.',
            'category': 'Yoga',
            'difficulty': 'intermediate',
            'equipment_needed': 'Tapis de yoga'
        },
        
        # CORE
        {
            'name': 'Planche',
            'description': 'Maintenez votre corps droit en appui sur les avant-bras et les orteils.',
            'category': 'Core',
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis'
        },
        {
            'name': 'Crunches',
            'description': 'Allongé sur le dos, relevez le buste vers les genoux.',
            'category': 'Core',
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis'
        },
        
        # FONCTIONNEL
        {
            'name': 'Kettlebell swing',
            'description': 'Balancez un kettlebell entre les jambes et jusqu\'à hauteur des épaules.',
            'category': 'Fonctionnel',
            'difficulty': 'intermediate',
            'equipment_needed': 'Kettlebell'
        },
        {
            'name': 'Fentes',
            'description': 'Pas en avant avec une jambe, descendez en fléchissant les deux genoux.',
            'category': 'Fonctionnel',
            'difficulty': 'beginner',
            'equipment_needed': 'Aucun'
        }
    ]
    
    print("Creation des exercices...")
    print("=" * 50)
    
    created_count = 0
    existing_count = 0
    
    for exercise_data in exercises_data:
        category_name = exercise_data.pop('category')
        category = categories.get(category_name)
        
        if not category:
            print(f"[ATTENTION] Categorie '{category_name}' non trouvee, exercice ignore: {exercise_data['name']}")
            continue
        
        exercise, created = Exercise.objects.get_or_create(
            name=exercise_data['name'],
            defaults={
                **exercise_data,
                'category': category,
                'created_by': coach_user
            }
        )
        
        if created:
            created_count += 1
            print(f"[CREE] {exercise.name}")
        else:
            existing_count += 1
            print(f"[EXISTE] {exercise.name}")
    
    print(f"\nResume:")
    print(f"   [NOUVEAUX] Nouveaux exercices: {created_count}")
    print(f"   [EXISTANTS] Exercices existants: {existing_count}")
    print(f"   [TOTAL] Total des exercices: {Exercise.objects.count()}")
    print("Exercices crees avec succes!")

if __name__ == "__main__":
    create_exercises()