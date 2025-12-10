# 🏋️ Gym-Flow - Plateforme SaaS Multi-tenant de Gestion de Salles de Sport
## 📋 Description

Gym-Flow est une plateforme SaaS multi-tenant complète pour la gestion de salles de sport et centres de fitness. Chaque centre dispose de son propre sous-domaine (ex: `powerfit.gymflow.com`) avec une isolation totale des données.

### ✨ Fonctionnalités Principales

- 🔐 **Authentification JWT** avec 4 rôles (Admin, Coach, Réceptionniste, Membre)
- 🏢 **Architecture Multi-tenant** par sous-domaine
- 👥 **Gestion des membres** avec profils, photos, cartes membres PDF
- 💳 **Abonnements & Facturation** avec intégration Stripe
- 📅 **Réservations de cours** avec calendrier interactif
- 🏋️ **Programmes d'entraînement** personnalisés par coach
- 📊 **Tableaux de bord** différenciés par rôle
- 📧 **Emails automatiques** (factures, notifications)
- 📄 **Génération PDF** (factures, cartes, programmes)
- 📈 **Analytics Power BI** (rapports avancés)

---

## 🛠️ Stack Technique

### Backend
- **Django 5.2.8** + Django REST Framework 3.16.1
- **PostgreSQL** avec multi-tenant (tenant_id)
- **JWT Authentication** (djangorestframework-simplejwt)
- **Stripe 7.0.0** pour paiements
- **ReportLab** + **WeasyPrint** pour génération PDF
- **SMTP Gmail** pour emails

### Frontend
- **React 18.2.0** + **Vite 7.1.12**
- **Material Tailwind 2.1.4** pour UI
- **React Router 6.17.0** (SPA)
- **Axios** avec intercepteurs JWT
- **Zod** + **React Hook Form** pour validation

### Infrastructure
- **Docker Compose** (3 services)
- **CORS** configuré
- **Nginx** (production)

---

## 🚀 Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Docker (optionnel)

### 1. Cloner le projet
```bash
git clone https://github.com/saharhamdana/Gym-Flow.git
cd Gym-Flow
```

### 2. Configuration Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp .env.example .env
# Configurer: DATABASE_URL, SECRET_KEY, STRIPE_KEYS, EMAIL_*

# Appliquer les migrations
python manage.py migrate

# Créer un super utilisateur
python manage.py createsuperuser

# Peupler les données de test (optionnel)
python populate_complete_database.py

# Lancer le serveur
python manage.py runserver
```

### 3. Configuration Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
# Configurer: VITE_API_URL

# Lancer le serveur de développement
npm run dev
```

### 4. Accès à l'application

- **Backend API** : http://127.0.0.1:8000/api/
- **Frontend** : http://localhost (port 80)
- **Admin Django** : http://127.0.0.1:8000/admin/

### 5. Docker (Alternative)

```bash
docker-compose up -d
```

---

## 👥 Utilisateurs de Test

Après avoir exécuté `populate_complete_database.py` :

| Rôle | Email | Password | Centre |
|------|-------|----------|--------|
| Admin | admin@powerfit.com | admin123 | PowerFit |
| Coach | coach@powerfit.com | coach123 | PowerFit |
| Réceptionniste | receptionist@powerfit.com | receptionist123 | PowerFit |
| Membre | member@powerfit.com | member123 | PowerFit |

**Centres disponibles** : PowerFit, TitanGym, MoveUp

---

## 📁 Structure du Projet

```
Gym-Flow/
├── backend/
│   ├── authentication/      # Gestion utilisateurs & JWT
│   ├── members/             # Profils membres
│   ├── subscriptions/       # Plans & abonnements
│   ├── bookings/            # Cours & réservations
│   ├── billing/             # Factures & paiements
│   ├── coaching/            # Programmes d'entraînement
│   ├── training_programs/   # Exercices
│   ├── site_utils/          # Endpoints publics
│   ├── config/              # Settings Django
│   └── media/               # Fichiers uploadés
├── frontend/
│   ├── src/
│   │   ├── api/             # Configuration Axios
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages (admin, coach, member, receptionist)
│   │   ├── services/        # Services API
│   │   ├── hooks/           # Hooks personnalisés
│   │   └── utils/           # Utilitaires (AuthGuard)
│   └── public/              # Assets statiques
├── documentation/           # 📚 DOCUMENTATION COMPLÈTE
├── docker-compose.yml
└── README.md
```

---

## 📚 Documentation

La documentation complète se trouve dans le dossier **`documentation/`** :

### 📊 Diagrammes UML
- **ERD (Entity-Relationship Diagram)** : Architecture base de données (15+ tables)
- **Diagramme de Classes** : Modèles Django et relations
- **Use Case Global** : Cas d'utilisation par rôle

### 🎨 Maquettes
- Designs Figma pour toutes les pages

### 📈 Analytics
- Fichiers Power BI (.pbix) avec tableaux de bord
- Connexion PostgreSQL configurée

### 🎥 Démonstration
- Vidéo complète de présentation du projet
- Parcours utilisateur par rôle

### 📄 Rapport
- **Rapport LaTeX complet** avec :
  - Méthodologie Scrum
  - Sprints et rétrospectives
  - Architecture technique
  - Tests et validation


## 🔑 Fonctionnalités par Rôle

### 👨‍💼 Administrateur
- Gestion complète des membres, staff, abonnements
- Configuration des salles, types de cours
- Planification des cours avec calendrier
- Facturation et statistiques globales

### 🏋️ Coach
- Vue de ses membres assignés
- Création de programmes d'entraînement personnalisés
- Suivi de progression (poids, masse grasse)
- Gestion de son planning de cours

### 👥 Réceptionniste
- Inscription nouveaux membres
- Gestion des réservations
- Check-in des participants
- Vente d'abonnements

### 🏃 Membre
- Réservation de cours
- Consultation de son abonnement
- Suivi de sa progression
- Accès à ses programmes d'entraînement
- Paiement en ligne (Stripe)


---


## 📝 Licence

Ce projet est développé dans un cadre académique.

---

**⭐ Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile !**
