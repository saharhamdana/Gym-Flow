import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from coaching.models import ExerciseCategory, Exercise
from authentication.models import User

def create_exercise_categories():
    """Créer les catégories d'exercices"""
    categories_data = [
        {
            'name': 'Bodybuilding',
            'description': 'Exercices de musculation pour le développement musculaire'
        },
        {
            'name': 'Cardio',
            'description': 'Exercices cardiovasculaires pour l\'endurance'
        },
        {
            'name': 'CrossFit',
            'description': 'Exercices fonctionnels haute intensité'
        },
        {
            'name': 'Stretching',
            'description': 'Exercices d\'étirement et de flexibilité'
        }
    ]
    
    categories = {}
    for cat_data in categories_data:
        category, created = ExerciseCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        categories[cat_data['name']] = category
        print(f"{'✅ Créé' if created else '⚠️  Existe déjà'}: {category.name}")
    
    return categories


def create_exercises():
    """Créer les exercices"""
    categories = create_exercise_categories()
    
    # Récupérer le premier coach ou admin pour created_by
    coach = User.objects.filter(role='COACH').first()
    if not coach:
        coach = User.objects.filter(role='ADMIN').first()
    
    if not coach:
        print("❌ Aucun coach ou admin trouvé. Créez un utilisateur d'abord.")
        return
    
    exercises_data = [
        # ==================== BODYBUILDING ====================
        {
            'name': 'Développé Couché',
            'description': 'Exercice de base pour les pectoraux. Allongé sur un banc, descendez la barre jusqu\'à la poitrine puis poussez vers le haut.',
            'category': categories['Bodybuilding'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Barre, Banc de musculation, Poids',
        },
        {
            'name': 'Squat',
            'description': 'Exercice fondamental pour les jambes et fessiers. Descendez en gardant le dos droit, genoux alignés avec les pieds.',
            'category': categories['Bodybuilding'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Barre, Rack à squat, Poids',
        },
        {
            'name': 'Soulevé de Terre',
            'description': 'Exercice complet du corps. Soulevez la barre du sol en gardant le dos droit et en poussant avec les jambes.',
            'category': categories['Bodybuilding'],
            'difficulty': 'advanced',
            'equipment_needed': 'Barre, Poids',
        },
        {
            'name': 'Curl Biceps',
            'description': 'Exercice d\'isolation pour les biceps. Fléchissez les coudes en gardant les bras le long du corps.',
            'category': categories['Bodybuilding'],
            'difficulty': 'beginner',
            'equipment_needed': 'Haltères ou Barre',
        },
        {
            'name': 'Développé Militaire',
            'description': 'Exercice pour les épaules. Poussez la barre du haut de la poitrine vers le haut.',
            'category': categories['Bodybuilding'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Barre, Poids',
        },
        {
            'name': 'Tractions',
            'description': 'Exercice au poids du corps pour le dos. Tirez-vous vers le haut jusqu\'à ce que le menton dépasse la barre.',
            'category': categories['Bodybuilding'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Barre de traction',
        },
        {
            'name': 'Dips',
            'description': 'Exercice pour les triceps et pectoraux. Descendez entre les barres parallèles puis poussez vers le haut.',
            'category': categories['Bodybuilding'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Barres parallèles',
        },
        {
            'name': 'Leg Press',
            'description': 'Exercice guidé pour les jambes. Poussez la plateforme avec les pieds.',
            'category': categories['Bodybuilding'],
            'difficulty': 'beginner',
            'equipment_needed': 'Machine Leg Press',
        },
        {
            'name': 'Rowing Barre',
            'description': 'Exercice pour le dos. Penché en avant, tirez la barre vers le bas du torse.',
            'category': categories['Bodybuilding'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Barre, Poids',
        },
        {
            'name': 'Extension Triceps',
            'description': 'Exercice d\'isolation pour les triceps. Étendez les bras au-dessus de la tête.',
            'category': categories['Bodybuilding'],
            'difficulty': 'beginner',
            'equipment_needed': 'Haltère ou Poulie',
        },
        
        # ==================== CARDIO ====================
        {
            'name': 'Course à Pied',
            'description': 'Exercice cardiovasculaire de base. Maintenez un rythme constant adapté à votre niveau.',
            'category': categories['Cardio'],
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis de course ou extérieur',
        },
        {
            'name': 'Vélo',
            'description': 'Exercice cardio à faible impact. Pédalez à intensité modérée à élevée.',
            'category': categories['Cardio'],
            'difficulty': 'beginner',
            'equipment_needed': 'Vélo stationnaire ou extérieur',
        },
        {
            'name': 'Rameur',
            'description': 'Exercice cardio complet du corps. Tirez la poignée vers vous en poussant avec les jambes.',
            'category': categories['Cardio'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Rameur',
        },
        {
            'name': 'Burpees',
            'description': 'Exercice cardio intense. Descendez en planche, pompe, saut.',
            'category': categories['Cardio'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Aucun',
        },
        {
            'name': 'Jumping Jacks',
            'description': 'Exercice cardio simple. Sautez en écartant bras et jambes simultanément.',
            'category': categories['Cardio'],
            'difficulty': 'beginner',
            'equipment_needed': 'Aucun',
        },
        {
            'name': 'Mountain Climbers',
            'description': 'Exercice cardio en position de planche. Alternez rapidement les genoux vers la poitrine.',
            'category': categories['Cardio'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Aucun',
        },
        {
            'name': 'Corde à Sauter',
            'description': 'Exercice cardio classique. Sautez à la corde en maintenant un rythme régulier.',
            'category': categories['Cardio'],
            'difficulty': 'beginner',
            'equipment_needed': 'Corde à sauter',
        },
        {
            'name': 'Elliptique',
            'description': 'Exercice cardio à faible impact. Mouvement fluide combinant jambes et bras.',
            'category': categories['Cardio'],
            'difficulty': 'beginner',
            'equipment_needed': 'Vélo elliptique',
        },
        
        # ==================== CROSSFIT ====================
        {
            'name': 'Wall Balls',
            'description': 'Lancez un medecine ball contre un mur en faisant un squat.',
            'category': categories['CrossFit'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Medicine Ball, Mur cible',
        },
        {
            'name': 'Box Jumps',
            'description': 'Sautez sur une box en atterrissant avec les deux pieds.',
            'category': categories['CrossFit'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Box de saut',
        },
        {
            'name': 'Kettlebell Swing',
            'description': 'Balancez le kettlebell entre les jambes puis poussez avec les hanches.',
            'category': categories['CrossFit'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Kettlebell',
        },
        {
            'name': 'Thrusters',
            'description': 'Combinaison de front squat et push press en un mouvement fluide.',
            'category': categories['CrossFit'],
            'difficulty': 'advanced',
            'equipment_needed': 'Barre, Poids',
        },
        {
            'name': 'Double Unders',
            'description': 'Corde à sauter avec passage double de la corde par saut.',
            'category': categories['CrossFit'],
            'difficulty': 'advanced',
            'equipment_needed': 'Corde à sauter',
        },
        {
            'name': 'Clean and Jerk',
            'description': 'Mouvement olympique en deux temps : épaulé puis jeté.',
            'category': categories['CrossFit'],
            'difficulty': 'advanced',
            'equipment_needed': 'Barre, Poids, Bumper plates',
        },
        {
            'name': 'Snatch',
            'description': 'Mouvement olympique : soulevé en un temps du sol au-dessus de la tête.',
            'category': categories['CrossFit'],
            'difficulty': 'advanced',
            'equipment_needed': 'Barre, Poids, Bumper plates',
        },
        {
            'name': 'Handstand Push-Ups',
            'description': 'Pompes en position d\'équilibre sur les mains contre un mur.',
            'category': categories['CrossFit'],
            'difficulty': 'advanced',
            'equipment_needed': 'Mur',
        },
        {
            'name': 'Pistol Squats',
            'description': 'Squat sur une jambe, l\'autre tendue devant.',
            'category': categories['CrossFit'],
            'difficulty': 'advanced',
            'equipment_needed': 'Aucun',
        },
        {
            'name': 'Toes to Bar',
            'description': 'Suspendu à une barre, montez les orteils jusqu\'à toucher la barre.',
            'category': categories['CrossFit'],
            'difficulty': 'advanced',
            'equipment_needed': 'Barre de traction',
        },
        
        # ==================== STRETCHING ====================
        {
            'name': 'Étirement Ischio-Jambiers',
            'description': 'Allongé sur le dos, levez une jambe tendue et tirez doucement vers vous.',
            'category': categories['Stretching'],
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis de sol',
        },
        {
            'name': 'Étirement Quadriceps',
            'description': 'Debout, pliez une jambe derrière vous et tenez votre cheville.',
            'category': categories['Stretching'],
            'difficulty': 'beginner',
            'equipment_needed': 'Aucun',
        },
        {
            'name': 'Étirement du Dos (Chat-Vache)',
            'description': 'À quatre pattes, alternez dos rond et dos creux.',
            'category': categories['Stretching'],
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis de sol',
        },
        {
            'name': 'Étirement des Épaules',
            'description': 'Tirez un bras devant vous avec l\'autre bras.',
            'category': categories['Stretching'],
            'difficulty': 'beginner',
            'equipment_needed': 'Aucun',
        },
        {
            'name': 'Pigeon Pose',
            'description': 'Position de yoga pour les hanches. Une jambe pliée devant, l\'autre tendue derrière.',
            'category': categories['Stretching'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Tapis de yoga',
        },
        {
            'name': 'Cobra Stretch',
            'description': 'Allongé ventre au sol, poussez sur les bras pour cambrer le dos.',
            'category': categories['Stretching'],
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis de sol',
        },
        {
            'name': 'Butterfly Stretch',
            'description': 'Assis, plantes de pieds jointes, poussez doucement les genoux vers le sol.',
            'category': categories['Stretching'],
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis de sol',
        },
        {
            'name': 'Splits',
            'description': 'Grand écart avant ou latéral. Progression lente et contrôlée.',
            'category': categories['Stretching'],
            'difficulty': 'advanced',
            'equipment_needed': 'Tapis de sol',
        },
        {
            'name': 'Pont (Bridge)',
            'description': 'Allongé sur le dos, soulevez les hanches en formant un pont.',
            'category': categories['Stretching'],
            'difficulty': 'intermediate',
            'equipment_needed': 'Tapis de sol',
        },
        {
            'name': 'Étirement du Psoas',
            'description': 'En fente basse, poussez les hanches vers l\'avant.',
            'category': categories['Stretching'],
            'difficulty': 'beginner',
            'equipment_needed': 'Tapis de sol',
        },
    ]
    
    print("\n🏋️ Création des exercices...")
    created_count = 0
    
    for exercise_data in exercises_data:
        exercise, created = Exercise.objects.get_or_create(
            name=exercise_data['name'],
            defaults={
                'description': exercise_data['description'],
                'category': exercise_data['category'],
                'difficulty': exercise_data['difficulty'],
                'equipment_needed': exercise_data['equipment_needed'],
                'created_by': coach
            }
        )
        
        if created:
            created_count += 1
            print(f"  ✅ {exercise.name} ({exercise.get_difficulty_display()})")
        else:
            print(f"  ⚠️  {exercise.name} existe déjà")
    
    print(f"\n✨ Total: {created_count} nouveaux exercices créés sur {len(exercises_data)}")
    
    # Afficher les statistiques
    print("\n📊 STATISTIQUES PAR CATÉGORIE:")
    for cat_name, category in categories.items():
        count = Exercise.objects.filter(category=category).count()
        print(f"  {cat_name}: {count} exercices")
    
    print("\n📊 STATISTIQUES PAR DIFFICULTÉ:")
    for difficulty, label in Exercise.DIFFICULTY_CHOICES:
        count = Exercise.objects.filter(difficulty=difficulty).count()
        print(f"  {label}: {count} exercices")


if __name__ == '__main__':
    print("🎯 CRÉATION DES EXERCICES DE LA BIBLIOTHÈQUE")
    print("=" * 50)
    create_exercises()
    print("=" * 50)
    print("✅ Terminé!")