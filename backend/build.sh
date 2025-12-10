#!/usr/bin/env bash
# backend/build.sh

set -o errexit

echo "🔧 Installation des dépendances..."
pip install -r requirements.txt

echo "📦 Collecte des fichiers statiques..."
python manage.py collectstatic --no-input

echo "🗄️ Migrations de la base de données..."
python manage.py migrate

echo "✅ Build terminé!"