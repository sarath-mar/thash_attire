-- ============================================================
-- Thash Attire — Supabase Schema (source of truth)
-- ============================================================
-- Run this file in the Supabase SQL Editor for a fresh install.
-- Existing projects: run supabase/customer_auth.sql instead.
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
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT UNIQUE,
  address TEXT,
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  total_amount NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_lower
  ON customers (lower(email))
  WHERE email IS NOT NULL;

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
  payment_date TIMESTAMPTZ,
  transaction_id TEXT,
  payment_app TEXT
    CHECK (payment_app IS NULL OR payment_app IN ('google_pay', 'phonepe', 'paytm', 'bhim', 'other')),
  status_history JSONB DEFAULT '[]'::jsonb,
  stock_deducted BOOLEAN NOT NULL DEFAULT false,
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
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  display_order INTEGER DEFAULT 1,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Reviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  city TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
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

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Existing admin users have no account_type claim and keep full staff access.
-- New auth users are marked as storefront customers. Promote a real admin with:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND (
      public.is_admin()
      OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'account_type', '') IS DISTINCT FROM 'customer'
    );
$$;

CREATE OR REPLACE FUNCTION public.mark_storefront_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.raw_app_meta_data :=
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('account_type', 'customer');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mark_storefront_customer ON auth.users;
CREATE TRIGGER mark_storefront_customer
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.mark_storefront_customer();

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Cannot change role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_escalation ON profiles;
CREATE TRIGGER prevent_profile_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

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
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

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
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

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
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

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

-- ─── Stock is reduced only after payment is recorded ────────
CREATE OR REPLACE FUNCTION public.deduct_sale_stock(p_sale_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_stock INTEGER;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity, product_name
    FROM sale_items
    WHERE sale_id = p_sale_id
    ORDER BY product_id
  LOOP
    IF v_item.product_id IS NULL THEN
      CONTINUE;
    END IF;

    SELECT stock INTO v_stock
    FROM products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND OR COALESCE(v_stock, 0) < COALESCE(v_item.quantity, 0) THEN
      RAISE EXCEPTION 'Insufficient stock for %', COALESCE(v_item.product_name, 'a product in this order');
    END IF;

    UPDATE products
    SET stock = stock - COALESCE(v_item.quantity, 0),
        updated_at = NOW()
    WHERE id = v_item.product_id;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.deduct_sale_stock(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.deduct_sale_stock(UUID) FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_sale_payment(
  p_sale_id UUID,
  p_method TEXT,
  p_payment_date TIMESTAMPTZ,
  p_transaction_id TEXT,
  p_payment_app TEXT,
  p_status TEXT,
  p_status_history JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale sales%ROWTYPE;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_sale FROM sales WHERE id = p_sale_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_sale.status = 'cancelled' THEN
    RAISE EXCEPTION 'This order is cancelled';
  END IF;

  IF NOT COALESCE(v_sale.stock_deducted, false) THEN
    PERFORM public.deduct_sale_stock(p_sale_id);
  END IF;

  UPDATE sales
  SET
    payment_status = 'paid',
    payment_method = COALESCE(p_method, payment_method),
    payment_date = COALESCE(p_payment_date, NOW()),
    transaction_id = NULLIF(trim(COALESCE(p_transaction_id, '')), ''),
    payment_app = NULLIF(p_payment_app, ''),
    status = COALESCE(NULLIF(p_status, ''), status),
    status_history = COALESCE(p_status_history, status_history),
    stock_deducted = true,
    updated_at = NOW()
  WHERE id = p_sale_id;

  RETURN jsonb_build_object('id', p_sale_id);
END;
$$;

REVOKE ALL ON FUNCTION public.record_sale_payment(UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_sale_payment(UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- ─── RPC: create sale + items. Stock drops only when paid ──
CREATE OR REPLACE FUNCTION create_sale_transaction(
  p_sale JSONB,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_paid BOOLEAN;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_paid := COALESCE(p_sale->>'payment_status', 'pending') = 'paid';

  INSERT INTO sales (
    order_number, customer_id, customer_name, customer_phone, offer_id,
    discount, final_amount, payment_method, payment_status,
    status, sale_date, order_date, expected_delivery, shipping_address, notes,
    stock_deducted
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
    p_sale->>'notes',
    v_paid
  ) RETURNING id INTO v_sale_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
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
  END LOOP;

  IF v_paid THEN
    PERFORM public.deduct_sale_stock(v_sale_id);
  END IF;

  RETURN jsonb_build_object('id', v_sale_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Customer profile + storefront orders ───────────────────
CREATE OR REPLACE FUNCTION public.prevent_customer_account_relink()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
    IF NOT (
      auth.uid() IS NULL
      OR public.is_admin()
      OR NEW.auth_user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Cannot change account link';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_customer_account_relink ON customers;
CREATE TRIGGER prevent_customer_account_relink
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION public.prevent_customer_account_relink();

CREATE OR REPLACE FUNCTION public.upsert_my_customer_profile(
  p_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL
) RETURNS customers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT;
  v_phone TEXT;
  v_row customers;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Please sign in to continue';
  END IF;

  v_email := NULLIF(lower(trim(COALESCE(p_email, auth.jwt() ->> 'email', ''))), '');
  v_phone := NULLIF(regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g'), '');
  IF v_phone IS NOT NULL AND length(v_phone) >= 10 THEN
    v_phone := right(v_phone, 10);
  END IF;
  IF v_phone IS NOT NULL AND v_phone !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Enter a valid 10-digit mobile number';
  END IF;

  SELECT * INTO v_row FROM customers WHERE auth_user_id = v_uid LIMIT 1;

  IF NOT FOUND AND v_email IS NOT NULL THEN
    SELECT * INTO v_row
    FROM customers
    WHERE email IS NOT NULL
      AND lower(email) = v_email
      AND (auth_user_id IS NULL OR auth_user_id = v_uid)
    ORDER BY created_at
    LIMIT 1;
  END IF;

  IF NOT FOUND AND v_phone IS NOT NULL THEN
    SELECT * INTO v_row
    FROM customers
    WHERE phone IS NOT NULL
      AND right(regexp_replace(phone, '\D', '', 'g'), 10) = v_phone
      AND (auth_user_id IS NULL OR auth_user_id = v_uid)
    ORDER BY created_at
    LIMIT 1;
  END IF;

  IF v_phone IS NOT NULL AND EXISTS (
    SELECT 1 FROM customers
    WHERE phone IS NOT NULL
      AND right(regexp_replace(phone, '\D', '', 'g'), 10) = v_phone
      AND (v_row.id IS NULL OR id <> v_row.id)
      AND (auth_user_id IS NULL OR auth_user_id <> v_uid)
  ) THEN
    RAISE EXCEPTION 'This mobile number is already used by another customer';
  END IF;

  IF v_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM customers
    WHERE email IS NOT NULL
      AND lower(email) = v_email
      AND auth_user_id IS NOT NULL
      AND auth_user_id <> v_uid
      AND (v_row.id IS NULL OR id <> v_row.id)
  ) THEN
    RAISE EXCEPTION 'This email is already linked to another customer';
  END IF;

  IF v_row.id IS NOT NULL THEN
    UPDATE customers
    SET
      auth_user_id = v_uid,
      name = COALESCE(NULLIF(trim(p_name), ''), name),
      email = COALESCE(v_email, email),
      phone = COALESCE(v_phone, phone),
      address = COALESCE(NULLIF(trim(p_address), ''), address),
      updated_at = NOW()
    WHERE id = v_row.id
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO customers (auth_user_id, name, email, phone, address)
    VALUES (
      v_uid,
      COALESCE(NULLIF(trim(p_name), ''), NULLIF(split_part(COALESCE(v_email, ''), '@', 1), ''), 'Customer'),
      v_email,
      v_phone,
      NULLIF(trim(COALESCE(p_address, '')), '')
    )
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

DROP FUNCTION IF EXISTS public.place_customer_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.place_customer_order(
  p_items JSONB,
  p_shipping_address TEXT,
  p_payment_method TEXT,
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_offer_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_customer customers;
  v_item JSONB;
  v_product products;
  v_qty INTEGER;
  v_sale_id UUID;
  v_order_number TEXT;
  v_final NUMERIC := 0;
  v_first_product_id UUID;
  v_first_price NUMERIC;
  v_total_qty INTEGER := 0;
  v_names TEXT[] := '{}';
  v_size TEXT;
  v_color TEXT;
  v_label TEXT;
  v_summary TEXT;
  v_offer offers%ROWTYPE;
  v_discount NUMERIC := 0;
  v_expected INTEGER := 0;
  v_got INTEGER := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Please sign in to place an order';
  END IF;

  IF p_shipping_address IS NULL OR length(trim(p_shipping_address)) < 8 THEN
    RAISE EXCEPTION 'Please enter a complete shipping address';
  END IF;

  IF p_payment_method NOT IN ('cash', 'upi') THEN
    RAISE EXCEPTION 'Please choose a valid payment method';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your bag is empty';
  END IF;

  v_customer := public.upsert_my_customer_profile(p_name, NULL, p_phone, p_shipping_address);

  IF v_customer.phone IS NULL OR v_customer.phone = '' THEN
    RAISE EXCEPTION 'Please add a mobile number to continue';
  END IF;

  LOOP
    v_order_number := 'TA'
      || to_char(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYMMDD')
      || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM sales WHERE order_number = v_order_number);
  END LOOP;

  INSERT INTO sales (
    order_number, customer_id, customer_name, customer_phone,
    discount, final_amount, payment_method, payment_status,
    status, sale_date, order_date, expected_delivery, shipping_address, notes, status_history
  ) VALUES (
    v_order_number,
    v_customer.id,
    v_customer.name,
    v_customer.phone,
    0,
    0,
    p_payment_method,
    'pending',
    'order_received',
    NOW(),
    NOW(),
    NOW() + INTERVAL '5 days',
    trim(p_shipping_address),
    NULLIF(trim(COALESCE(p_notes, '')), ''),
    jsonb_build_array(jsonb_build_object('status', 'order_received', 'date', NOW()))
  ) RETURNING id INTO v_sale_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF (v_item->>'product_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      RAISE EXCEPTION 'A piece in your bag is no longer available';
    END IF;

    v_qty := COALESCE((v_item->>'quantity')::INTEGER, 0);
    IF v_qty < 1 OR v_qty > 20 THEN
      RAISE EXCEPTION 'Quantity must be between 1 and 20';
    END IF;

    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND
       OR v_product.status IS DISTINCT FROM 'active'
       OR COALESCE(v_product.is_showcase, false) THEN
      RAISE EXCEPTION 'A piece in your bag is no longer available';
    END IF;

    v_size := NULLIF(trim(COALESCE(v_item->>'size', '')), '');
    v_color := NULLIF(trim(COALESCE(v_item->>'color', '')), '');
    v_label := v_product.name;
    IF v_color IS NOT NULL OR v_size IS NOT NULL THEN
      v_label := v_label || ' (' || concat_ws(', ', v_color, v_size) || ')';
    END IF;

    IF v_first_product_id IS NULL THEN
      v_first_product_id := v_product.id;
      v_first_price := v_product.selling_price;
    END IF;

    v_names := array_append(v_names, v_label);
    v_total_qty := v_total_qty + v_qty;
    v_final := v_final + (COALESCE(v_product.selling_price, 0) * v_qty);

    INSERT INTO sale_items (
      sale_id, product_id, product_name, quantity, selling_price, cost_price
    ) VALUES (
      v_sale_id,
      v_product.id,
      v_label,
      v_qty,
      COALESCE(v_product.selling_price, 0),
      COALESCE(v_product.cost_price, 0)
    );

  END LOOP;

  IF p_offer_id IS NOT NULL THEN
    SELECT * INTO v_offer
    FROM offers
    WHERE id = p_offer_id
      AND status = 'active'
      AND (start_date IS NULL OR start_date <= NOW())
      AND (end_date IS NULL OR end_date >= NOW());

    IF NOT FOUND THEN
      RAISE EXCEPTION 'This offer is no longer available';
    END IF;

    SELECT COUNT(*) INTO v_expected FROM offer_items WHERE offer_id = p_offer_id;
    SELECT COUNT(*) INTO v_got FROM jsonb_array_elements(p_items);

    IF v_expected <> v_got OR v_expected = 0 THEN
      RAISE EXCEPTION 'This offer is no longer available';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM offer_items oi
      WHERE oi.offer_id = p_offer_id
        AND NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(p_items) AS cart
          WHERE (cart->>'product_id')::uuid = oi.product_id
            AND COALESCE((cart->>'quantity')::int, 0) = oi.quantity
        )
    ) THEN
      RAISE EXCEPTION 'This offer is no longer available';
    END IF;

    v_discount := GREATEST(v_final - COALESCE(v_offer.offer_price, 0), 0);
    v_final := COALESCE(v_offer.offer_price, v_final);
  END IF;

  IF array_length(v_names, 1) > 1 THEN
    v_summary := v_names[1] || ' + ' || (array_length(v_names, 1) - 1)::TEXT || ' more';
  ELSE
    v_summary := v_names[1];
  END IF;

  UPDATE sales
  SET
    product_id = v_first_product_id,
    product_name = v_summary,
    quantity = v_total_qty,
    selling_price = v_first_price,
    discount = v_discount,
    offer_id = p_offer_id,
    final_amount = v_final,
    updated_at = NOW()
  WHERE id = v_sale_id;

  UPDATE customers
  SET
    total_orders = COALESCE(total_orders, 0) + 1,
    total_amount = COALESCE(total_amount, 0) + v_final,
    updated_at = NOW()
  WHERE id = v_customer.id;

  RETURN jsonb_build_object(
    'id', v_sale_id,
    'order_number', v_order_number,
    'final_amount', v_final
  );
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_my_customer_profile(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_my_customer_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.place_customer_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_customer_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

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
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Public read active reviews" ON reviews
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Public read active offers" ON offers
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Public read offer items" ON offer_items
  FOR SELECT TO anon, authenticated
  USING (true);

-- Staff access keeps the admin panel working for existing admin sessions.
-- Storefront customers only receive the own-row policies below.
CREATE POLICY "Staff manage categories" ON categories
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage products" ON products
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage materials" ON materials
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage product_materials" ON product_materials
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage material_purchases" ON material_purchases
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage material_stock_movements" ON material_stock_movements
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage product_samples" ON product_samples
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage customers" ON customers
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Customers read own profile" ON customers
  FOR SELECT TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "Customers update own profile" ON customers
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "Staff manage offers" ON offers
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage offer_items" ON offer_items
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage sales" ON sales
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Customers read own orders" ON sales
  FOR SELECT TO authenticated
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "Staff manage sale_items" ON sale_items
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Customers read own sale items" ON sale_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM sales s
      JOIN customers c ON c.id = s.customer_id
      WHERE s.id = sale_items.sale_id
        AND c.auth_user_id = auth.uid()
    )
  );
CREATE POLICY "Staff manage expenses" ON expenses
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage banners" ON banners
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage reviews" ON reviews
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff manage settings" ON settings
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff manage profiles" ON profiles
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ─── Storage buckets (run if needed) ────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-videos', 'product-videos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

-- After first admin signup:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
