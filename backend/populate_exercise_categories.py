#!/usr/bin/env python
"""
Script pour remplir la table ExerciseCategory avec des données de test
Usage: python populate_exercise_categories.py
"""

import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from coaching.models import ExerciseCategory

def create_exercise_categories():
    """Créer les catégories d'exercices"""
    
    categories_data = [
        {
            'name': 'Musculation',
            'description': 'Exercices de renforcement musculaire avec poids et résistance'
        },
        {
            'name': 'Cardio',
            'description': 'Exercices cardiovasculaires pour améliorer l\'endurance'
        },
        {
            'name': 'Étirement',
            'description': 'Exercices d\'assouplissement et de flexibilité'
        },
        {
            'name': 'Yoga',
            'description': 'Postures et exercices de yoga pour le corps et l\'esprit'
        },
        {
            'name': 'Pilates',
            'description': 'Exercices de Pilates pour le renforcement du core'
        },
        {
            'name': 'Fonctionnel',
            'description': 'Exercices fonctionnels pour les mouvements du quotidien'
        },
        {
            'name': 'Pliométrie',
            'description': 'Exercices explosifs pour développer la puissance'
        },
        {
            'name': 'Mobilité',
            'description': 'Exercices pour améliorer la mobilité articulaire'
        },
        {
            'name': 'Core',
            'description': 'Exercices spécifiques pour renforcer les abdominaux et le tronc'
        },
        {
            'name': 'Réhabilitation',
            'description': 'Exercices thérapeutiques et de rééducation'
        }
    ]
    
    print("Creation des categories d'exercices...")
    print("=" * 50)
    
    for category_data in categories_data:
        category, created = ExerciseCategory.objects.get_or_create(
            name=category_data['name'],
            defaults={
                'description': category_data['description']
            }
        )
        
        if created:
            print(f"[CREE] {category.name}")
        else:
            print(f"[EXISTE] {category.name}")
    
    print(f"\nTotal des categories: {ExerciseCategory.objects.count()}")
    print("Categories d'exercices creees avec succes!")

if __name__ == "__main__":
    create_exercise_categories()