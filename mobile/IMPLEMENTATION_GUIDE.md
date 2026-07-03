# 🚀 Guide d'Implémentation - Système d'Authentification MyDigitalSchool

## 📝 Résumé ce qui a été fait

Un système d'authentification complet avec Supabase a été intégré dans votre projet Expo avec gestion des trois rôles (owner, employee, customer).

### ✅ Composants Créés

#### 1. **Services** (`src/services/supabase.ts`)
- Client Supabase configuré
- `authService` avec méthodes:
  - `signup()` - Inscription avec rôle
  - `login()` - Connexion
  - `logout()` - Déconnexion
  - `getProfile()` - Récupérer profil utilisateur
  - `getCurrentUser()` - Utilisateur actuellement connecté
  - `onAuthStateChange()` - Abonnement aux changements d'auth

#### 2. **Authentification Context** (`src/contexts/auth-context.tsx`)
- `AuthProvider` - Wrapper autour de l'app
- `useAuth()` - Hook pour accéder à l'état d'authentification
- État fourni:
  - `user` - Données utilisateur Supabase
  - `profile` - Profil avec rôle
  - `isSignedIn` - Booléen connexion
  - `isLoading` - État de chargement
  - `error` - Erreurs
  - Méthodes: `login()`, `signup()`, `logout()`

#### 3. **Écrans d'Authentification**

**Login** (`src/app/auth/login.tsx`)
- Email et mot de passe
- Gestion des erreurs
- Lien vers inscription

**Signup** (`src/app/auth/signup.tsx`)
- Inscription avec choix du rôle
- Sélecteur visuel pour les 3 rôles
- Validation de mot de passe
- Confirmation du mot de passe

#### 4. **Écrans Protégés (Tabs)**

**Stock** (`src/app/tabs/index.tsx`)
- Liste des produits depuis Supabase
- Boutons +/- de quantité pour owner/employee
- Vue lecture seule pour customer
- Indicateur de stock faible

**Profil** (`src/app/tabs/profile.tsx`)
- Affichage email et rôle
- Bouton déconnexion
- Informations du rôle
- Bouton admin (owner uniquement)

#### 5. **Composants Réutilisables**

**TextInput** (`src/components/text-input.tsx`)
- Input avec label
- Gestion des erreurs
- Thème automatique

#### 6. **Navigation Restructurée**

**Root Layout** (`src/app/_layout.tsx`)
- `AuthProvider` au niveau racine
- Contrôle d'accès: `auth/*` ou `(tabs)/*`
- Affichage du splash screen pendant le chargement

**Auth Layout** (`src/app/auth/_layout.tsx`)
- Stack pour login/signup

**Tabs Layout** (`src/app/tabs/_layout.tsx`)
- NativeTabs avec icônes

### 📁 Structure du Projet

```
projet-mobile/
├── src/
│   ├── app/
│   │   ├── _layout.tsx          ← Root avec auth control
│   │   ├── auth/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx        ← Connexion
│   │   │   └── signup.tsx       ← Inscription
│   │   └── (tabs)/
│   │       ├── _layout.tsx      ← Navigation tabs
│   │       ├── index.tsx        ← Stock (protégé)
│   │       └── profile.tsx      ← Profil (protégé)
│   ├── components/
│   │   ├── text-input.tsx       ← Nouveau
│   │   ├── themed-*.tsx         ← Existants
│   │   └── ...
│   ├── contexts/
│   │   └── auth-context.tsx     ← Nouveau
│   └── services/
│       └── supabase.ts          ← Nouveau
├── .env.local                    ← Nouveau (à configurer)
├── AUTH_SETUP.md                 ← Nouveau (documentation)
├── database-schema.sql           ← Nouveau (script SQL)
└── ...
```

## 🔧 Configuration Requise

### 1. Variables d'Environnement

Créez `.env.local` à la racine:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Base de Données

Exécutez le contenu de `database-schema.sql` dans l'SQL Editor de Supabase:
- Crée les tables `profiles` et `products`
- Configure les triggers automatiques
- Active Row Level Security (RLS)
- Crée les politiques de sécurité

### 3. Storage (Optionnel)

Pour les images de produits:
1. Allez dans Supabase Dashboard > Storage
2. Créez un nouveau bucket `product-images`
3. Définissez-le comme Public

## 🎯 Comment Utiliser

### Installation

```bash
# Installer les dépendances
npm install

# ou avec yarn
yarn install
```

### Démarrage

```bash
# Mode développement
npm start

# Directement avec Expo Go
expo start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### Tester les Rôles

1. **Créer des utilisateurs de test dans Supabase Auth**

   Dashboard > Authentication > Users > Add User

2. **Ajouter des produits de test**

   Exécutez dans SQL Editor:
   ```sql
   INSERT INTO products (name, quantity, low_stock_threshold) VALUES
     ('Produit 1', 10, 3),
     ('Produit 2', 2, 5);
   ```

3. **Tester les trois flux**

   ```
   Utilisateur Owner:
   - Email: owner@example.com
   - Password: password123
   - Rôle: owner
   → Accès complet au stock
   
   Utilisateur Employee:
   - Email: employee@example.com
   - Password: password123
   - Rôle: employee
   → Gestion du stock
   
   Utilisateur Customer:
   - Email: customer@example.com
   - Password: password123
   - Rôle: customer
   → Consultation uniquement
   ```

## 🔐 Sécurité

### Row Level Security (RLS) Activé

Les données sont protégées au niveau base de données:
- **Owner**: Accès complet CRUD
- **Employee**: CRUD complet
- **Customer**: SELECT (lecture seule)

### Points de Sécurité

✅ Les clés Supabase exposées (ANON_KEY) sont correctes (usage public)
✅ RLS protège les données au niveau DB
✅ Pas de données sensibles en localStorage par défaut
✅ Supabase gère les sessions avec refresh tokens

## 🚀 Prochaines Étapes (Optionnel)

### Court Terme
- [ ] Écran de détail produit
- [ ] Ajout de nouveaux produits (owner/employee)
- [ ] Suppression de produits (owner)
- [ ] Téléchargement d'images de produits

### Moyen Terme
- [ ] Écran admin pour gérer les utilisateurs
- [ ] Système d'historique des modifications
- [ ] Notifications en temps réel avec Realtime
- [ ] Filtres de recherche

### Long Terme
- [ ] Synchronisation hors ligne
- [ ] Analytics et reporting
- [ ] Intégration avec système de facturation
- [ ] Mobile app iOS/Android compilée

## 📊 Architecture d'Authentification

```
┌─────────────────────────────────────┐
│         Supabase Backend            │
│  • Auth Service                     │
│  • PostgreSQL Database              │
│  • Storage (Bucket)                 │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│    src/services/supabase.ts         │
│  • createClient()                   │
│  • authService.login/signup         │
│  • authService.getProfile()         │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   src/contexts/auth-context.tsx     │
│  • AuthProvider (wrapper)           │
│  • useAuth() hook                   │
│  • State management                 │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│    src/app/_layout.tsx              │
│  • <AuthProvider>                   │
│  • Conditional routing              │
│  • auth/* vs (tabs)/*               │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
   ┌────────┐    ┌────────────┐
   │ auth/* │    │  (tabs)/*  │
   │ • Login │   │• Stock     │
   │ • Sign │    │• Profile   │
   └────────┘    └────────────┘
```

## 🐛 Troubleshooting

### Erreur: "Missing Supabase environment variables"

```
✓ Vérifiez .env.local existe
✓ Vérifiez les variables: EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY
✓ Redémarrez npm start
✓ Les variables doivent commencer par EXPO_PUBLIC_
```

### Session non persistée après refresh

```
✓ Supabase gère automatiquement les refresh tokens
✓ Vérifiez que localStorage n'est pas bloqué
✓ Essayez de vous reconnecter
```

### Erreur "User not found" au login

```
✓ Vérifiez que l'utilisateur existe dans Supabase Auth
✓ Vérifiez l'email exact (minuscules/majuscules)
✓ Vérifiez le mot de passe correct
```

### Images produit non chargées

```
✓ Assurez-vous que le bucket product-images existe
✓ Vérifiez que le bucket est PUBLIC
✓ Vérifiez les permissions RLS pour Storage
```

## 📚 Ressources Utiles

- [Expo v55 Docs](https://docs.expo.dev/versions/v55.0.0/)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Expo Router](https://expo.dev/docs/routing/introduction/)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

## ✨ Prochaines Étapes

1. Configurez vos variables d'environnement
2. Exécutez le script SQL sur Supabase
3. Installez les dépendances: `npm install`
4. Testez les écrans de login/signup
5. Testez les différents rôles

Bonne chance! 🎉
