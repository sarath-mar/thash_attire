-- ============================================================
-- Thash Attire — Supabase Schema (source of truth)
-- ============================================================
-- Run this file in the Supabase SQL Editor for a fresh install.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles (extends Supabase Auth) ───────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Categories ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Products ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  stitching_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  packaging_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  other_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  target_margin NUMERIC(5, 2) NOT NULL DEFAULT 40,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'out_of_stock', 'draft', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  is_showcase BOOLEAN NOT NULL DEFAULT TRUE,
  showcase_stitching_cost NUMERIC(10, 2),
  initial_sample_created BOOLEAN NOT NULL DEFAULT FALSE,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Materials ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'product' CHECK (type IN ('product', 'common')),
  supplier TEXT,
  stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_stock_level NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'meter'
    CHECK (unit IN ('meter', 'piece', 'kg', 'roll', 'yard')),
  avg_unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Product Materials (BOM) ────────────────────────────────
CREATE TABLE IF NOT EXISTS product_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity_required NUMERIC(10, 2) NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, material_id)
);

-- ─── Material Purchases ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS material_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT,
  unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Material Stock Movements ───────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_reason') THEN
    CREATE TYPE movement_reason AS ENUM (
      'PURCHASE',
      'PRODUCTION',
      'ADJUSTMENT',
      'INITIAL_SHOWCASE_SAMPLE'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS material_stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity NUMERIC(10, 2) NOT NULL,
  reason movement_reason NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Product Samples (showcase) ─────────────────────────────
CREATE TABLE IF NOT EXISTS product_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  material_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  showcase_stitching_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  other_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Customers ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  total_amount NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Offers / Combos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  offer_type TEXT NOT NULL DEFAULT 'COMBO' CHECK (offer_type IN ('COMBO')),
  offer_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Sales / Orders ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  customer_name TEXT,
  customer_phone TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  quantity INTEGER,
  selling_price NUMERIC(10, 2),
  discount NUMERIC(10, 2) DEFAULT 0,
  final_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash'
    CHECK (payment_method IS NULL OR payment_method IN ('cash', 'upi', 'card', 'bank_transfer')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
  -- Supports both sale statuses and order workflow statuses used by the app
  status TEXT DEFAULT 'order_received',
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  order_date TIMESTAMPTZ DEFAULT NOW(),
  expected_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  shipping_address TEXT,
  notes TEXT,
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Expenses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Banners ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  display_order INTEGER DEFAULT 1,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Settings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(is_trending);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);
CREATE INDEX IF NOT EXISTS idx_material_purchases_material ON material_purchases(material_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_offer ON sales(offer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);

-- ─── updated_at helper ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_offers_updated_at ON offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_offer_items_updated_at ON offer_items;
CREATE TRIGGER update_offer_items_updated_at
  BEFORE UPDATE ON offer_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_banners_updated_at ON banners;
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Auto-create profile on signup ──────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── RPC: record material purchase (weighted avg) ───────────
CREATE OR REPLACE FUNCTION record_material_purchase(
  p_material_id UUID,
  p_quantity NUMERIC,
  p_unit_cost NUMERIC,
  p_total_amount NUMERIC,
  p_purchase_date TIMESTAMPTZ,
  p_supplier TEXT DEFAULT NULL,
  p_unit TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_purchase_id UUID;
  v_current_stock NUMERIC;
  v_current_avg NUMERIC;
  v_new_avg NUMERIC;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Purchase quantity must be greater than 0';
  END IF;

  SELECT stock, avg_unit_cost INTO v_current_stock, v_current_avg
  FROM materials WHERE id = p_material_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Material not found';
  END IF;

  v_current_stock := COALESCE(v_current_stock, 0);
  v_current_avg := COALESCE(v_current_avg, 0);

  IF (v_current_stock + p_quantity) > 0 THEN
    v_new_avg := ((v_current_stock * v_current_avg) + (p_quantity * p_unit_cost))
                 / (v_current_stock + p_quantity);
  ELSE
    v_new_avg := p_unit_cost;
  END IF;

  UPDATE materials
  SET
    stock = v_current_stock + p_quantity,
    avg_unit_cost = ROUND(v_new_avg, 2),
    updated_at = NOW()
  WHERE id = p_material_id;

  INSERT INTO material_purchases (
    material_id, quantity, unit_cost, total_amount,
    purchase_date, supplier, unit, notes
  ) VALUES (
    p_material_id, p_quantity, p_unit_cost, p_total_amount,
    p_purchase_date, p_supplier, p_unit, p_notes
  ) RETURNING id INTO v_purchase_id;

  RETURN jsonb_build_object('id', v_purchase_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── RPC: delete material purchase (reverse stock + avg) ────
CREATE OR REPLACE FUNCTION delete_material_purchase(
  p_purchase_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_material_id UUID;
  v_quantity NUMERIC;
  v_unit_cost NUMERIC;
  v_current_stock NUMERIC;
  v_current_avg NUMERIC;
  v_new_stock NUMERIC;
  v_new_avg NUMERIC;
BEGIN
  SELECT material_id, quantity, unit_cost
  INTO v_material_id, v_quantity, v_unit_cost
  FROM material_purchases
  WHERE id = p_purchase_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase not found';
  END IF;

  SELECT stock, avg_unit_cost INTO v_current_stock, v_current_avg
  FROM materials WHERE id = v_material_id FOR UPDATE;

  v_current_stock := COALESCE(v_current_stock, 0);
  v_current_avg := COALESCE(v_current_avg, 0);
  v_new_stock := v_current_stock - COALESCE(v_quantity, 0);

  IF v_new_stock < 0 THEN
    RAISE EXCEPTION 'Cannot delete purchase: would result in negative stock (current %, purchase %)',
      v_current_stock, v_quantity;
  END IF;

  IF v_new_stock > 0 THEN
    v_new_avg := ((v_current_stock * v_current_avg) - (v_quantity * v_unit_cost)) / v_new_stock;
    IF v_new_avg < 0 THEN
      v_new_avg := 0;
    END IF;
  ELSE
    v_new_avg := 0;
  END IF;

  UPDATE materials
  SET
    stock = v_new_stock,
    avg_unit_cost = ROUND(v_new_avg, 2),
    updated_at = NOW()
  WHERE id = v_material_id;

  DELETE FROM material_purchases WHERE id = p_purchase_id;

  RETURN jsonb_build_object(
    'id', p_purchase_id,
    'material_id', v_material_id,
    'new_stock', v_new_stock,
    'new_avg_unit_cost', ROUND(v_new_avg, 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── RPC: create product + optional showcase sample ─────────
CREATE OR REPLACE FUNCTION create_product_with_sample(
  p_product JSONB,
  p_materials JSONB,
  p_create_sample BOOLEAN,
  p_showcase_stitching_cost NUMERIC
) RETURNS UUID AS $$
DECLARE
  v_product_id UUID;
  v_material JSONB;
  v_available_stock NUMERIC;
  v_avg_unit_cost NUMERIC;
  v_total_material_cost NUMERIC := 0;
  v_required_qty NUMERIC;
  v_colors TEXT[];
  v_sizes TEXT[];
  v_images TEXT[];
  v_videos TEXT[];
BEGIN
  IF p_product->'colors' IS NOT NULL THEN
    v_colors := ARRAY(SELECT jsonb_array_elements_text(p_product->'colors'));
  ELSE
    v_colors := '{}';
  END IF;

  IF p_product->'sizes' IS NOT NULL THEN
    v_sizes := ARRAY(SELECT jsonb_array_elements_text(p_product->'sizes'));
  ELSE
    v_sizes := '{}';
  END IF;

  IF p_product->'images' IS NOT NULL THEN
    v_images := ARRAY(SELECT jsonb_array_elements_text(p_product->'images'));
  ELSE
    v_images := '{}';
  END IF;

  IF p_product->'videos' IS NOT NULL THEN
    v_videos := ARRAY(SELECT jsonb_array_elements_text(p_product->'videos'));
  ELSE
    v_videos := '{}';
  END IF;

  INSERT INTO products (
    name, sku, description, category_id, selling_price, cost_price,
    stock, status, is_featured, is_trending, sizes, colors, images, videos,
    is_showcase, showcase_stitching_cost, initial_sample_created,
    stitching_cost, packaging_cost, other_cost, low_stock_threshold, target_margin
  ) VALUES (
    p_product->>'name',
    p_product->>'sku',
    p_product->>'description',
    (p_product->>'category_id')::UUID,
    COALESCE((p_product->>'selling_price')::NUMERIC, 0),
    COALESCE((p_product->>'cost_price')::NUMERIC, 0),
    COALESCE((p_product->>'stock')::INTEGER, 0),
    COALESCE(p_product->>'status', 'active'),
    COALESCE((p_product->>'is_featured')::BOOLEAN, false),
    COALESCE((p_product->>'is_trending')::BOOLEAN, false),
    v_sizes,
    v_colors,
    v_images,
    v_videos,
    COALESCE((p_product->>'is_showcase')::BOOLEAN, TRUE),
    p_showcase_stitching_cost,
    p_create_sample,
    COALESCE((p_product->>'stitching_cost')::NUMERIC, 0),
    COALESCE((p_product->>'packaging_cost')::NUMERIC, 0),
    COALESCE((p_product->>'other_cost')::NUMERIC, 0),
    COALESCE((p_product->>'low_stock_threshold')::INTEGER, 5),
    COALESCE((p_product->>'target_margin')::NUMERIC, 40)
  ) RETURNING id INTO v_product_id;

  IF p_materials IS NOT NULL THEN
    FOR v_material IN SELECT * FROM jsonb_array_elements(p_materials)
    LOOP
      v_required_qty := COALESCE((v_material->>'quantity')::NUMERIC, 0);

      INSERT INTO product_materials (product_id, material_id, quantity_required)
      VALUES (v_product_id, (v_material->>'material_id')::UUID, v_required_qty);

      IF p_create_sample THEN
        SELECT stock, avg_unit_cost INTO v_available_stock, v_avg_unit_cost
        FROM materials
        WHERE id = (v_material->>'material_id')::UUID FOR UPDATE;

        IF v_available_stock < v_required_qty THEN
          RAISE EXCEPTION 'Insufficient stock for material ID %', v_material->>'material_id';
        END IF;

        UPDATE materials
        SET stock = stock - v_required_qty,
            updated_at = NOW()
        WHERE id = (v_material->>'material_id')::UUID;

        INSERT INTO material_stock_movements (material_id, quantity, reason, reference_id)
        VALUES (
          (v_material->>'material_id')::UUID,
          -v_required_qty,
          'INITIAL_SHOWCASE_SAMPLE',
          v_product_id
        );

        v_total_material_cost := v_total_material_cost
          + (v_required_qty * COALESCE(v_avg_unit_cost, 0));
      END IF;
    END LOOP;
  END IF;

  IF p_create_sample THEN
    INSERT INTO product_samples (
      product_id, material_cost, showcase_stitching_cost, other_cost, total_cost
    ) VALUES (
      v_product_id,
      v_total_material_cost,
      COALESCE(p_showcase_stitching_cost, 0),
      COALESCE((p_product->>'other_cost')::NUMERIC, 0),
      v_total_material_cost
        + COALESCE(p_showcase_stitching_cost, 0)
        + COALESCE((p_product->>'other_cost')::NUMERIC, 0)
    );
  END IF;

  RETURN v_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── RPC: create sale + items + stock deduct ────────────────
CREATE OR REPLACE FUNCTION create_sale_transaction(
  p_sale JSONB,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_current_stock INTEGER;
BEGIN
  INSERT INTO sales (
    order_number, customer_id, customer_name, customer_phone, offer_id,
    discount, final_amount, payment_method, payment_status,
    status, sale_date, order_date, expected_delivery, shipping_address, notes
  ) VALUES (
    p_sale->>'order_number',
    (p_sale->>'customer_id')::UUID,
    p_sale->>'customer_name',
    p_sale->>'customer_phone',
    CASE WHEN p_sale->>'offer_id' IS NULL THEN NULL ELSE (p_sale->>'offer_id')::UUID END,
    COALESCE((p_sale->>'discount')::NUMERIC, 0),
    COALESCE((p_sale->>'final_amount')::NUMERIC, 0),
    p_sale->>'payment_method',
    COALESCE(p_sale->>'payment_status', 'pending'),
    COALESCE(p_sale->>'status', 'order_received'),
    COALESCE((p_sale->>'sale_date')::TIMESTAMPTZ, NOW()),
    COALESCE((p_sale->>'order_date')::TIMESTAMPTZ, NOW()),
    CASE
      WHEN p_sale->>'expected_delivery' IS NULL THEN NULL
      ELSE (p_sale->>'expected_delivery')::TIMESTAMPTZ
    END,
    p_sale->>'shipping_address',
    p_sale->>'notes'
  ) RETURNING id INTO v_sale_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT stock INTO v_current_stock
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF v_current_stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for product %', (v_item->>'product_id');
    END IF;

    INSERT INTO sale_items (
      sale_id, offer_id, product_id, product_name, quantity, selling_price, cost_price
    ) VALUES (
      v_sale_id,
      CASE WHEN v_item->>'offer_id' IS NULL THEN NULL ELSE (v_item->>'offer_id')::UUID END,
      (v_item->>'product_id')::UUID,
      v_item->>'product_name',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'selling_price')::NUMERIC,
      COALESCE((v_item->>'cost_price')::NUMERIC, 0)
    );

    UPDATE products
    SET stock = stock - (v_item->>'quantity')::INTEGER,
        updated_at = NOW()
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;

  RETURN jsonb_build_object('id', v_sale_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Row Level Security ─────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public storefront reads
CREATE POLICY "Public read active products" ON products
  FOR SELECT TO anon, authenticated
  USING (status = 'active' AND COALESCE(is_showcase, false) = false);

CREATE POLICY "Public read categories" ON categories
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Public read active banners" ON banners
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Public read active offers" ON offers
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Public read offer items" ON offer_items
  FOR SELECT TO anon, authenticated
  USING (true);

-- Authenticated admin app access (login-gated in the Nuxt app)
CREATE POLICY "Authenticated full access categories" ON categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access products" ON products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access materials" ON materials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access product_materials" ON product_materials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access material_purchases" ON material_purchases
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access material_stock_movements" ON material_stock_movements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access product_samples" ON product_samples
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access customers" ON customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access offers" ON offers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access offer_items" ON offer_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access sales" ON sales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access sale_items" ON sale_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access expenses" ON expenses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access banners" ON banners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access settings" ON settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated manage profiles" ON profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Storage buckets (run if needed) ────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-videos', 'product-videos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

-- After first admin signup:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
