-- ============================================================
-- Thash Attire — customer authentication upgrade
-- ============================================================
-- Run this once in the Supabase SQL Editor on an existing project.
-- Safe to re-run.
--
-- Also enable in Authentication:
--   Email provider (passwordless OTP / magic link)
--   Google provider
-- Redirect URLs:
--   http://localhost:3000/auth/callback
--   your production origin + /auth/callback
-- The email template must include {{ .Token }} so customers can enter the code.
-- ============================================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_auth_user_id_key'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_auth_user_id_key UNIQUE (auth_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_auth_user_id_fkey'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_lower
  ON customers (lower(email))
  WHERE email IS NOT NULL;
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

-- ─── RPC: create sale + items + stock deduct ────────────────
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

CREATE OR REPLACE FUNCTION public.place_customer_order(
  p_items JSONB,
  p_shipping_address TEXT,
  p_payment_method TEXT,
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
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
REVOKE ALL ON FUNCTION public.place_customer_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_customer_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

DROP POLICY IF EXISTS "Authenticated full access categories" ON categories;
DROP POLICY IF EXISTS "Authenticated full access products" ON products;
DROP POLICY IF EXISTS "Authenticated full access materials" ON materials;
DROP POLICY IF EXISTS "Authenticated full access product_materials" ON product_materials;
DROP POLICY IF EXISTS "Authenticated full access material_purchases" ON material_purchases;
DROP POLICY IF EXISTS "Authenticated full access material_stock_movements" ON material_stock_movements;
DROP POLICY IF EXISTS "Authenticated full access product_samples" ON product_samples;
DROP POLICY IF EXISTS "Authenticated full access customers" ON customers;
DROP POLICY IF EXISTS "Authenticated full access offers" ON offers;
DROP POLICY IF EXISTS "Authenticated full access offer_items" ON offer_items;
DROP POLICY IF EXISTS "Authenticated full access sales" ON sales;
DROP POLICY IF EXISTS "Authenticated full access sale_items" ON sale_items;
DROP POLICY IF EXISTS "Authenticated full access expenses" ON expenses;
DROP POLICY IF EXISTS "Authenticated full access banners" ON banners;
DROP POLICY IF EXISTS "Authenticated full access settings" ON settings;
DROP POLICY IF EXISTS "Authenticated manage profiles" ON profiles;
DROP POLICY IF EXISTS "Staff manage categories" ON categories;
DROP POLICY IF EXISTS "Staff manage products" ON products;
DROP POLICY IF EXISTS "Staff manage materials" ON materials;
DROP POLICY IF EXISTS "Staff manage product_materials" ON product_materials;
DROP POLICY IF EXISTS "Staff manage material_purchases" ON material_purchases;
DROP POLICY IF EXISTS "Staff manage material_stock_movements" ON material_stock_movements;
DROP POLICY IF EXISTS "Staff manage product_samples" ON product_samples;
DROP POLICY IF EXISTS "Staff manage customers" ON customers;
DROP POLICY IF EXISTS "Customers read own profile" ON customers;
DROP POLICY IF EXISTS "Customers update own profile" ON customers;
DROP POLICY IF EXISTS "Staff manage offers" ON offers;
DROP POLICY IF EXISTS "Staff manage offer_items" ON offer_items;
DROP POLICY IF EXISTS "Staff manage sales" ON sales;
DROP POLICY IF EXISTS "Customers read own orders" ON sales;
DROP POLICY IF EXISTS "Staff manage sale_items" ON sale_items;
DROP POLICY IF EXISTS "Customers read own sale items" ON sale_items;
DROP POLICY IF EXISTS "Staff manage expenses" ON expenses;
DROP POLICY IF EXISTS "Staff manage banners" ON banners;
DROP POLICY IF EXISTS "Staff manage settings" ON settings;
DROP POLICY IF EXISTS "Staff manage profiles" ON profiles;
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
CREATE POLICY "Staff manage settings" ON settings
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "Staff manage profiles" ON profiles
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

