# Configuration Authentication MyDigitalSchool

## 📋 Prérequis

1. Un projet Supabase créé sur https://supabase.com
2. Les variables d'environnement Supabase

## 🔧 Installation des dépendances

```bash
npm install
```

## 🌐 Configuration Supabase

### 1. Obtenir vos clés

1. Allez sur votre dashboard Supabase
2. Naviguez vers `Settings > API`
3. Copiez:
   - **SUPABASE_URL** (Project URL)
   - **SUPABASE_ANON_KEY** (anon/public key)

### 2. Ajouter au fichier `.env.local`

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ Important**: Les variables doivent commencer par `EXPO_PUBLIC_` pour être accessibles en client

### 3. Vérifier votre setup SQL

Votre base de données doit avoir ces tables:

```sql
-- Table profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('owner', 'employee', 'customer')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger pour créer automatiquement le profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Table products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 10,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Utilisation

### Architecture d'authentification

```
src/
├── services/
│   └── supabase.ts          # Client Supabase + services d'auth
├── contexts/
│   └── auth-context.tsx     # Context et hook useAuth
├── app/
│   ├── auth/
│   │   ├── login.tsx        # Écran de connexion
│   │   ├── signup.tsx       # Écran d'inscription
│   │   └── _layout.tsx      # Layout des écrans d'auth
│   ├── (tabs)/
│   │   ├── index.tsx        # Écran stock (protégé)
│   │   ├── profile.tsx      # Écran profil (protégé)
│   │   └── _layout.tsx      # Layout des tabs
│   └── _layout.tsx          # Layout principal + navigation
```

### Utiliser l'authentification

```typescript
import { useAuth } from '@/contexts/auth-context';

export default function MyComponent() {
  const { user, profile, isSignedIn, login, signup, logout } = useAuth();

  // Accès aux données utilisateur
  if (!isSignedIn) return <Text>Non connecté</Text>;

  return (
    <Text>
      Connecté: {profile?.email} ({profile?.role})
    </Text>
  );
}
```

## 👥 Rôles utilisateurs

### Owner (Propriétaire)
- ✅ Accès complet au stock
- ✅ Modification des produits (+/- quantités)
- ✅ Gestion des utilisateurs (à venir)

### Employee (Employé)
- ✅ Gestion du stock
- ✅ Modification des produits
- ❌ Pas d'accès admin

### Customer (Client)
- ✅ Consultation du stock
- ❌ Pas de modification
- ❌ Vue lecture seule

## 🔐 Sécurité

### Row Level Security (RLS)

À implémenter dans Supabase:

```sql
-- Politiques d'accès pour la table products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Owner: accès complet
CREATE POLICY "Owner full access"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Employee: accès complet
CREATE POLICY "Employee full access"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'employee'
    )
  );

-- Customer: lecture seule
CREATE POLICY "Customer read only"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'customer'
    )
  );
```

## 🧪 Tester l'application

```bash
# Installation des dépendances
npm install

# Démarrer l'application
npm start

# Ou directement avec Expo Go
expo start

# Test avec des comptes:
Email: test-owner@example.com
Password: password123
Role: owner

Email: test-employee@example.com
Password: password123
Role: employee

Email: test-customer@example.com
Password: password123
Role: customer
```

## 🐛 Troubleshooting

### Erreur: "Missing Supabase environment variables"
- Vérifiez que `.env.local` existe dans la racine du projet
- Vérifiez les variables `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Redémarrez le serveur Expo après modification

### Session non persistée
- Assurez-vous que Supabase Auth est activé dans votre projet
- Vérifiez que les politiques RLS ne bloquent pas l'accès

### Images produit non chargées
- Vérifiez que le bucket `product-images` existe en public dans Supabase Storage
- Vérifiez les permissions du bucket

## 📚 Ressources

- [Expo v55 Docs](https://docs.expo.dev/versions/v55.0.0/)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Expo Router Docs](https://expo.dev/docs/routing/introduction/)
