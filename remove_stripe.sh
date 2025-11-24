#!/bin/bash
echo "í·¹ Nettoyage de Stripe..."

# Supprimer les dÃ©pendances
sed -i '/stripe/d' backend/requirements.txt

# Supprimer les clÃ©s du .env
sed -i '/STRIPE_/d' backend/.env

# CrÃ©er un nouveau .env.example sans Stripe
cat > backend/.env.example << 'EOL'
# ================================
# DJANGO CONFIGURATION
# ================================
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# ================================
# DATABASE CONFIGURATION
# ================================
POSTGRES_DB=your-database-name
POSTGRES_USER=your-database-user
POSTGRES_PASSWORD=your-database-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# ================================
# EMAIL CONFIGURATION
# ================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=Your App <your-email@gmail.com>

# ================================
# FRONTEND CONFIGURATION
# ================================
FRONTEND_URL=http://localhost:5173

# ================================
# SECURITY
# ================================
PASSWORD_RESET_TIMEOUT=86400
EOL

echo "âœ… Stripe supprimÃ© !"
