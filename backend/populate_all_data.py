#!/usr/bin/env python
"""
Script principal pour remplir toutes les tables de la base de données
Usage: python populate_all_data.py [tenant_id]
"""

import os
import sys
import django
import subprocess

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def run_script(script_name, args=[]):
    """Exécuter un script Python et afficher le résultat"""
    cmd = [sys.executable, script_name] + args
    
    try:
        print(f"\n🚀 Exécution: {' '.join(cmd)}")
        print("=" * 60)
        
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print(result.stdout)
            if result.stderr:
                print("⚠️  Warnings:", result.stderr)
            return True
        else:
            print("❌ ERREUR lors de l'exécution:")
            print(result.stderr)
            print("Sortie:", result.stdout)
            return False
            
    except Exception as e:
        print(f"❌ Exception lors de l'exécution de {script_name}: {e}")
        return False

def populate_all_data(tenant_id="demo-center"):
    """Remplir toutes les tables avec des données de test"""
    
    print("🎯 POPULATION COMPLÈTE DE LA BASE DE DONNÉES")
    print("=" * 60)
    print(f"🏢 Centre cible: {tenant_id}")
    print(f"📅 Date: {django.utils.timezone.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    scripts_to_run = [
        {
            'script': 'populate_exercise_categories.py',
            'args': [],
            'description': 'Catégories d\'exercices'
        },
        {
            'script': 'populate_exercises.py',
            'args': [],
            'description': 'Exercices de la bibliothèque'
        },
        {
            'script': 'populate_rooms_course_types.py',
            'args': [tenant_id],
            'description': 'Salles et types de cours'
        },
        {
            'script': 'populate_courses.py',
            'args': [tenant_id],
            'description': 'Cours planifiés'
        },
        {
            'script': 'populate_training_programs.py',
            'args': [],
            'description': 'Programmes d\'entraînement'
        }
    ]
    
    success_count = 0
    total_scripts = len(scripts_to_run)
    
    for i, script_info in enumerate(scripts_to_run, 1):
        print(f"\n📋 ÉTAPE {i}/{total_scripts}: {script_info['description']}")
        print("-" * 40)
        
        if run_script(script_info['script'], script_info['args']):
            success_count += 1
            print(f"✅ Étape {i} terminée avec succès!")
        else:
            print(f"❌ Étape {i} échouée!")
            
        print("-" * 40)
    
    # Résumé final
    print(f"\n🎉 RÉSUMÉ FINAL")
    print("=" * 60)
    print(f"✅ Scripts réussis: {success_count}/{total_scripts}")
    print(f"❌ Scripts échoués: {total_scripts - success_count}/{total_scripts}")
    
    if success_count == total_scripts:
        print("🎊 TOUTES LES DONNÉES ONT ÉTÉ CRÉÉES AVEC SUCCÈS!")
        
        # Afficher un résumé des données créées
        print(f"\n📊 STATISTIQUES FINALES POUR '{tenant_id}':")
        print("-" * 40)
        
        try:
            from coaching.models import ExerciseCategory, Exercise
            from bookings.models import Room, CourseType, Course
            from training_programs.models import TrainingProgram
            
            print(f"🏋️  Catégories d'exercices: {ExerciseCategory.objects.count()}")
            print(f"💪 Exercices: {Exercise.objects.count()}")
            print(f"🏠 Salles ({tenant_id}): {Room.objects.filter(tenant_id=tenant_id).count()}")
            print(f"📚 Types de cours ({tenant_id}): {CourseType.objects.filter(tenant_id=tenant_id).count()}")
            print(f"📅 Cours ({tenant_id}): {Course.objects.filter(tenant_id=tenant_id).count()}")
            print(f"📋 Programmes d'entraînement: {TrainingProgram.objects.count()}")
            
        except Exception as e:
            print(f"⚠️  Impossible d'afficher les statistiques: {e}")
    else:
        print("⚠️  Certains scripts ont échoué. Vérifiez les logs ci-dessus.")
    
    print("=" * 60)

def create_multiple_centers():
    """Créer des données pour plusieurs centres"""
    centers = [
        "demo-center",
        "fitness-plus", 
        "sport-center",
        "wellness-gym"
    ]
    
    print("🏢 CRÉATION POUR PLUSIEURS CENTRES")
    print("=" * 60)
    
    for center in centers:
        print(f"\n🎯 CENTRE: {center}")
        populate_all_data(center)

if __name__ == "__main__":
    import django.utils.timezone
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--multiple":
            create_multiple_centers()
        elif sys.argv[1] == "--help":
            print("Usage:")
            print("  python populate_all_data.py                # Centre par défaut (demo-center)")
            print("  python populate_all_data.py [tenant_id]    # Centre spécifique")
            print("  python populate_all_data.py --multiple     # Plusieurs centres")
            print("  python populate_all_data.py --help         # Cette aide")
        else:
            # Utiliser l'ID du centre passé en paramètre
            center_id = sys.argv[1]
            populate_all_data(center_id)
    else:
        # Par défaut, créer pour le centre demo
        populate_all_data("demo-center")