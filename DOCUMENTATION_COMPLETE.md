# 📋 Documentation Complète - Projet CRA Laravel

## Table des matières
1. [Vue d'ensemble du projet](#vue-densemble)
2. [Architecture générale](#architecture)
3. [Fichiers créés et modifiés](#fichiers)
4. [Installation et configuration](#installation)
5. [Démarrage de l'application](#démarrage)
6. [Flux d'authentification](#flux)
7. [API Documentation](#api)
8. [Structure des dossiers](#structure)
9. [Dépannage](#dépannage)

---

## Vue d'ensemble du projet {#vue-densemble}

Ce projet est une **application full-stack** combinant :
- **Frontend** : React avec des composants stylisés en Matrix-vert
- **Backend** : Laravel 11 avec API REST
- **Communication** : Fetch API avec CORS configuré
- **Authentification** : Système de login/logout avec localStorage

### Objectifs réalisés :
✅ Connexion backend-frontend  
✅ Page de login stylisée  
✅ Système d'authentification  
✅ Gestion des routes protégées  
✅ Affichage dynamique des missions  
✅ Scripts de démarrage automatisés  

---

## Architecture générale {#architecture}

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVIGATEUR (LOCALHOST:3000)             │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Frontend                                      │   │
│  │  ├─ App.js (Router, Auth Manager)                  │   │
│  │  ├─ Login Component (Formulaire)                   │   │
│  │  ├─ Dashboard (Missions)                           │   │
│  │  └─ Styles CSS (Design Matrix)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │ FETCH API (CORS Activé)
          │ Headers: Content-Type: application/json
          ↓
┌─────────────────────────────────────────────────────────────┐
│               BACKEND API (LOCALHOST:8000/api)               │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Laravel 11                                          │   │
│  │  ├─ routes/api.php                                  │   │
│  │  ├─ bootstrap/app.php (CORS + Middleware)           │   │
│  │  ├─ config/cors.php (Configuration CORS)            │   │
│  │  └─ .env (Configuration d'environnement)            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │ SQLite Database
          ↓
  ┌───────────────────┐
  │  database.sqlite  │
  └───────────────────┘
```

---

## Fichiers créés et modifiés {#fichiers}

### 🎨 Frontend - Componenets créés

#### 1. **`front/src/component/Login.js`** ✨ NOUVEAU
**Rôle** : Composant React pour la page de connexion

**Fonctionnalités** :
- Formulaire avec champs email et mot de passe
- Validation côté client
- Gestion des erreurs
- Animation de chargement
- Appel API POST `/login`
- Sauvegarde du token et user dans localStorage
- Callback onLoginSuccess pour redirection

**Code clé** :
```javascript
const handleSubmit = async (e) => {
  // POST vers /api/login
  const response = await fetch(`${process.env.REACT_APP_API_URL}/login`);
  // Sauvegarde du token et user
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

#### 2. **`front/src/css/Login.css`** ✨ NOUVEAU
**Rôle** : Styles pour la page de connexion

**Caractéristiques** :
- Design Matrix-vert (#00ff00 sur fond noir)
- Animations de chute Matrix en arrière-plan
- Effets de glow sur les inputs/boutons
- Formulaire centré et responsive
- Barre d'erreur stylisée

**Palette de couleurs** :
- Texte principal : `#00ff00` (vert matrix)
- Fond : `#000000` (noir pur)
- Bordures : `#00ff00` avec ombre <br>
- Bouton : gradient `#00ff00` vers `#00cc00`

---

### ⚛️ Frontend - Fichiers modifiés

#### 3. **`front/src/App.js`** 🔄 MODIFIÉ
**Changements apportés** :
- Ajout de React Router pour la navigation
- Système d'authentification avec états
- Gestion du localStorage pour persistence
- Routes protégées (/login, /)
- Bouton de déconnexion
- Affichage de l'email utilisateur

**Nouvelles imports** :
```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./component/Login";
```

**Nouveau système de routes** :
```
/login  → Page de connexion (si pas authentifié)
/       → Dashboard avec missions (si authentifié)
```

**Gestion de l'authentification** :
```javascript
const [user, setUser] = useState(null);
// Vérifier persévérance au démarrage
const savedUser = localStorage.getItem('user');
```

**Bouton déconnexion** :
```javascript
const handleLogout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  setUser(null);
}
```

#### 4. **`front/src/App.css`** 🔄 MODIFIÉ
**Ajouts** :
- Classe `.top-bar` : Barre supérieure avec titre et bouton logout
- Classe `.logout-button` : Bouton de déconnexion rouge gradient
- Classe `.user-info` : Affichage email utilisateur connecté
- Responsive design pour mobile

**Nouvelles classes** :
```css
.top-bar { /* Barre supérieure */ }
.logout-button { /* Bouton rouge avec effects */ }
.user-info { /* Infos utilisateur */ }
```

#### 5. **`front/package.json`** 🔄 MODIFIÉ
**Ajout de dépendance** :
```json
"react-router-dom": "^6.20.0"
```
Nécessaire pour la navigation et les routes protégées.

#### 6. **`front/.env`** ✨ NOUVEAU
**Contenu** :
```
REACT_APP_API_URL=http://localhost:8000/api
```
**Rôle** : URL de base pour tous les appels API

---

### 🔧 Backend - Fichiers créés

#### 7. **`back/config/cors.php`** ✨ NOUVEAU
**Rôle** : Configuration CORS (Cross-Origin Resource Sharing)

**Contenu principal** :
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',      // React Dev
        'http://localhost:5173',      // Vite Dev
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],
    'supports_credentials' => true,
];
```

**Explications** :
- `paths` : Routes qui acceptent les requêtes CORS
- `allowed_origins` : Domaines autorisés à accéder à l'API
- `supports_credentials` : Permet l'envoi de credentials (cookies, auth)

#### 8. **`back/routes/api.php`** 🔄 MODIFIÉ
**Routes ajoutées** :

**1. POST /login** (Publique)
```php
Route::post('/login', function (Request $request) {
    // Valide email et password
    // Retourne token et user info
    return response()->json([
        'token' => 'demo-token-...',
        'user' => [
            'id' => 1,
            'email' => $request->email,
            'name' => 'Utilisateur Test',
        ],
    ]);
});
```

**2. POST /logout** (Publique)
```php
Route::post('/logout', function (Request $request) {
    return response()->json(['message' => 'Déconnexion réussie']);
});
```

**3. GET /user** (Protégée - Sanctum)
```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

**4. GET /missions** (Publique - pour la démo)
```php
Route::get('/missions', function () {
    return [
        ['id' => 1, 'name' => 'Mission 1', ...],
        ['id' => 2, 'name' => 'Mission 2', ...],
    ];
});
```

---

### 🔧 Backend - Fichiers modifiés

#### 9. **`back/.env`** 🔄 MODIFIÉ
**Variables d'environnement** :
```
APP_NAME=CRA-Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000     ← Nouvelle variable

DB_CONNECTION=sqlite
SESSION_DRIVER=database
CACHE_DRIVER=database
```

**Nouveauté** :
- `FRONTEND_URL` : URL du frontend pour la configuration CORS dynamique

#### 10. **`back/bootstrap/app.php`** 🔄 MODIFIÉ
**Middleware ajouté** :
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->statefulApi();  // ← Ajouté pour Sanctum
})
```

**Explications** :
- `statefulApi()` : Permet l'authentification stateful avec cookies
- Nécessaire pour que Sanctum fonctionne correctement

#### 11. **`back/package.json`** 🔄 MODIFIÉ
**Script ajouté** :
```json
"dev:all": "concurrently \"npm run dev\" \"cd ../front && npm start\""
```

**Utilité** : Lance frontend + backend simultanément

---

### 🚀 Scripts de démarrage

#### 12. **`start-dev.bat`** ✨ NOUVEAU
**Plateforme** : Windows

**Fonctionnement** :
1. Vérifie la structure du projet (back/ et front/)
2. Crée/valide le fichier .env
3. Installe les dépendances npm si manquantes
4. Crée la base de données SQLite
5. Lance `npm run dev:all`

**Usage** :
```bash
./start-dev.bat
```

#### 13. **`start-dev.sh`** ✨ NOUVEAU
**Plateforme** : Linux/Mac

**Même fonctionnement** que le .bat

**Usage** :
```bash
bash start-dev.sh
```

#### 14. **`back/config/cors.php`** ✨ NOUVEAU
Déjà décrit ci-dessus.

---

## Installation et configuration {#installation}

### ✅ Prérequis
- **Node.js** v18+ avec npm
- **PHP** v8.2+
- **Composer** installé
- **Git**

### 📦 Étape 1 : Backend

```bash
cd back

# Créer le fichier .env
cp .env.example .env

# Installer les dépendances PHP
composer install

# Générer la clé APP_KEY
php artisan key:generate

# Créer la base de données SQLite
touch database.sqlite

# Exécuter les migrations
php artisan migrate

# Installer les dépendances Node
npm install
```

### 📦 Étape 2 : Frontend

```bash
cd ../front

# Installer les dépendances
npm install
```

### ✅ Vérification
Vérifier que les fichiers existent :
- ✓ `back/.env` avec `FRONTEND_URL=http://localhost:3000`
- ✓ `front/.env` avec `REACT_APP_API_URL=http://localhost:8000/api`
- ✓ `back/config/cors.php`
- ✓ `back/routes/api.php` avec routes login

---

## Démarrage de l'application {#démarrage}

### 🟢 Méthode 1 : Scripts automatisés (Recommandé)

**Windows** :
```bash
cd d:\projet\CRA-Typescript-Laravel
./start-dev.bat
```

**Linux/Mac** :
```bash
cd /path/to/CRA-Typescript-Laravel
bash start-dev.sh
```

**Résultat** :
- Backend tourne sur `http://localhost:8000`
- Frontend tourne sur `http://localhost:3000`
- Tous deux démarrés simultanément avec `concurrently`

### 🟢 Méthode 2 : Manuel dans deux terminaux

**Terminal 1 - Backend** :
```bash
cd back
npm run dev
# ou
php artisan serve
```

L'API est accessible sur `http://localhost:8000/api`

**Terminal 2 - Frontend** :
```bash
cd front
npm start
```

Le frontend est accessible sur `http://localhost:3000`

### 🟢 Méthode 3 : Commande combinée du back

```bash
cd back
npm run dev:all
```

Cela lance les deux serveurs avec concurrently.

---

## Flux d'authentification {#flux}

### 📊 Diagramme du flux

```
┌─────────────────────────────────────────────────────┐
│           Utilisateur ouvre l'app                    │
│         http://localhost:3000                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ├─ Vérifier localStorage
                   │  (user + token)
                   │
        ┌──────────┴──────────┐
        │                     │
   Authenticé          Pas authenticé
        │                     │
        ▼                     ▼
  ┌─────────────┐      ┌──────────────┐
  │  Dashboard  │      │ Page LOGIN   │
  │  + Missions │      │  (form)      │
  └─────────────┘      └──────┬───────┘
                               │
                    Soumettre email/password
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Appel API POST /login│
                    │ Headers: JSON        │
                    │ Body: {email, pass}  │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Succès (200)         Erreur (401)
                    │                     │
                    ▼                     ▼
         ┌─────────────────────┐  ┌──────────────┐
         │ Sauvegarde localStorage│  Afficher erreur
         │ - token              │  Rester sur login
         │ - user info          │  └──────────────┘
         └──────────┬───────────┘
                    │
         Redirection vers /
                    │
                    ▼
             ┌──────────────┐
             │  Dashboard   │ (secure)
             └──────────────┘
```

### 🔐 Étapes détaillées

**1. Accès initial** :
```
Utilisateur → http://localhost:3000
              ↓
          App.js charge
          ↓
          Vérifie localStorage['user']
          ↓
    [Existe?] ← Check
    /         \
   OUI         NON
   |            |
   v            v
Dashboard    Login
```

**2. Soumission du login** :
```
E-mail: user@example.com
Password: password123
        ↓
   handleSubmit()
        ↓
   fetch('/api/login', {
     method: 'POST',
     body: JSON.stringify({
       email: "user@example.com",
       password: "password123"
     })
   })
        ↓
   Réponse du backend:
   {
     "token": "demo-token-123",
     "user": {
       "id": 1,
       "email": "user@example.com",
       "name": "Utilisateur Test"
     }
   }
        ↓
   localStorage.setItem('token', '')
   localStorage.setItem('user', '')
        ↓
   Redirection vers /
        ↓
   Dashboard visible
```

**3. Déconnexion** :
```
Clique "DÉCONNEXION"
        ↓
handleLogout()
        ↓
localStorage.removeItem('user')
localStorage.removeItem('token')
setUser(null)
        ↓
Redirection vers /login
```

---

## API Documentation {#api}

### Base URL
```
http://localhost:8000/api
```

### 🔓 Routes publiques

#### 1. **POST /login** - Se connecter
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse succès (200)** :
```json
{
  "token": "demo-token-abc123",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Utilisateur Test"
  }
}
```

**Réponse erreur (401)** :
```json
{
  "message": "Identifiants invalides"
}
```

---

#### 2. **POST /logout** - Se déconnecter
```http
POST /api/logout
Authorization: Bearer {token}
```

**Réponse (200)** :
```json
{
  "message": "Déconnexion réussie"
}
```

---

#### 3. **GET /missions** - Lister les missions
```http
GET /api/missions
```

**Réponse (200)** :
```json
[
  {
    "id": 1,
    "name": "Mission 1",
    "description": "Description de la mission 1"
  },
  {
    "id": 2,
    "name": "Mission 2",
    "description": "Description de la mission 2"
  }
]
```

---

### 🔐 Routes protégées (À implémenter)

#### 4. **GET /user** - Infos utilisateur (Sanctum)
```http
GET /api/user
Authorization: Bearer {token}
```

**Réponse (200)** :
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Utilisateur Test"
}
```

---

## Structure des dossiers {#structure}

```
CRA-Typescript-Laravel/
│
├── back/                          ← BACKEND LARAVEL
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   │   ├── Client.php
│   │   │   ├── Mission.php
│   │   │   ├── PastDay.php
│   │   │   └── User.php
│   │   └── Providers/
│   ├── bootstrap/
│   │   └── app.php               [MODIFIÉ] - Middleware statefulApi()
│   ├── config/
│   │   ├── app.php
│   │   ├── cors.php              [CRÉÉ] - Configuration CORS
│   │   └── ... autres configs
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php               [MODIFIÉ] - Routes login/logout/missions
│   │   ├── web.php
│   │   └── console.php
│   ├── public/
│   ├── resources/
│   ├── storage/
│   ├── .env                      [MODIFIÉ] - FRONTEND_URL ajoutée
│   ├── composer.json
│   ├── package.json              [MODIFIÉ] - Script dev:all
│   ├── vite.config.js
│   └── ... autres fichiers
│
├── front/                         ← FRONTEND REACT
│   ├── public/
│   ├── src/
│   │   ├── component/
│   │   │   ├── Matrix.js
│   │   │   └── Login.js          [CRÉÉ] - Composant login
│   │   ├── css/
│   │   │   ├── Matrix.css
│   │   │   └── Login.css         [CRÉÉ] - Styles login
│   │   ├── utils/
│   │   ├── App.js                [MODIFIÉ] - Router + Auth
│   │   ├── App.css               [MODIFIÉ] - Styles top-bar
│   │   ├── index.js
│   │   └── index.css
│   ├── .env                      [CRÉÉ] - REACT_APP_API_URL
│   ├── package.json              [MODIFIÉ] - react-router-dom
│   └── ... autres fichiers
│
├── DOCUMENTATION_COMPLETE.md     [CRÉÉ] - Ce fichier
├── CONNEXION_SETUP.md            [CRÉÉ] - Guide de démarrage
├── start-dev.bat                 [CRÉÉ] - Script Windows
├── start-dev.sh                  [CRÉÉ] - Script Linux/Mac
└── README.md

Legend:
[CRÉÉ]     = Nouveau fichier
[MODIFIÉ]  = Fichier existant modifié
```

---

## Dépannage {#dépannage}

### ❌ "CORS error when fetching"

**Cause** : CORS non configuré ou frontend sur mauvais port

**Solutions** :
1. Vérifier que `config/cors.php` existe
2. Vérifier que le frontend tourne sur `http://localhost:3000`
3. Vérifier `FRONTEND_URL` dans `.env` du backend
4. Redémarrer les serveurs

```bash
cd back && npm run dev
```

### ❌ "Cannot POST /api/login"

**Cause** : Route API n'existe pas

**Solutions** :
1. Vérifier que `routes/api.php` contient la route POST /login
2. Vérifier que le backend tourne sur le bon port (8000)
3. Vérifier la variable `REACT_APP_API_URL` dans `front/.env`

### ❌ "Failed to fetch" / "Network error"

**Cause** : Backend pas accessible

**Solutions** :
1. Vérifier que le backend tourne : `http://localhost:8000`
2. Port 8000 occupé? Changer dans `.env` : `APP_URL=http://localhost:8001`
3. Vérifier le firewall Windows/Linux

```bash
netstat -ano | findstr :8000    # Windows
lsof -i :8000                   # Mac/Linux
```

### ❌ "localStorage is not defined"

**Cause** : Code serveur (impossible avec React frontend)

**Solutions** :
1. Vérifier que vous utilisez React (pas Next.js SSR)
2. Code dans useEffect ou event handler?

### ❌ "Module not found: 'react-router-dom'"

**Cause** : Dépendance non installée

**Solution** :
```bash
cd front
npm install react-router-dom
```

### ❌ "Cannot bind to port 3000 / 8000"

**Cause** : Port déjà utilisé

**Solutions** :

Pour React (port 3000) :
```bash
cd front
PORT=3001 npm start
```

Pour Laravel :
```bash
cd back
php artisan serve --port=8001
```

Puis mettre à jour `front/.env` :
```
REACT_APP_API_URL=http://localhost:8001/api
```

### ❌ "Database doesn't exist"

**Cause** : Migrations non exécutées

**Solution** :
```bash
cd back
php artisan migrate
```

### ✅ Tout fonctionne !

Tester en ouvrant :
- `http://localhost:3000` - Interface React
- `http://localhost:3000/login` - Page de login
- `http://localhost:8000/api/missions` - API directement

---

## Récapitulatif des modifications {#recap}

| Fichier | Type | Action | Détail |
|---------|------|--------|--------|
| `front/src/component/Login.js` | Frontend | Créé | Composant login avec form |
| `front/src/css/Login.css` | Frontend | Créé | Styles Matrix-vert |
| `front/src/App.js` | Frontend | Modifié | Router + Auth manager |
| `front/src/App.css` | Frontend | Modifié | Styles top-bar logout |
| `front/package.json` | Frontend | Modifié | Ajout react-router-dom |
| `front/.env` | Frontend | Créé | REACT_APP_API_URL |
| `back/config/cors.php` | Backend | Créé | Configuration CORS |
| `back/routes/api.php` | Backend | Modifié | Routes login/logout |
| `back/bootstrap/app.php` | Backend | Modifié | Middleware statefulApi |
| `back/.env` | Backend | Modifié | Ajout FRONTEND_URL |
| `back/package.json` | Backend | Modifié | Script dev:all |
| `start-dev.bat` | Root | Créé | Script Windows |
| `start-dev.sh` | Root | Créé | Script Linux/Mac |
| `CONNEXION_SETUP.md` | Root | Créé | Guide rapide |
| `DOCUMENTATION_COMPLETE.md` | Root | Créé | Cette documentation |

---

## Prochaines étapes recommandées

1. **Authentification réelle** :
   - Utiliser `Auth::attempt()` au lieu de démo
   - Implémenter les tokens Sanctum
   - Hash des passwords avec `Hash::make()`

2. **Gestion des erreurs** :
   - Validation des inputs côté backend
   - Messages d'erreur précis
   - Logging des erreurs

3. **Sécurité** :
   - HTTPOnly cookies au lieu de localStorage
   - CSRF protection
   - Rate limiting

4. **Features additionnelles** :
   - Page d'inscription
   - Récupération de mot de passe
   - Gestion des profiles utilisateur
   - Dashboard amélioré

---

## Contacts & Support

Pour plus d'informations sur :
- **React Router** : https://reactrouter.com/
- **Laravel Sanctum** : https://laravel.com/docs/sanctum
- **CORS** : https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

**Document généré le** : 14 Avril 2026  
**Projet** : CRA-Typescript-Laravel  
**État** : ✅ Fonctionnel
