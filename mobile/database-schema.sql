-- ============================================================================
-- MyDigitalSchool Authentication & Stock Management Schema
-- ============================================================================

-- STEP 1: Create profiles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('owner', 'employee', 'customer')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================================
-- STEP 2: Create trigger for automatic profile creation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- STEP 3: Create products table
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INT DEFAULT 10,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity);

-- ============================================================================
-- STEP 4: Enable Row Level Security (RLS)
-- ============================================================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Owner can view all profiles" ON profiles;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Owner can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Products RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Owner full access" ON products;
DROP POLICY IF EXISTS "Employee full access" ON products;
DROP POLICY IF EXISTS "Customer read only" ON products;

-- Policies for products
CREATE POLICY "Owner full access"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Employee full access"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'employee'
    )
  );

CREATE POLICY "Customer read only"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'customer'
    )
  );

-- ============================================================================
-- STEP 5: Create Storage bucket for product images (run in dashboard)
-- ============================================================================
-- 
-- Note: Run this in the Supabase dashboard under "Storage"
-- Create a new bucket named "product-images" and set it to Public
-- 

-- ============================================================================
-- STEP 6: Test data (optional)
-- ============================================================================
-- 
-- You can manually create test users through the Supabase Auth UI
-- or run these SQL commands to create test data
--
-- Example products:
--

INSERT INTO products (name, quantity, low_stock_threshold) VALUES
  ('Laptop Dell XPS', 5, 2),
  ('Monitor LG 27"', 12, 3),
  ('Keyboard Mécanique', 25, 10),
  ('Souris Logitech', 18, 5),
  ('Casque Bose', 3, 2)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Setup Complete!
-- ============================================================================
-- Your database is now ready. Follow these steps:
-- 
-- 1. Create test users in Supabase Auth dashboard
-- 2. Update their role in the profiles table if needed
-- 3. Configure environment variables in .env.local
-- 4. Run: npm install
-- 5. Run: npm start
