# Fichier: backend/migrate_tenant_data.py
"""
Script pour migrer les données existantes vers le système multi-tenant.
Ce script assigne le tenant_id à toutes les données existantes.

Usage:
    python manage.py shell < migrate_tenant_data.py
    
Ou dans le shell Django:
    python manage.py shell
    >>> exec(open('migrate_tenant_data.py').read())
"""

from authentication.models import GymCenter, User
from members.models import Member
from subscriptions.models import SubscriptionPlan, Subscription
from bookings.models import Room, CourseType, Course, Booking

def migrate_tenant_data():
    """
    Migre toutes les données existantes vers le système multi-tenant
    """
    print("\n" + "="*60)
    print("🔄 MIGRATION DES DONNÉES VERS LE SYSTÈME MULTI-TENANT")
    print("="*60 + "\n")
    
    # 1. Vérifier qu'au moins un centre existe
    centers = GymCenter.objects.all()
    
    if not centers.exists():
        print("❌ ERREUR: Aucun centre n'existe!")
        print("   Créez d'abord un centre via l'admin Django ou l'API")
        return False
    
    print(f"✅ {centers.count()} centre(s) trouvé(s):")
    for center in centers:
        print(f"   - {center.name} (tenant_id: {center.tenant_id})")
    
    # 2. Demander quel centre utiliser par défaut
    if centers.count() == 1:
        default_center = centers.first()
        print(f"\n📍 Utilisation du centre par défaut: {default_center.name}")
    else:
        print("\n📍 Plusieurs centres détectés.")
        print("   Les données sans tenant_id seront assignées au premier centre.")
        default_center = centers.first()
        print(f"   Centre sélectionné: {default_center.name}")
    
    default_tenant_id = default_center.tenant_id
    
    # 3. Migrer les utilisateurs
    print("\n" + "-"*60)
    print("👥 Migration des Utilisateurs")
    print("-"*60)
    
    users_without_tenant = User.objects.filter(tenant_id='')
    if users_without_tenant.exists():
        count = users_without_tenant.update(tenant_id=default_tenant_id)
        print(f"✅ {count} utilisateur(s) migré(s)")
    else:
        print("✓ Tous les utilisateurs ont déjà un tenant_id")
    
    # 4. Migrer les membres
    print("\n" + "-"*60)
    print("👤 Migration des Membres")
    print("-"*60)
    
    members_without_tenant = Member.objects.filter(tenant_id__isnull=True) | Member.objects.filter(tenant_id='')
    if members_without_tenant.exists():
        count = members_without_tenant.update(tenant_id=default_tenant_id)
        print(f"✅ {count} membre(s) migré(s)")
    else:
        print("✓ Tous les membres ont déjà un tenant_id")
    
    # 5. Migrer les plans d'abonnement
    print("\n" + "-"*60)
    print("📋 Migration des Plans d'Abonnement")
    print("-"*60)
    
    try:
        plans_without_tenant = SubscriptionPlan.objects.filter(tenant_id='')
        if plans_without_tenant.exists():
            count = plans_without_tenant.update(tenant_id=default_tenant_id)
            print(f"✅ {count} plan(s) migré(s)")
        else:
            print("✓ Tous les plans ont déjà un tenant_id")
    except Exception as e:
        print(f"⚠️  Erreur lors de la migration des plans: {e}")
    
    # 6. Migrer les abonnements
    print("\n" + "-"*60)
    print("💳 Migration des Abonnements")
    print("-"*60)
    
    try:
        subscriptions_without_tenant = Subscription.objects.filter(tenant_id='')
        if subscriptions_without_tenant.exists():
            count = subscriptions_without_tenant.update(tenant_id=default_tenant_id)
            print(f"✅ {count} abonnement(s) migré(s)")
        else:
            print("✓ Tous les abonnements ont déjà un tenant_id")
    except Exception as e:
        print(f"⚠️  Erreur lors de la migration des abonnements: {e}")
    
    # 7. Migrer les salles
    print("\n" + "-"*60)
    print("🏠 Migration des Salles")
    print("-"*60)
    
    try:
        rooms_without_tenant = Room.objects.filter(tenant_id='')
        if rooms_without_tenant.exists():
            count = rooms_without_tenant.update(tenant_id=default_tenant_id)
            print(f"✅ {count} salle(s) migrée(s)")
        else:
            print("✓ Toutes les salles ont déjà un tenant_id")
    except Exception as e:
        print(f"⚠️  Erreur lors de la migration des salles: {e}")
    
    # 8. Migrer les types de cours
    print("\n" + "-"*60)
    print("🎓 Migration des Types de Cours")
    print("-"*60)
    
    try:
        types_without_tenant = CourseType.objects.filter(tenant_id='')
        if types_without_tenant.exists():
            count = types_without_tenant.update(tenant_id=default_tenant_id)
            print(f"✅ {count} type(s) de cours migré(s)")
        else:
            print("✓ Tous les types de cours ont déjà un tenant_id")
    except Exception as e:
        print(f"⚠️  Erreur lors de la migration des types de cours: {e}")
    
    # 9. Migrer les cours
    print("\n" + "-"*60)
    print("📅 Migration des Cours")
    print("-"*60)
    
    try:
        courses_without_tenant = Course.objects.filter(tenant_id='')
        if courses_without_tenant.exists():
            count = courses_without_tenant.update(tenant_id=default_tenant_id)
            print(f"✅ {count} cours migré(s)")
        else:
            print("✓ Tous les cours ont déjà un tenant_id")
    except Exception as e:
        print(f"⚠️  Erreur lors de la migration des cours: {e}")
    
    # 10. Migrer les réservations
    print("\n" + "-"*60)
    print("🎫 Migration des Réservations")
    print("-"*60)
    
    try:
        bookings_without_tenant = Booking.objects.filter(tenant_id='')
        if bookings_without_tenant.exists():
            count = bookings_without_tenant.update(tenant_id=default_tenant_id)
            print(f"✅ {count} réservation(s) migrée(s)")
        else:
            print("✓ Toutes les réservations ont déjà un tenant_id")
    except Exception as e:
        print(f"⚠️  Erreur lors de la migration des réservations: {e}")
    
    # Résumé final
    print("\n" + "="*60)
    print("✅ MIGRATION TERMINÉE AVEC SUCCÈS")
    print("="*60)
    print(f"\nToutes les données ont été assignées au centre:")
    print(f"   📍 {default_center.name}")
    print(f"   🆔 Tenant ID: {default_tenant_id}")
    print(f"   🌐 URL: {default_center.full_url}")
    print("\n" + "="*60 + "\n")
    
    return True


# Exécuter la migration
if __name__ == '__main__':
    migrate_tenant_data()