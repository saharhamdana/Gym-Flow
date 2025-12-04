# 🗃️ Scripts de Population de Base de Données - Gym Flow

Ce dossier contient des scripts Python pour remplir automatiquement votre base de données Gym Flow avec des données de test réalistes.

## 📋 Scripts Disponibles

### 🎯 Script Principal
- **`populate_all_data.py`** - Exécute tous les scripts dans l'ordre correct

### 📚 Scripts Individuels
- **`populate_exercise_categories.py`** - Catégories d'exercices (Musculation, Cardio, Yoga, etc.)
- **`populate_exercises.py`** - Bibliothèque d'exercices avec descriptions détaillées
- **`populate_rooms_course_types.py`** - Salles et types de cours pour un centre
- **`populate_courses.py`** - Cours planifiés avec coachs et créneaux
- **`populate_training_programs.py`** - Programmes d'entraînement personnalisés

## 🚀 Utilisation Rapide

### Méthode Recommandée (Tout en Une)
```bash
# Centre par défaut (demo-center)
python populate_all_data.py

# Centre spécifique
python populate_all_data.py mon-centre-id

# Plusieurs centres de test
python populate_all_data.py --multiple
```

### Méthode Individuelle
```bash
# 1. Catégories d'exercices (global)
python populate_exercise_categories.py

# 2. Exercices (global)
python populate_exercises.py

# 3. Salles et types de cours (par centre)
python populate_rooms_course_types.py demo-center

# 4. Cours planifiés (par centre)
python populate_courses.py demo-center

# 5. Programmes d'entraînement (global)
python populate_training_programs.py
```

## 📊 Données Créées

### 🏋️ Catégories d'Exercices (10 catégories)
- Musculation
- Cardio  
- Étirement
- Yoga
- Pilates
- Fonctionnel
- Pliométrie
- Mobilité
- Core
- Réhabilitation

### 💪 Exercices (18+ exercices)
- Exercices de musculation (Squat, Développé couché, Tractions, etc.)
- Exercices cardio (Burpees, Mountain climbers, Jumping jacks, etc.)
- Exercices d'étirement et yoga
- Exercices fonctionnels et core

### 🏠 Salles (8 salles par centre)
- Salle Cardio (20 places)
- Salle Musculation (15 places)
- Studio Yoga (25 places)
- Salle Polyvalente (30 places)
- Piscine (12 places)
- Studio Pilates (12 places)
- Salle Boxing (10 places)
- Terrain Squash (4 places)

### 📚 Types de Cours (15 types par centre)
- Yoga Vinyasa/Hatha
- Pilates Mat/Reformer
- HIIT, Zumba, Body Combat
- Body Pump, Spinning
- Aquagym, Natation Libre
- Stretching, Functional Training
- CrossFit, Méditation

### 📅 Cours Planifiés
- 3-6 cours par jour en semaine
- 1-3 cours le weekend
- Créneaux de 7h à 20h45
- Attribution automatique salle/coach/type

### 📋 Programmes d'Entraînement (6 types)
- Programme Débutant - Force
- Programme Cardio Intensif  
- Programme Haut du Corps
- Programme Bas du Corps
- Programme Flexibilité & Mobilité
- Programme Fonctionnel

## ⚙️ Paramètres Avancés

### Courses avec Durée Personnalisée
```bash
# 7 jours de cours au lieu de 14 par défaut
python populate_courses.py demo-center 7
```

### Centres Multiples Personnalisés
Modifiez la liste dans `populate_all_data.py` :
```python
centers = [
    "votre-centre-1",
    "votre-centre-2", 
    "votre-centre-3"
]
```

## ✅ Prérequis

### Base de Données
- Base de données PostgreSQL configurée
- Migrations Django appliquées
- Tables existantes : `User`, `Room`, `CourseType`, `Course`, etc.

### Utilisateurs Requis
```bash
# Créer des utilisateurs de test avant d'exécuter les scripts
python create_test_users.py  # Si disponible
# OU créer manuellement des utilisateurs avec les rôles :
# - COACH (pour assigner aux cours)
# - MEMBER (pour les programmes d'entraînement)
```

### Vérification
```bash
# Vérifier que Django fonctionne
python manage.py shell -c "from authentication.models import User; print(f'Users: {User.objects.count()}')"
```

## 🛠️ Résolution de Problèmes

### Erreur "Aucun coach trouvé"
```bash
# Créer des utilisateurs coaches
python manage.py shell
>>> from authentication.models import User
>>> User.objects.create_user(email='coach@test.com', role='COACH', first_name='Coach', last_name='Test')
```

### Erreur "Aucune salle trouvée"
```bash
# Exécuter d'abord le script des salles
python populate_rooms_course_types.py demo-center
```

### Erreur de tenant_id
- Vérifiez que votre modèle `Room`, `CourseType`, `Course` a bien le champ `tenant_id`
- Utilisez un `tenant_id` cohérent dans tous les scripts

## 📈 Monitoring

### Vérifier les Données Créées
```bash
python manage.py shell
>>> from bookings.models import *
>>> from coaching.models import *
>>> print(f"Salles: {Room.objects.count()}")
>>> print(f"Types de cours: {CourseType.objects.count()}")  
>>> print(f"Cours: {Course.objects.count()}")
>>> print(f"Exercices: {Exercise.objects.count()}")
```

### Nettoyer les Données (si nécessaire)
```bash
python manage.py shell
>>> from bookings.models import *
>>> Course.objects.filter(tenant_id='demo-center').delete()
>>> Room.objects.filter(tenant_id='demo-center').delete()
# etc.
```

## 🎨 Personnalisation

### Ajouter de Nouveaux Exercices
Modifiez `exercises_data` dans `populate_exercises.py`

### Modifier les Créneaux Horaires
Ajustez `time_slots` dans `populate_courses.py`

### Personnaliser les Salles
Éditez `rooms_data` dans `populate_rooms_course_types.py`

---

🎉 **Bon entraînement avec vos nouvelles données !**