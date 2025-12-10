from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ✅ Charger les variables d'environnement
load_dotenv(os.path.join(BASE_DIR, '.env'))

# ✅ SÉCURITÉ : Toutes les valeurs sensibles viennent du .env
SECRET_KEY = os.getenv('SECRET_KEY', 'changez-moi-en-production')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("⚠️  Attention : Utilisation d'une clé API par défaut (à remplacer)")
    GEMINI_API_KEY = "demo-key"


# ✅ Configuration Email - VERSION FINALE
if DEBUG:
    EMAIL_BACKEND = 'utils.custom_smtp_backend.CustomSMTPBackend'
    # Alternative pour tester rapidement: 
    # EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_USE_SSL = False  # Important: Gmail sur port 587 utilise TLS, pas SSL
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', f'GymFlow <{EMAIL_HOST_USER}>')
EMAIL_TIMEOUT = 30

# Frontend URL pour les liens de réinitialisation
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

PASSWORD_RESET_TIMEOUT = int(os.getenv('PASSWORD_RESET_TIMEOUT', '86400'))

# 🌐 Configuration pour les sous-domaines
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.gymflow.com',
    'gymflow.com',
    'www.gymflow.com',
    'powerfit.gymflow.com',
    'titangym.gymflow.com',
    'moveup.gymflow.com',
    'api.gymflow.com',
    'gym-flow-5s5t.onrender.com',

]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'authentication',      # Doit être première (AUTH_USER_MODEL)
    'members',            # Doit être avant billing
    'subscriptions',      # Doit être avant billing  
    'training_programs',
    'coaching',
    'bookings',
    'billing',      # ← AJOUTEZ CETTE LIGNE
]

AUTH_USER_MODEL = 'authentication.User'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'authentication.middleware.AdminTenantMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ✅ Configuration Base de Données SÉCURISÉE
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'gymflow_db'),
        'USER': os.getenv('POSTGRES_USER', 'gymflow_user'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),  # ⚠️ JAMAIS en dur !
        'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# 🔧 Configuration CORS CORRIGÉE
# 🔧 Configuration CORS CORRIGÉE
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",      # Frontend Vite
    "http://127.0.0.1:5173",      # Frontend Vite (alternative)
    "http://localhost:8000",      # ✅ Backend Django (ajoutez ceci)
    "http://127.0.0.1:8000",      # ✅ Backend Django (ajoutez ceci)
    "http://powerfit.gymflow.com:5173",
    "http://titangym.gymflow.com:5173",
    "http://moveup.gymflow.com:5173",
    "http://gymflow.com:5173",
    "http://api.gymflow.com:8000",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://\w+\.gymflow\.com:\d+$",
    r"^http://localhost:\d+$",        # ✅ Accepte tous les ports localhost
    r"^http://127\.0\.0\.1:\d+$",    # ✅ Accepte tous les ports 127.0.0.1
]


# ✅ Headers déjà corrects
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-tenant-subdomain',
    'tenant-id',
]

# ✅ Ajoutez aussi les méthodes HTTP autorisées
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
# # 🍪 Configuration des cookies pour sous-domaines
# SESSION_COOKIE_DOMAIN = '.gymflow.com'
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True

# CSRF_COOKIE_DOMAIN = '.gymflow.com'
CSRF_COOKIE_SAMESITE = 'Lax'
# CSRF_TRUSTED_ORIGINS = [
#     'http://*.gymflow.com',
#     'https://*.gymflow.com',
#     'http://localhost:5173',
# ]
# 🍪 Cookies + CSRF configuration pour DEV / PROD

if DEBUG:
    # 💻 Mode développement : accès Admin OK
    SESSION_COOKIE_DOMAIN = None
    CSRF_COOKIE_DOMAIN = None
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
else:
    # 🌐 Production multi-tenant
    SESSION_COOKIE_DOMAIN = None  # Pas de domaine pour le développement
    CSRF_COOKIE_DOMAIN = None     # Pas de domaine pour le développement
    CSRF_TRUSTED_ORIGINS = [
        "https://gymflow.com",
        "https://www.gymflow.com",
        "https://powerfit.gymflow.com",
        "https://titangym.gymflow.com",
        "https://moveup.gymflow.com",
        "https://api.gymflow.com",
        "https://gym-flow-5s5t.onrender.com",

    ]

# 📝 Configuration REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# 📁 Configuration des fichiers média
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# 🌐 Domaine parent pour le développement
PARENT_DOMAIN = 'gymflow.com'  # Utilisez localhost en développement

# 🔧 Configuration JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# 📊 Configuration Logging pour DEBUG
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django.core.mail': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        # ✅ Logger pour les middlewares
        'authentication.middleware': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        # ✅ Logger pour les ViewSets
        'bookings.views': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'subscriptions.views': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}


# Ajouter à la fin du fichier
import os
from dotenv import load_dotenv

load_dotenv()

# Stripe Configuration
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')


# Forcer HTTPS même en développement (pour tester)
SECURE_SSL_REDIRECT = False  # Mettez à True en production
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Ajouter pour les PDF
SECURE_HSTS_SECONDS = 3600  # Optionnel
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True


# 📁 Configuration STATIC_ROOT (obligatoire pour collectstatic)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# 🔧 Configuration PRODUCTION
if not DEBUG:
    import dj_database_url
    
    # Database
    DATABASES['default'] = dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=True
    )
    
    # WhiteNoise
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # Security
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # CORS
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = [
        "https://gymflow.vercel.app",
    ]