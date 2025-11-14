from members.models import Member
from coaching.models import TrainingProgram, Exercise, ExerciseCategory
from django.contrib.auth import get_user_model

User = get_user_model()

print("\n" + "="*60)
print(" VÉRIFICATION DES DONNÉES")
print("="*60 + "\n")

# Vérifier les utilisateurs coaches
print(" COACHES:")
coaches = User.objects.filter(role='COACH')
print(f"   Total: {coaches.count()}")
for coach in coaches:
    print(f"   - {coach.email} (ID: {coach.id})")

print("\n MEMBRES:")
members = Member.objects.all()
print(f"   Total: {members.count()}")
print(f"   Actifs: {Member.objects.filter(status='ACTIVE').count()}")
for member in members[:5]:  # Afficher les 5 premiers
    print(f"   - {member.full_name} ({member.email}) - Status: {member.status}")

print("\n PROGRAMMES D'ENTRAÎNEMENT:")
programs = TrainingProgram.objects.all()
print(f"   Total: {programs.count()}")
print(f"   Actifs: {programs.filter(status='active').count()}")
for program in programs[:5]:
    coach_name = program.coach.email if program.coach else "Aucun coach"
    member_name = program.member.full_name if program.member else "Aucun membre"
    print(f"   - {program.title}")
    print(f"     Coach: {coach_name}")
    print(f"     Membre: {member_name}")
    print(f"     Status: {program.status}")
    print(f"     Sessions: {program.workout_sessions.count()}")
    print()

print(" EXERCICES:")
exercises = Exercise.objects.all()
print(f"   Total: {exercises.count()}")
for category in ExerciseCategory.objects.all():
    count = exercises.filter(category=category).count()
    print(f"   - {category.name}: {count} exercices")

print("\n" + "="*60)
print(" VÉRIFICATION TERMINÉE")
print("="*60 + "\n")

# Suggestions
print(" SUGGESTIONS:")
if coaches.count() == 0:
    print("     Aucun coach trouvé. Créez un utilisateur avec role='COACH'")
if members.filter(status='ACTIVE').count() == 0:
    print("     Aucun membre actif. Créez un membre avec status='ACTIVE'")
if programs.count() == 0:
    print("    Aucun programme. Créez au moins un programme de test")
if exercises.count() == 0:
    print("    Aucun exercice. Importez les exercices de base")

print("\n✨ Pour créer des données de test, utilisez:")
print("   python manage.py shell")
print("   >>> from coaching.factories import create_test_data")
print("   >>> create_test_data()")