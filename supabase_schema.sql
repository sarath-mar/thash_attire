-- ==========================================
-- THASH ATTIRE - SUPABASE SCHEMA
-- ==========================================
-- Run this entire script in your Supabase SQL Editor.
-- It will create all necessary tables and policies.

-- 1. Enable UUID Extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean up existing tables if you are starting fresh
-- DROP TABLE IF EXISTS sales CASCADE;
-- DROP TABLE IF EXISTS expenses CASCADE;
-- DROP TABLE IF EXISTS banners CASCADE;
-- DROP TABLE IF EXISTS product_materials CASCADE;
-- DROP TABLE IF EXISTS material_purchases CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS materials CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;

-- ==========================================
-- TABLES
-- ==========================================

-- CATEGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MATERIALS
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('product', 'common')),
  supplier TEXT,
  stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_stock_level NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  avg_unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT MATERIALS (Junction table)
CREATE TABLE product_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity_required NUMERIC(10, 2) NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MATERIAL PURCHASES
CREATE TABLE material_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  total_amount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALES / ORDERS
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  customer_name TEXT,     -- Stored for easy reporting
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT,      -- Stored for easy reporting
  quantity INTEGER NOT NULL DEFAULT 1,
  selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  final_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'order_received',
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  expected_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  shipping_address TEXT,
  notes TEXT,
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPENSES
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANNERS
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  display_order INTEGER DEFAULT 1,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to update the `updated_at` column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Assuming only Admins can access these tables through the application
-- If this is a purely admin dashboard, we can enable RLS and allow all authenticated users, 
-- or disable RLS if the API is only accessed server-side (not recommended).
-- We'll enable RLS and create a simple policy allowing authenticated users.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform all operations
CREATE POLICY "Allow authenticated users full access to categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to materials" ON materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to product_materials" ON product_materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to material_purchases" ON material_purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to sales" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to expenses" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to banners" ON banners FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- For products and banners, we might want public READ access if they are displayed on the public storefront.
CREATE POLICY "Allow public read access to active products" ON products FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Allow public read access to active banners" ON banners FOR SELECT TO anon USING (status = 'active');
