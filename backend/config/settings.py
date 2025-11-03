"""
Django settings for config project - Configuration Multi-Tenant
"""

from pathlib import Path
import os
from datetime import timedelta
import os 
from dotenv import load_dotenv
load_dotenv()

# --- Email Backend Configuration (for SendGrid) ---
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.sendgrid.net') 
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True # Utilisation du port 587
# EMAIL_USE_SSL = False # S'assurer que SSL est désactivé si TLS est activé

# --- Email Credentials from .env ---
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')     # 'apikey'
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD') # La clé API

# --- Site Defaults ---
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL') # L'adresse vérifiée
RECIPIENT_EMAIL = os.environ.get('RECIPIENT_EMAIL')


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-j9f@fp$#g%c8m&j1x(nbxxm6tevy)onkt4=*09(s2o6u5!2t(s'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# 🌐 Configuration pour les sous-domaines (Version Distante)
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.gymflow.com',  # Accepte gymflow.com et tous les sous-domaines
    'gymflow.com',
    'www.gymflow.com',
    'powerfit.gymflow.com',
    'titangym.gymflow.com',
    'moveup.gymflow.com',
    'api.gymflow.com',
]


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist', # <-- Ajouté (pris de HEAD)
    'corsheaders',
    'django_filters', # <-- Ajouté (pris de HEAD)

    # Local apps
    'authentication',
    'subscriptions',
    'members',
    'bookings',
    'training_programs',
    'site_utils',
]

AUTH_USER_MODEL = 'authentication.User'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Doit être en premier
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'authentication.middleware.SubdomainMiddleware', # <-- Ajouté (pris de Distante)
    'authentication.middleware.TenantMiddleware', # <-- Ajouté (pris de Distante)
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug', # <-- Ajouté (pris de HEAD)
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'gymflow_db',
        'USER': 'gymflow_user',
        'PASSWORD': '123456',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

APPEND_SLASH = True # <-- Ajouté (pris de HEAD)


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Tunis' # <-- Mis à jour vers 'Africa/Tunis' (pris de HEAD)
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') # <-- Ajouté (pris de HEAD)

# Media files (uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
#MEDIA_ROOT = BASE_DIR / 'media' # Cette ligne est redondante, la laisser si vous préférez cette syntaxe

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ========================================
# ✅ CORS CONFIGURATION
# ========================================
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Ajout des adresses de la version distante pour éviter de les perdre
    "http://gymflow.com:5173",
    "http://www.gymflow.com:5173",
    "http://powerfit.gymflow.com:5173",
    "http://titangym.gymflow.com:5173",
    "http://moveup.gymflow.com:5173",
]

# 📝 Ajout de CORS_ALLOWED_ORIGIN_REGEXES pour le multi-tenant
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://\w+\.gymflow\.com$",
    r"^http://\w+\.gymflow\.com:\d+$",
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
]


CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [ # <-- Ajouté (pris de HEAD)
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

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
    'x-tenant-subdomain',  # 🎯 Header pour identifier le tenant (pris de Distante)
]

# 🍪 Configuration des cookies pour sous-domaines (Pris de Distante)
SESSION_COOKIE_DOMAIN = '.gymflow.com' 
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True

CSRF_COOKIE_DOMAIN = '.gymflow.com'
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = [
    'http://*.gymflow.com',
    'https://*.gymflow.com',
    'http://localhost:5173',
]

# 🌐 Domaine parent pour les sous-domaines (Pris de Distante)
PARENT_DOMAIN = 'gymflow.com'


# ========================================
# ✅ REST FRAMEWORK CONFIGURATION
# ========================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [ # <-- Ajouté (pris de HEAD)
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination', # <-- Ajouté (pris de HEAD)
    'PAGE_SIZE': 10, # <-- Ajouté (pris de HEAD)
}


# ========================================
# ✅ SIMPLE JWT CONFIGURATION (Pris de HEAD, plus détaillé)
# ========================================
SIMPLE_JWT = {
    # Durée de vie des tokens
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # Rotation des tokens
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True, # <-- Ajouté (pris de HEAD)

    # Algorithme de chiffrement
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    # Configuration des en-têtes
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    # Classes de tokens
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',

    # Claims JWT
    'JTI_CLAIM': 'jti',

    # Tokens glissants (sliding tokens - optionnel)
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}


# ========================================
# ✅ LOGGING CONFIGURATION (Optionnel mais recommandé) (Pris de HEAD)
# ========================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}