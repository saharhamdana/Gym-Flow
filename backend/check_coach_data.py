from django.contrib.auth import get_user_model
from coaching.models import TrainingProgram
from members.models import Member
from datetime import date

User = get_user_model()

print("\n" + "="*60)
print("DIAGNOSTIC - COACH MEMBERS")
print("="*60 + "\n")

# 1. Vérifier les coachs
print("1. LISTE DES COACHS:")
print("-" * 40)
coaches = User.objects.filter(role='COACH')
print(f"Nombre de coachs trouvés: {coaches.count()}")
for coach in coaches:
    print(f"  - {coach.email} | Role: {coach.role} | Active: {coach.is_active}")

# 2. Vérifier les membres
print("\n2. LISTE DES MEMBRES:")
print("-" * 40)
members = Member.objects.all()
print(f"Nombre total de membres: {members.count()}")
active_members = Member.objects.filter(status='ACTIVE')
print(f"Membres actifs: {active_members.count()}")
for member in active_members[:5]:  # Afficher les 5 premiers
    print(f"  - {member.full_name} | Email: {member.email} | Status: {member.status}")

# 3. Vérifier les programmes
print("\n3. PROGRAMMES D'ENTRAÎNEMENT:")
print("-" * 40)
all_programs = TrainingProgram.objects.all()
print(f"Nombre total de programmes: {all_programs.count()}")

active_programs = TrainingProgram.objects.filter(status='active')
print(f"Programmes actifs: {active_programs.count()}")

# Pour chaque coach, afficher ses programmes
for coach in coaches:
    coach_programs = TrainingProgram.objects.filter(coach=coach)
    coach_active_programs = coach_programs.filter(status='active')
    print(f"\n  Coach: {coach.email}")
    print(f"    - Total programmes: {coach_programs.count()}")
    print(f"    - Programmes actifs: {coach_active_programs.count()}")
    
    if coach_active_programs.exists():
        print(f"    - Détails des programmes actifs:")
        for prog in coach_active_programs:
            member = prog.member
            member_name = member.full_name if member else "PAS DE MEMBRE"
            print(f"      * {prog.title}")
            print(f"        Membre: {member_name}")
            print(f"        Dates: {prog.start_date} -> {prog.end_date}")
            print(f"        Status: {prog.status}")

# 4. Vérifier s'il y a des problèmes
print("\n4. VÉRIFICATION DES PROBLÈMES:")
print("-" * 40)

programs_without_members = TrainingProgram.objects.filter(member__isnull=True)
if programs_without_members.exists():
    print(f"⚠️  {programs_without_members.count()} programme(s) sans membre assigné!")
    for prog in programs_without_members:
        print(f"  - Programme #{prog.id}: {prog.title}")

programs_without_coach = TrainingProgram.objects.filter(coach__isnull=True)
if programs_without_coach.exists():
    print(f"⚠️  {programs_without_coach.count()} programme(s) sans coach assigné!")

# Programmes avec dates invalides
today = date.today()
invalid_dates = TrainingProgram.objects.filter(end_date__lt=start_date)
if invalid_dates.exists():
    print(f"⚠️  {invalid_dates.count()} programme(s) avec dates invalides (fin < début)")

# 5. Recommandations
print("\n5. RECOMMANDATIONS:")
print("-" * 40)

if coaches.count() == 0:
    print("❌ Aucun coach trouvé! Créez un utilisateur avec role='COACH'")
elif not any(TrainingProgram.objects.filter(coach=c, status='active').exists() for c in coaches):
    print("❌ Aucun programme actif trouvé pour les coachs!")
    print("   Créez un programme avec status='active'")
else:
    print("✅ Configuration OK! Des programmes actifs existent.")
    
print("\n" + "="*60)
print("FIN DU DIAGNOSTIC")
print("="*60 + "\n")