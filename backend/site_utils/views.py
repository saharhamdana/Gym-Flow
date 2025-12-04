# backend/site_utils/views.py
import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from django.utils.decorators import method_decorator
import google.generativeai as genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

# Contact Form (inchangé)
@method_decorator(csrf_exempt, name='dispatch')
class ContactFormSubmissionView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            full_name = data.get('fullName')
            email = data.get('email')
            message = data.get('message')

            if not all([full_name, email, message]):
                return JsonResponse({'message': 'All fields are required.'}, status=400)

            subject = f'New Contact Form Submission from: {full_name}'
            email_body = (
                f"You have received a new message from the website.\n\n"
                f"Name: {full_name}\n"
                f"Email: {email}\n"
                f"Message:\n---\n{message}\n---"
            )

            send_mail(
                subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [settings.EMAIL_HOST_USER],
                fail_silently=False,
            )

            return JsonResponse({'message': 'Message sent successfully!'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format in request.'}, status=400)
        except Exception as e:
            print(f"Email sending failed: {e}")
            return JsonResponse({'message': f'Error: {str(e)}'}, status=500)

# ✅ VUE MISE À JOUR POUR GEMINI 2.0/2.5
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt 
def generate_health_plan(request):
    try:
        # Vérifier si la clé API est configurée
        if not hasattr(settings, 'GEMINI_API_KEY') or not settings.GEMINI_API_KEY:
            return Response({
                'success': False,
                'error': 'Clé API Gemini non configurée'
            }, status=500)
        
        # Configurer Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Récupérer les données
        data = request.data
        bmi = float(data.get('bmi', 0))
        classification = data.get('classification', '')
        height = float(data.get('height', 0))
        weight = float(data.get('weight', 0))
        goals = data.get('goals', 'général')
        
        # Validation des données
        if bmi <= 0 or height <= 0 or weight <= 0:
            return Response({
                'success': False,
                'error': 'Données invalides. Taille, poids et IMC doivent être positifs.'
            }, status=400)
        
        # ✅ LISTE DES MODÈLES DISPONIBLES DANS VOTRE COMPTE (Gemini 2.0/2.5)
        available_models = [
            # Modèles Gemini 2.5 (les plus récents)
            'gemini-2.5-flash',                    # Rapide et efficace
            'gemini-2.5-flash-latest',             # Dernière version
            'models/gemini-2.5-flash',             # Format complet
            'gemini-2.5-flash-preview-09-2025',    # Version preview
            
            # Modèles Gemini 2.0 (très stables)
            'gemini-2.0-flash',                    # Flash standard
            'gemini-2.0-flash-001',                # Version spécifique
            'models/gemini-2.0-flash',             # Format complet
            'gemini-2.0-flash-exp',                # Version expérimentale
            
            # Modèles légers (gratuits/économiques)
            'gemini-2.0-flash-lite',               # Version allégée
            'gemini-2.0-flash-lite-001',           # Lite spécifique
            'gemini-2.5-flash-lite',               # Lite 2.5
            'gemini-flash-latest',                 # Dernière version flash
            
            # Modèles Pro
            'gemini-2.5-pro',                      # Pro 2.5
            'gemini-2.0-pro-exp',                  # Pro expérimental
            'gemini-pro-latest',                   # Dernier pro
            
            # Modèles expérimentaux
            'gemini-exp-1206',                     # Expérimental déc 2024
            'models/gemini-exp-1206',              # Format complet
        ]
        
        # Vérification des modèles disponibles
        try:
            available_model_list = genai.list_models()
            all_model_names = [model.name for model in available_model_list]
            print(f"📋 Modèles disponibles via l'API: {all_model_names}")
            
            # Filtrer pour ne garder que les modèles de génération de contenu
            generation_models = []
            for model in available_model_list:
                if 'generateContent' in model.supported_generation_methods:
                    # Extraire le nom court du modèle
                    model_name = model.name
                    if model_name.startswith('models/'):
                        model_name = model_name[7:]  # Enlever 'models/'
                    generation_models.append(model_name)
            
            if generation_models:
                # Utiliser d'abord les modèles vérifiés comme disponibles
                print(f"✅ Modèles avec generateContent: {generation_models}")
                
                # Créer une liste prioritaire basée sur les modèles disponibles
                priority_models = []
                
                # Ajouter d'abord les modèles flash (gratuits/économiques)
                for model in generation_models:
                    if 'flash' in model.lower() and 'lite' in model.lower():
                        priority_models.append(model)
                
                # Ajouter les autres modèles flash
                for model in generation_models:
                    if 'flash' in model.lower() and model not in priority_models:
                        priority_models.append(model)
                
                # Ajouter les modèles pro
                for model in generation_models:
                    if 'pro' in model.lower() and model not in priority_models:
                        priority_models.append(model)
                
                # Ajouter les autres modèles
                for model in generation_models:
                    if model not in priority_models:
                        priority_models.append(model)
                
                # Ajouter les modèles de secours
                priority_models.extend([m for m in available_models if m not in priority_models])
                
                available_models = priority_models
                print(f"🎯 Modèles prioritaires: {available_models[:10]}...")  # Afficher les 10 premiers
        except Exception as list_error:
            print(f"⚠️ Impossible de lister les modèles: {list_error}")
            # Continuer avec la liste par défaut
        
        plan = None
        last_error = None
        used_model = None
        
        # Essayer chaque modèle jusqu'à ce que l'un fonctionne
        for model_name in available_models:
            try:
                print(f"🔄 Essai du modèle: {model_name}")
                
                prompt = f"""
Tu es un expert en nutrition et fitness. L'utilisateur a ces caractéristiques :
- IMC : {bmi}
- Classification : {classification}
- Taille : {height} cm
- Poids : {weight} kg
- Objectif : {goals}

Génère un plan personnalisé COMPLET en français avec ces sections :

## 📊 Analyse de la situation
(2-3 phrases sur sa situation actuelle)

## 🍽️ Plan alimentaire hebdomadaire
Pour chaque jour (Lundi à Dimanche) :
- Petit-déjeuner
- Déjeuner
- Dîner
- Collations saines

## 🏋️ Programme d'exercices
5 exercices adaptés avec :
- Nom de l'exercice
- Séries et répétitions
- Durée ou intensité
- Conseils d'exécution

## 💡 Conseils pratiques
3-4 conseils clés pour réussir

## ⚠️ Avertissement médical
Rappel important de consulter un professionnel de santé

Ton : Professionnel, motivant, encourageant.
Format : Markdown bien structuré.
"""
                
                # Essayer le modèle avec le nom correct
                if model_name.startswith('models/'):
                    full_model_name = model_name
                else:
                    full_model_name = f"models/{model_name}"
                
                model = genai.GenerativeModel(full_model_name)
                response = model.generate_content(prompt)
                plan = response.text
                used_model = model_name
                print(f"✅ Modèle réussi: {model_name}")
                print(f"📝 Longueur de la réponse: {len(plan)} caractères")
                break
                
            except Exception as model_error:
                last_error = str(model_error)
                if "404" in str(model_error):
                    print(f"❌ Modèle {model_name} non trouvé")
                elif "quota" in str(model_error).lower():
                    print(f"⚠️ Quota dépassé pour {model_name}")
                else:
                    print(f"❌ Modèle {model_name} échoué: {model_error}")
                continue
        
        # Si aucun modèle ne fonctionne, utiliser un plan de secours
        if not plan:
            print(f"⚠️ Tous les modèles ont échoué, utilisation du plan de secours")
            print(f"Dernière erreur: {last_error}")
            plan = generate_fallback_plan(bmi, classification, height, weight, goals)
            used_model = "fallback"
        
        return Response({
            'success': True,
            'plan': plan,
            'model_used': used_model,
            'note': 'Plan généré avec succès' if used_model != 'fallback' else 'Plan de secours (Gemini indisponible)'
        })
        
    except ValueError as e:
        return Response({
            'success': False,
            'error': 'Données invalides. Vérifiez les valeurs numériques.'
        }, status=400)
    except Exception as e:
        print(f"❌ Erreur serveur Gemini: {str(e)}")
        # En cas d'erreur totale, retourner un plan de secours
        try:
            fallback_plan = generate_fallback_plan(
                float(request.data.get('bmi', 25)),
                request.data.get('classification', 'Surpoids'),
                float(request.data.get('height', 175)),
                float(request.data.get('weight', 75)),
                request.data.get('goals', 'général')
            )
            return Response({
                'success': True,
                'plan': fallback_plan,
                'model_used': 'fallback_error',
                'note': 'Plan de secours (erreur serveur)'
            })
        except:
            return Response({
                'success': False,
                'error': f'Erreur serveur : {str(e)}'
            }, status=500)

def generate_fallback_plan(bmi, classification, height, weight, goals):
    """Génère un plan de secours détaillé sans IA"""
    return f"""
# 🎯 Plan Fitness Personnalisé - {classification}

## 📊 Votre Profil
- **IMC**: {bmi}
- **Classification**: {classification}
- **Taille**: {height} cm
- **Poids**: {weight} kg
- **Objectif principal**: {goals}

## 🍎 Plan Alimentaire Hebdomadaire (Exemple)

### 🟢 **Lundi - Jour équilibré**
- **Petit-déjeuner**: Omelette 2 œufs + épinards + 1 tranche pain complet
- **Déjeuner**: Poulet grillé 150g + quinoa 100g + légumes vapeur
- **Dîner**: Saumon 120g + patate douce + salade verte
- **Collations**: Yaourt grec + 10 amandes

### 🔵 **Mardi - Jour léger**
- **Petit-déjeuner**: Smoothie (banane, épinards, protéine whey, lait d'amande)
- **Déjeuner**: Salade de lentilles + avocat + tomates
- **Dîner**: Omelette aux champignons + salade
- **Collations**: Pomme + fromage blanc

### 🟡 **Mercredi - Jour énergie**
- **Petit-déjeuner**: Porridge d'avoine 50g + fruits rouges + miel
- **Déjeuner**: Thon en conserve + riz complet + haricots verts
- **Dîner**: Dinde 150g + brocoli + quinoa
- **Collations**: Fruit frais + noix

### 🔴 **Jeudi - Jour protéines**
- **Petit-déjeuner**: Pancakes protéinés + sirop d'érable
- **Déjeuner**: Steak haché 5% + patate douce + haricots
- **Dîner**: Blanc de poulet + ratatouille
- **Collations**: Cottage cheese + fruits secs

### 🟣 **Vendredi - Jour flexibilité**
- **Petit-déjeuner**: Tartines avocat + œuf poché
- **Déjeuner**: Salade César légère + poulet
- **Dîner**: Poisson blanc + riz basmati + légumes
- **Collations**: Barre protéinée maison

### 🟠 **Week-end - Jours détente**
- **Samedi**: Repas libre mais contrôlé
- **Dimanche**: Préparation des repas de la semaine

## 💪 Programme d'Exercices Adapté

### 📅 **Lundi - Haut du corps**
1. **Pompes** : 3 séries de 12-15 répétitions
2. **Tractions assistées** : 3x8-10
3. **Développé couché haltères** : 3x12
4. **Rowing barre** : 3x12
5. **Élévations latérales** : 3x15
   ⏱️ **Durée totale**: 45 minutes

### 📅 **Mardi - Bas du corps**
1. **Squats** : 4 séries de 10-12 répétitions
2. **Fentes marchées** : 3x10 par jambe
3. **Soulevé de terre** : 3x10
4. **Leg press** : 3x15
5. **Mollets debout** : 4x20
   ⏱️ **Durée totale**: 50 minutes

### 📅 **Mercredi - Cardio & Cœur**
- **Course à pied** : 25-30 minutes (rythme modéré)
- **Vélo elliptique** : 15 minutes
- **Corde à sauter** : 5x1 minute
   ⏱️ **Durée totale**: 45-50 minutes

### 📅 **Jeudi - Repos actif**
- **Marche rapide** : 30-40 minutes
- **Étirements** : 15-20 minutes
- **Yoga doux** : 20 minutes
   🧘 **Focus**: Récupération

### 📅 **Vendredi - Full Body**
1. **Burpees** : 4 séries de 10
2. **Mountain climbers** : 3x30 secondes
3. **Planche** : 3x45-60 secondes
4. **Jumping jacks** : 3x40
5. **Russian twists** : 3x20
   ⏱️ **Durée totale**: 40 minutes

## 🎯 **Conseils Clés pour Réussir**

1. **💧 Hydratation** : 2 à 3 litres d'eau par jour
2. **😴 Sommeil** : 7-8 heures de qualité chaque nuit
3. **📈 Progressivité** : Augmentez l'intensité graduellement
4. **🎵 Motivation** : Écoutez de la musique pendant l'entraînement
5. **📱 Suivi** : Notez vos progrès dans une application
6. **🤝 Communauté** : Entraînez-vous avec un partenaire

## ⚠️ **Avertissements Médicaux Importants**

**CONSULTEZ UN MÉDECIN AVANT DE COMMENCER**
- Ce plan est générique et informatif
- Adaptez les exercices à votre condition physique
- Arrêtez immédiatement en cas de douleur ou malaise
- Les besoins nutritionnels varient selon l'âge et le sexe
- Suivez les conseils de professionnels certifiés

## 💝 **Message de Motivation**

Chaque jour compte ! Vos efforts d'aujourd'hui construisent la santé de demain. 
Félicitations pour avoir pris cette initiative vers une vie plus saine ! 🎉

**Rappel**: La régularité est plus importante que la perfection.
"""
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def chatbot_assistant(request):
    """Endpoint pour le chatbot santé"""
    try:
        data = request.data
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return Response({'response': 'Veuillez poser une question.'})
        
        # Vérifier API key
        if not hasattr(settings, 'GEMINI_API_KEY') or not settings.GEMINI_API_KEY:
            return Response({
                'response': 'Configuration IA indisponible. Voici un conseil général : Buvez 2L d\'eau par jour et marchez 30 minutes quotidiennement.'
            })
        
        # Configurer Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Prompt pour le chatbot
        prompt = f"""
        Tu es un assistant santé et nutrition français, sympathique et professionnel.
        L'utilisateur demande : "{user_message}"
        
        Règles importantes :
        1. Réponds en français, de manière concise (max 3-4 phrases)
        2. Reste positif et encourageant
        3. Ne donne pas de diagnostic médical
        4. Recommande toujours de consulter un professionnel si nécessaire
        5. Propose des conseils pratiques et réalisables
        
        Exemples de bonnes réponses :
        - "Pour perdre du poids, je recommande de manger plus de légumes, réduire les sucres ajoutés et faire 30min d'exercice par jour."
        - "L'hydratation varie selon l'activité, mais visez 1.5L à 2L d'eau par jour en général."
        - "Comme exercice débutant : marche rapide 20min, pompes sur les genoux, et planche 30 secondes."
        
        Réponds maintenant :
        """
        
        # Utiliser le modèle Gemini
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        return Response({
            'response': response.text.strip(),
            'success': True
        })
        
    except Exception as e:
        print(f"Erreur chatbot: {e}")
        # Réponses de secours
        fallback_responses = [
            "Je recommande une alimentation équilibrée et 30 minutes d'activité physique par jour.",
            "Buvez suffisamment d'eau et dormez 7 à 8 heures pour une santé optimale.",
            "Consultez un nutritionniste pour des conseils personnalisés à votre situation."
        ]
        import random
        return Response({
            'response': f"{random.choice(fallback_responses)} (Note : l'IA est temporairement indisponible)",
            'success': False
        })


@api_view(['GET'])
@permission_classes([AllowAny])  # Public access - no authentication required
def public_coaches_list(request):
    """
    Endpoint public pour afficher la liste des coachs sur la page d'accueil
    Accessible sans authentification
    """
    try:
        # Récupérer tous les utilisateurs avec le rôle COACH
        coaches = User.objects.filter(
            role='COACH',
            is_active=True
        ).values(
            'id',
            'first_name', 
            'last_name', 
            'email',
            'phone',
            'profile_picture'
        )
        
        # Construire la liste des coachs avec URLs des photos
        coaches_list = []
        for coach in coaches:
            coach_data = {
                'id': coach['id'],
                'first_name': coach['first_name'] or '',
                'last_name': coach['last_name'] or '',
                'email': coach['email'],
                'phone': coach['phone'] or '',
                'profile_picture': coach['profile_picture'],
                'profile_picture_url': f"/media/{coach['profile_picture']}" if coach['profile_picture'] else None
            }
            coaches_list.append(coach_data)
        
        return Response({
            'success': True,
            'coaches': coaches_list,
            'count': len(coaches_list)
        })
        
    except Exception as e:
        print(f"Erreur lors de la récupération des coachs: {e}")
        return Response({
            'success': False,
            'error': 'Erreur lors de la récupération des coachs',
            'coaches': [],
            'count': 0
        })