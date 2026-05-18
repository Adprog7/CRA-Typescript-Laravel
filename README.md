# Application de Suivi de CRA (Compte Rendu d'Activité)

Cette application est composée d'un backend Laravel (API REST) et d'un frontend React (SPA). 
Voici les instructions pour installer et lancer le projet en environnement de développement local.

## 🚀 Installation Rapide

Pour cloner et exécuter ce projet sur votre machine, suivez ces étapes :

### ⚙️ 1. Configuration du Backend (Laravel)

Ouvrez un terminal et placez-vous dans le dossier `back` :
```bash
cd back
```

1. Installez les dépendances PHP :
   ```bash
   composer install
   ```
2. Créez le fichier d'environnement (si vous êtes sur Windows, copiez-collez `.env.example` en `.env` manuellement ou utilisez cette commande) :
   ```bash
   cp .env.example .env
   ```
3. Générez la clé de sécurité de l'application :
   ```bash
   php artisan key:generate
   ```
4. Configuration de la base de données :
   - Ouvrez phpMyAdmin (ou votre gestionnaire de BDD préféré).
   - Créez une base de données nommée (par exemple) `bdd_cra`.
   - Ouvrez le fichier `.env` et mettez à jour les accès :
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=bdd_cra
     DB_USERNAME=root
     DB_PASSWORD=
     ```
5. Lancez les migrations (création des tables) et les seeders (données de test) :
   ```bash
   php artisan migrate --seed
   ```
6. Démarrez le serveur backend :
   ```bash
   php artisan serve
   ```
   *L'API est maintenant disponible sur http://localhost:8000*

---

### 🎨 2. Configuration du Frontend (React)

Ouvrez un **nouveau** terminal et placez-vous dans le dossier `front` :
```bash
cd front
```

1. Installez les dépendances Javascript :
   ```bash
   npm install
   ```
2. Démarrez le serveur de développement :
   ```bash
   npm start
   ```
   *L'interface web va s'ouvrir automatiquement dans votre navigateur (généralement sur http://localhost:3000)*
