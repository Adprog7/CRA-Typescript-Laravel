# Configuration Backend-Frontend - CRA Laravel

Ce document explique comment connecter et exécuter votre application Laravel avec React.

## Structure du projet
```
back/  → API Laravel (port 8000)
front/ → Frontend React (port 3000)
```

## Configuration complétée ✓

### Backend (Laravel)
1. **CORS configuré** - Les requêtes du frontend seront acceptées
2. **API routes** - Route `/api/missions` disponible
3. **.env configuré** - URL frontend définie
4. **Sanctum** - Prêt pour l'authentification

### Frontend (React)
1. **Variable d'environnement** `.env` avec l'URL de l'API
2. **App.js mis à jour** - Récupère les missions de l'API au démarrage

## Installation

### 1. Backend
```bash
cd back
composer install
php artisan migrate
npm install
```

### 2. Frontend
```bash
cd front
npm install
```

## Démarrage

### Option 1 : Démarrer les deux simultanément (depuis le dossier back)
```bash
cd back
npm run dev:all
```

Cela va lancer :
- Backend Laravel Vite sur `http://localhost:5173`
- API Laravel sur `http://localhost:8000`
- Frontend React sur `http://localhost:3000`

### Option 2 : Démarrer séparément

**Terminal 1 - Backend**
```bash
cd back
php artisan serve  # ou
npm run dev        # Vite dev server
```

**Terminal 2 - Frontend**
```bash
cd front
npm start
```

## Vérification de la connexion

1. Ouvrez `http://localhost:3000` dans votre navigateur
2. Le frontend devrait afficher "Gestion des Missions"
3. Si des missions existent en base, elles s'afficheront dans la liste
4. Ouvrez la console du navigateur (F12) pour voir les appels API

## URLs importantes

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:3000` |
| API Laravel | `http://localhost:8000/api` |
| Vite Dev | `http://localhost:5173` |

## Fichiers modifiés

### ✓ Créés/Modifiés
- `back/config/cors.php` - Configuration CORS
- `back/.env` - Variables d'environnement (FRONTEND_URL ajoutée)
- `back/bootstrap/app.php` - Middleware statefulApi() ajouté
- `back/package.json` - Script dev:all ajouté
- `back/routes/api.php` - Route /missions
- `front/.env` - Variable REACT_APP_API_URL
- `front/src/App.js` - Intégration API (fetchMissions)

## Communication API

L'URL de base de l'API est définie via `REACT_APP_API_URL`:
```javascript
const response = await fetch(`${process.env.REACT_APP_API_URL}/missions`);
```

Adaptez les routes API selon vos besoins. Les routes disponibles :
- `GET /api/missions` - Liste des missions

## Dépannage

### "CORS error" 
Vérifiez que:
- Backend tourne sur `http://localhost:8000`
- FRONTEND_URL dans `.env` est correct

### "Network error"
Vérifiez que:
- Backend Laravel est démarré
- Port 8000 n'est pas utilisé par une autre application
- Le fichier `.env` est correct

### Migrations
Si des erreurs de base de données:
```bash
cd back
php artisan migrate:fresh --seed
```

## Prochaines étapes

1. Créer des contrôleurs API pour vos données (Client, Mission, PastDay)
2. Ajouter des formulaires React
3. Implémenter l'authentification Sanctum
4. Ajouter une validation côté serveur
