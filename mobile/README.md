# 📱 MyDigitalSchool - Stock Management App

Applicat Expo (React Native) pour la gestion multi-utilisateurs d'un stock de produits, avec authentification Supabase et gestion de trois rôles (Owner, Employee, Customer).

## ✨ Fonctionnalités

### 🔐 Authentification
- ✅ Inscription avec choix de rôle
- ✅ Connexion sécurisée
- ✅ Gestion des sessions
- ✅ Déconnexion

### 👥 Rôles & Permissions
- **Owner** 👨‍💼 : Accès complet, gestion du stock et des utilisateurs
- **Employee** 👷 : Gestion du stock
- **Customer** 👤 : Consultation du stock (lecture seule)

### 📦 Gestion de Stock
- ✅ Liste des produits avec quantités
- ✅ Modifications de quantités (+/-)
- ✅ Indicateurs de stock faible
- ✅ Affichage des seuils

### 🎨 Interface
- ✅ Navigation par onglets (Tabs)
- ✅ Thème clair/sombre automatique
- ✅ Design responsive

## 🚀 Quick Start

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

Créez un fichier `.env.local` à la racine:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Obtenir vos clés: [Supabase Dashboard](https://supabase.com) > Settings > API

### 3. Configurer la Base de Données

1. Allez dans Supabase SQL Editor
2. Exécutez le contenu de `database-schema.sql`
3. Créez des utilisateurs de test dans Auth > Users

### 4. Démarrer l'app

```bash
npm start
```

Puis choisissez votre plateforme:
- **i** pour iOS
- **a** pour Android  
- **w** pour Web
- Ou scannez le QR code avec Expo Go

## 📁 Structure du Projet

```
src/
├── app/
│   ├── _layout.tsx           # Layout racine + auth control
│   ├── auth/
│   │   ├── _layout.tsx
│   │   ├── login.tsx         # Écran connexion
│   │   └── signup.tsx        # Écran inscription
│   └── (tabs)/
│       ├── _layout.tsx       # Navigation tabs
│       ├── index.tsx         # Écran stock
│       └── profile.tsx       # Écran profil
├── components/
│   ├── text-input.tsx        # Input réutilisable
│   ├── themed-*.tsx          # Composants thématisés
│   └── ...
├── contexts/
│   └── auth-context.tsx      # Gestion authentification
├── services/
│   └── supabase.ts           # Client Supabase
└── constants/
    └── theme.ts              # Thème & couleurs
```

## 🔧 Scripts

```bash
# Démarrage
npm start

# Reset du projet
npm run reset-project

# Android
npm run android

# iOS
npm run ios

# Web
npm run web

# Lint
npm run lint
```

## 📖 Documentation

- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Configuration détaillée de l'authentification
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Guide complet d'implémentation
- **[database-schema.sql](./database-schema.sql)** - Script SQL pour la DB

## 🧪 Utilisation

### Écran de Login

```
1. Naviguez vers l'écran de connexion
2. Entrez votre email et mot de passe
3. Vous serez redirigé vers l'accueil du stock
```

### Écran d'Inscription

```
1. Cliquez sur "S'inscrire"
2. Remplissez votre email
3. Définissez un mot de passe
4. Choisissez votre rôle
5. Confirmez pour créer le compte
```

### Gestion du Stock

- **Propriétaire/Employé** : Cliquez sur +/- pour modifier les quantités
- **Client** : Consulter le stock en lecture seule

### Profil

- Consultez votre email et rôle
- Accédez aux fonctions admin (si propriétaire)
- Déconnectez-vous

## 🔐 Sécurité

- ✅ Row Level Security (RLS) activée
- ✅ Authentification Supabase
- ✅ Sessions persistantes
- ✅ Clés API sécurisées

## 🌐 Ressources

- [Expo Docs](https://docs.expo.dev/versions/v55.0.0/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Expo Router](https://expo.dev/docs/routing/introduction/)

## 🐛 Troubleshooting

**Erreur de connexion ?**
→ Vérifiez `.env.local` et vos identifiants

**Session non persistée ?**
→ Vérifiez les cookies/localStorage du navigateur

**Images non affichées ?**
→ Créez le bucket `product-images` dans Supabase Storage

## 📝 Notes

- Expo Go sur LAN/IP (pas d'accès direct)
- Compatible Web, iOS, Android
- TypeScript + React 19
- Responsive design

## 🎉 Prêt à démarrer?

```bash
npm install && npm start
```

Bonne codification! 🚀

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
