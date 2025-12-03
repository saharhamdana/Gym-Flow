#!/bin/bash
# backend/docker-entrypoint.sh

set -e

echo "🚀 Starting GymFlow Backend..."

# Valeur par défaut pour le port PostgreSQL
POSTGRES_PORT=${POSTGRES_PORT:-5432}

# Attendre que PostgreSQL soit prêt
echo "⏳ Waiting for PostgreSQQQL..."
until python -c "import psycopg2; psycopg2.connect(host='$POSTGRES_HOST', dbname='$POSTGRES_DB', user='$POSTGRES_USER', password='$POSTGRES_PASSWORD')" 2>/dev/null; do
    sleep 1
done
echo "✅ PostgreSQL is ready!"


# Exécuter les migrations
echo "🔄 Running migrations..."
python manage.py migrate --noinput

# Créer un superuser si nécessaire (optionnel)
echo "👤 Creating superuser if needed..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@gymflow.com', 'admin123')
    print('✅ Superuser created')
else:
    print('ℹ️  Superuser already exists')
END

# Collecter les fichiers statiques (optionnel)
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Setup complete!"

# Exécuter la commande passée au conteneur
exec "$@"
