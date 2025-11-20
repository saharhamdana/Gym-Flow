#!/usr/bin/env python
"""
Script pour corriger les tenant_id des membres
Exécuter avec: python manage.py shell < fix_member_tenant_ids.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from authentication.models import GymCenter, User
from members.models import Member

def fix_member_tenant_ids():
    """
    Corriger les tenant_id des membres en utilisant le tenant_id du centre
    au lieu du subdomain
    """
    print("\n" + "=" * 80)
    print("🔧 CORRECTION DES TENANT_ID DES MEMBRES")
    print("=" * 80 + "\n")
    
    # Récupérer tous les centres
    centers = GymCenter.objects.all()
    
    if not centers.exists():
        print("❌ Aucun centre trouvé")
        return
    
    for center in centers:
        print(f"\n📍 Centre: {center.name}")
        print(f"   Subdomain: {center.subdomain}")
        print(f"   Tenant ID: {center.tenant_id}")
        
        # Trouver les membres avec l'ancien tenant_id (subdomain)
        members_to_fix = Member.objects.filter(tenant_id=center.subdomain)
        
        if members_to_fix.exists():
            count = members_to_fix.count()
            print(f"\n   🔄 {count} membre(s) à corriger...")
            
            # Mettre à jour le tenant_id
            members_to_fix.update(tenant_id=center.tenant_id)
            
            print(f"   ✅ {count} membre(s) corrigé(s)")
            
            # Afficher quelques exemples
            for member in members_to_fix[:3]:
                print(f"      - {member.full_name} ({member.email})")
        else:
            print("   ✓ Aucun membre à corriger")
    
    # Vérification finale
    print("\n" + "=" * 80)
    print("📊 VÉRIFICATION FINALE")
    print("=" * 80 + "\n")
    
    for center in centers:
        members_count = Member.objects.filter(tenant_id=center.tenant_id).count()
        print(f"✓ {center.name}: {members_count} membre(s) avec tenant_id='{center.tenant_id}'")
    
    print("\n✅ Script terminé avec succès!\n")

if __name__ == '__main__':
    fix_member_tenant_ids()