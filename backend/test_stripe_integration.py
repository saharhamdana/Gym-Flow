#!/usr/bin/env python
"""
Script de test pour vérifier l'intégration Stripe
Usage: python manage.py shell < test_stripe_integration.py
"""

print("\n" + "="*60)
print("🧪 TEST INTÉGRATION STRIPE")
print("="*60 + "\n")

from authentication.models import User
from members.models import Member
from subscriptions.models import SubscriptionPlan, Subscription
from datetime import date, timedelta
import os

# Test 1: Vérifier les clés Stripe
print("1️⃣ Vérification des clés Stripe...")
from django.conf import settings

if settings.STRIPE_SECRET_KEY:
    print(f"   ✅ STRIPE_SECRET_KEY: {settings.STRIPE_SECRET_KEY[:10]}...")
else:
    print("   ❌ STRIPE_SECRET_KEY manquante dans .env")

if settings.STRIPE_PUBLISHABLE_KEY:
    print(f"   ✅ STRIPE_PUBLISHABLE_KEY: {settings.STRIPE_PUBLISHABLE_KEY[:10]}...")
else:
    print("   ❌ STRIPE_PUBLISHABLE_KEY manquante dans .env")

# Test 2: Vérifier la relation User → Member
print("\n2️⃣ Test relation User → Member...")
try:
    user = User.objects.filter(role='MEMBER').first()
    if not user:
        print("   ⚠️  Aucun utilisateur MEMBER trouvé")
        print("   💡 Créez un membre depuis l'admin d'abord")
    else:
        print(f"   ✅ User trouvé: ID={user.id}, Email={user.email}")
        
        try:
            member = user.member_profile
            print(f"   ✅ Member trouvé via relation: ID={member.id}, Member_ID={member.member_id}")
            print(f"   ℹ️  User.id ({user.id}) ≠ Member.id ({member.id}) - C'est NORMAL !")
        except Member.DoesNotExist:
            print(f"   ❌ User {user.id} n'a pas de Member associé")
            print("   💡 Créez le profil Member pour cet utilisateur")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

# Test 3: Vérifier les plans d'abonnement
print("\n3️⃣ Vérification des plans d'abonnement...")
plans = SubscriptionPlan.objects.filter(is_active=True)
if plans.exists():
    print(f"   ✅ {plans.count()} plan(s) actif(s)")
    for plan in plans[:3]:
        print(f"      - {plan.name}: {plan.price} TND / {plan.duration_days} jours")
else:
    print("   ⚠️  Aucun plan actif trouvé")
    print("   💡 Créez des plans depuis /admin/subscriptions/subscriptionplan/")

# Test 4: Créer un abonnement de test
print("\n4️⃣ Création d'un abonnement de test...")
try:
    user = User.objects.filter(role='MEMBER').first()
    if user:
        member = user.member_profile
        plan = SubscriptionPlan.objects.filter(is_active=True).first()
        
        if member and plan:
            # Vérifier si abonnement existe déjà
            existing = Subscription.objects.filter(
                member=member,
                status='PENDING'
            ).first()
            
            if existing:
                print(f"   ℹ️  Abonnement PENDING existe déjà: ID={existing.id}")
                test_sub = existing
            else:
                # Créer nouvel abonnement
                test_sub = Subscription.objects.create(
                    member=member,
                    plan=plan,
                    start_date=date.today(),
                    end_date=date.today() + timedelta(days=plan.duration_days),
                    amount_paid=plan.price,
                    status='PENDING',
                    tenant_id='powerfit'  # Adapter selon votre tenant
                )
                print(f"   ✅ Abonnement créé: ID={test_sub.id}")
            
            print(f"   ✅ Member: {member.member_id}")
            print(f"   ✅ Plan: {plan.name}")
            print(f"   ✅ Montant: {test_sub.amount_paid} TND")
            print(f"   ✅ Statut: {test_sub.status}")
            
        else:
            if not member:
                print("   ❌ Membre non trouvé")
            if not plan:
                print("   ❌ Plan non trouvé")
    else:
        print("   ⚠️  Aucun utilisateur MEMBER pour créer l'abonnement")
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    import traceback
    traceback.print_exc()

# Test 5: Tester l'API (nécessite Stripe actif)
print("\n5️⃣ Test de l'API Stripe...")
try:
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    # Tester connexion Stripe
    balance = stripe.Balance.retrieve()
    print(f"   ✅ Connexion Stripe OK")
    print(f"   ✅ Mode: {'TEST' if 'test' in settings.STRIPE_SECRET_KEY else 'LIVE'}")
except Exception as e:
    print(f"   ❌ Erreur connexion Stripe: {e}")

# Test 6: Résumé
print("\n" + "="*60)
print("📊 RÉSUMÉ")
print("="*60)

try:
    total_members = Member.objects.count()
    total_subscriptions = Subscription.objects.count()
    pending_subscriptions = Subscription.objects.filter(status='PENDING').count()
    active_subscriptions = Subscription.objects.filter(status='ACTIVE').count()
    
    print(f"👥 Membres: {total_members}")
    print(f"📋 Abonnements total: {total_subscriptions}")
    print(f"⏳ Abonnements PENDING: {pending_subscriptions}")
    print(f"✅ Abonnements ACTIVE: {active_subscriptions}")
except Exception as e:
    print(f"❌ Erreur: {e}")

print("\n" + "="*60)
print("✅ Tests terminés !")
print("="*60 + "\n")

print("🚀 PROCHAINES ÉTAPES:")
print("1. Vérifiez que les clés Stripe sont correctes")
print("2. Créez un membre si nécessaire")
print("3. Créez un plan d'abonnement")
print("4. Lancez le serveur: python manage.py runserver")
print("5. Connectez-vous en tant que membre")
print("6. Allez sur /portal/subscription/plans")
print("7. Cliquez 'Payer maintenant'")
print("8. Utilisez la carte test: 4242 4242 4242 4242")
print("\n")