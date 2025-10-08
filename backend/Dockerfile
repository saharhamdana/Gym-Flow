# Utiliser Python slim
FROM python:3.10-slim

# Définir le dossier de travail
WORKDIR /app

# Copier uniquement requirements.txt d'abord pour profiter du cache Docker
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du projet
COPY . .

# Exposer le port 8000
EXPOSE 8000

# Commande pour appliquer les migrations puis lancer le serveur
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
