@echo off
REM start-dev.bat - Script pour démarrer Gym Flow sur Windows

echo ========================================
echo   Gym Flow - Mode Developpement
echo ========================================
echo.

REM Couleurs via PowerShell (optionnel)
color 0A

REM 1. Démarrer le backend Django
echo [1/2] Demarrage du backend Django...
cd backend

REM Activer l'environnement virtuel si présent
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Appliquer les migrations
python manage.py migrate

REM Créer les centres de test
python manage.py shell < create_test_centers.py 2>nul

REM Démarrer Django dans une nouvelle fenêtre
start "Django Backend" cmd /k "python manage.py runserver 0.0.0.0:8000"

cd ..

REM Attendre un peu
timeout /t 3 /nobreak >nul

REM 2. Démarrer le frontend Vite
echo [2/2] Demarrage du frontend Vite...
cd frontend

REM Installer les dépendances si nécessaire
if not exist node_modules (
    npm install
)

REM Démarrer Vite dans une nouvelle fenêtre
start "Vite Frontend" cmd /k "npm run dev -- --host 0.0.0.0"

cd ..

REM 3. Afficher les URLs
echo.
echo ========================================
echo   Gym Flow est pret !
echo ========================================
echo.
echo URLs disponibles :
echo.
echo   Backend API:
echo   - http://127.0.0.1:8000/api/
echo.
echo   Frontend (standard):
echo   - http://localhost:5173/
echo.
echo   Frontend (sous-domaines):
echo   - http://powerfit.gymflow.com:5173/
echo   - http://titangym.gymflow.com:5173/
echo   - http://moveup.gymflow.com:5173/
echo.
echo   Mode test:
echo   - http://localhost:5173/?tenant=powerfit
echo   - http://localhost:5173/?tenant=titangym
echo   - http://localhost:5173/?tenant=moveup
echo.
echo ========================================
echo.

pause