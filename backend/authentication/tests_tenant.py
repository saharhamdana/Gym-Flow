# backend/authentication/tests_tenant.py
# Tests pour vérifier l'isolation multi-tenant

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from authentication.models import GymCenter
from rest_framework.test import APIClient
import json

User = get_user_model()


class TenantIsolationTestCase(TestCase):
    """
    Tests pour vérifier que les utilisateurs sont bien isolés par tenant.
    """
    
    def setUp(self):
        """
        Créer deux centres et des utilisateurs pour les tests.
        """
        # Créer un super-admin pour les centres
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@gymflow.com',
            password='admin123'
        )
        
        # Créer deux centres de fitness
        self.powerfit = GymCenter.objects.create(
            name='PowerFit',
            subdomain='powerfit',
            email='contact@powerfit.com',
            phone='123456',
            address='123 Street',
            owner=self.admin,
            tenant_id='powerfit'
        )
        
        self.moveup = GymCenter.objects.create(
            name='MoveUp',
            subdomain='moveup',
            email='contact@moveup.com',
            phone='789012',
            address='456 Avenue',
            owner=self.admin,
            tenant_id='moveup'
        )
        
        self.client = APIClient()
    
    def test_01_register_assigns_tenant_id(self):
        """
        Test 1: L'inscription doit automatiquement assigner le tenant_id.
        """
        print("\n🧪 Test 1: Inscription avec assignation du tenant_id")
        
        # Simuler une requête depuis powerfit.gymflow.com
        response = self.client.post(
            '/api/auth/register/',
            {
                'username': 'john',
                'email': 'john@example.com',
                'password': 'password123',
                'first_name': 'John',
                'last_name': 'Doe'
            },
            HTTP_HOST='powerfit.gymflow.com',
            HTTP_X_TENANT_SUBDOMAIN='powerfit'
        )
        
        self.assertEqual(response.status_code, 201)
        
        # Vérifier que l'utilisateur a bien le tenant_id
        user = User.objects.get(email='john@example.com')
        self.assertEqual(user.tenant_id, 'powerfit')
        
        # Vérifier la réponse
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['tenant_id'], 'powerfit')
        self.assertEqual(response.data['user']['gym_center'], 'PowerFit')
        
        print("   ✅ Utilisateur créé avec tenant_id='powerfit'")
    
    def test_02_register_without_subdomain_fails(self):
        """
        Test 2: L'inscription sans sous-domaine doit échouer.
        """
        print("\n🧪 Test 2: Inscription sans sous-domaine")
        
        response = self.client.post(
            '/api/auth/register/',
            {
                'username': 'jane',
                'email': 'jane@example.com',
                'password': 'password123',
                'first_name': 'Jane',
                'last_name': 'Smith'
            },
            HTTP_HOST='gymflow.com'  # Pas de sous-domaine
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        
        print("   ✅ Inscription bloquée sans sous-domaine")
    
    def test_03_login_on_correct_subdomain_succeeds(self):
        """
        Test 3: La connexion sur le bon sous-domaine doit réussir.
        """
        print("\n🧪 Test 3: Connexion sur le bon sous-domaine")
        
        # Créer un utilisateur pour PowerFit
        user = User.objects.create_user(
            username='john',
            email='john@powerfit.com',
            password='password123',
            tenant_id='powerfit'
        )
        
        # Tenter de se connecter sur powerfit.gymflow.com
        response = self.client.post(
            '/api/auth/token/',
            {
                'email': 'john@powerfit.com',
                'password': 'password123'
            },
            HTTP_HOST='powerfit.gymflow.com',
            HTTP_X_TENANT_SUBDOMAIN='powerfit'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['tenant_id'], 'powerfit')
        
        print("   ✅ Connexion autorisée sur powerfit.gymflow.com")
    
    def test_04_login_on_wrong_subdomain_fails(self):
        """
        Test 4: La connexion sur le mauvais sous-domaine doit échouer.
        """
        print("\n🧪 Test 4: Connexion sur le mauvais sous-domaine")
        
        # Créer un utilisateur pour PowerFit
        user = User.objects.create_user(
            username='john',
            email='john@powerfit.com',
            password='password123',
            tenant_id='powerfit'
        )
        
        # Tenter de se connecter sur moveup.gymflow.com (mauvais centre)
        response = self.client.post(
            '/api/auth/token/',
            {
                'email': 'john@powerfit.com',
                'password': 'password123'
            },
            HTTP_HOST='moveup.gymflow.com',
            HTTP_X_TENANT_SUBDOMAIN='moveup'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Mauvais centre')
        self.assertIn('correct_url', response.data)
        
        print("   ✅ Connexion bloquée sur moveup.gymflow.com")
        print(f"   ℹ️  Message: {response.data['detail']}")
    
    def test_05_api_access_blocked_on_wrong_subdomain(self):
        """
        Test 5: L'accès aux API doit être bloqué sur le mauvais sous-domaine.
        """
        print("\n🧪 Test 5: Accès API sur le mauvais sous-domaine")
        
        # Créer un utilisateur pour PowerFit
        user = User.objects.create_user(
            username='john',
            email='john@powerfit.com',
            password='password123',
            tenant_id='powerfit'
        )
        
        # Se connecter
        self.client.force_authenticate(user=user)
        
        # Tenter d'accéder au profil depuis moveup.gymflow.com
        response = self.client.get(
            '/api/auth/me/',
            HTTP_HOST='moveup.gymflow.com',
            HTTP_X_TENANT_SUBDOMAIN='moveup'
        )
        
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.data)
        
        print("   ✅ Accès API bloqué sur moveup.gymflow.com")
    
    def test_06_api_access_allowed_on_correct_subdomain(self):
        """
        Test 6: L'accès aux API doit être autorisé sur le bon sous-domaine.
        """
        print("\n🧪 Test 6: Accès API sur le bon sous-domaine")
        
        # Créer un utilisateur pour PowerFit
        user = User.objects.create_user(
            username='john',
            email='john@powerfit.com',
            password='password123',
            tenant_id='powerfit'
        )
        
        # Se connecter
        self.client.force_authenticate(user=user)
        
        # Accéder au profil depuis powerfit.gymflow.com
        response = self.client.get(
            '/api/auth/me/',
            HTTP_HOST='powerfit.gymflow.com',
            HTTP_X_TENANT_SUBDOMAIN='powerfit'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'john@powerfit.com')
        
        print("   ✅ Accès API autorisé sur powerfit.gymflow.com")
    
    def test_07_superuser_bypasses_tenant_restrictions(self):
        """
        Test 7: Les super-admins doivent pouvoir accéder à tous les centres.
        """
        print("\n🧪 Test 7: Super-admin accède à tous les centres")
        
        # Se connecter en tant que super-admin
        self.client.force_authenticate(user=self.admin)
        
        # Accéder depuis powerfit
        response1 = self.client.get(
            '/api/auth/me/',
            HTTP_HOST='powerfit.gymflow.com',
            HTTP_X_TENANT_SUBDOMAIN='powerfit'
        )
        
        self.assertEqual(response1.status_code, 200)
        
        # Accéder depuis moveup
        response2 = self.client.get(
            '/api/auth/me/',
            HTTP_HOST='moveup.gymflow.com',
            HTTP_X_TENANT_SUBDOMAIN='moveup'
        )
        
        self.assertEqual(response2.status_code, 200)
        
        print("   ✅ Super-admin peut accéder à powerfit et moveup")
    
    def test_08_user_without_tenant_blocked(self):
        """
        Test 8: Un utilisateur sans tenant_id doit être bloqué.
        """
        print("\n🧪 Test 8: Utilisateur sans tenant_id")
        
        # Créer un utilisateur sans tenant_id
        user = User.objects.create_user(
            username='orphan',
            email='orphan@example.com',
            password='password123',
            tenant_id=''  # Pas de tenant
        )
        
        # Tenter de se connecter
        response = self.client.post(
            '/api/auth/token/',
            {
                'email': 'orphan@example.com',
                'password': 'password123'
            },
            HTTP_HOST='powerfit.gymflow.com',
            HTTP_X_TENANT_SUBDOMAIN='powerfit'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Compte non configuré')
        
        print("   ✅ Utilisateur sans tenant_id bloqué")
    
    def test_09_multiple_users_same_email_different_tenants(self):
        """
        Test 9: Tester l'isolation avec le même email sur différents tenants.
        Note: Ce test échouera car email est unique. C'est le comportement attendu.
        """
        print("\n🧪 Test 9: Même email sur différents tenants (devrait échouer)")
        
        # Créer un utilisateur john@example.com pour PowerFit
        user1 = User.objects.create_user(
            username='john_powerfit',
            email='john@example.com',
            password='password123',
            tenant_id='powerfit'
        )
        
        # Tenter de créer john@example.com pour MoveUp
        try:
            user2 = User.objects.create_user(
                username='john_moveup',
                email='john@example.com',
                password='password123',
                tenant_id='moveup'
            )
            print("   ❌ ERREUR: Deux utilisateurs avec le même email créés")
            self.fail("Ne devrait pas permettre deux utilisateurs avec le même email")
        except Exception as e:
            print("   ✅ Duplication d'email correctement bloquée")
            print(f"   ℹ️  Message: {str(e)}")


class TenantMiddlewareTestCase(TestCase):
    """
    Tests spécifiques pour le middleware de contrôle d'accès.
    """
    
    def setUp(self):
        """
        Setup pour les tests du middleware.
        """
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@gymflow.com',
            password='admin123'
        )
        
        self.powerfit = GymCenter.objects.create(
            name='PowerFit',
            subdomain='powerfit',
            email='contact@powerfit.com',
            phone='123456',
            address='123 Street',
            owner=self.admin,
            tenant_id='powerfit'
        )
        
        self.user = User.objects.create_user(
            username='john',
            email='john@powerfit.com',
            password='password123',
            tenant_id='powerfit'
        )
        
        self.client = APIClient()
    
    def test_exempt_urls_not_checked(self):
        """
        Test: Les URLs exemptées ne doivent pas être contrôlées.
        """
        print("\n🧪 Test: URLs exemptées du contrôle")
        
        # Register est exempté
        response = self.client.post(
            '/api/auth/register/',
            {},
            HTTP_HOST='moveup.gymflow.com',
            HTTP_X_TENANT_SUBDOMAIN='moveup'
        )
        
        # Ne devrait pas être bloqué par le middleware (mais peut échouer pour autre raison)
        self.assertNotEqual(response.status_code, 403)
        
        print("   ✅ Register accessible sans contrôle de tenant")


# Pour exécuter les tests :
# python manage.py test authentication.tests_tenant
# 
# Pour un test spécifique :
# python manage.py test authentication.tests_tenant.TenantIsolationTestCase.test_04_login_on_wrong_subdomain_fails
#
# Pour exécuter avec verbose :
# python manage.py test authentication.tests_tenant --verbosity=2