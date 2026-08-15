-- ==========================================
-- THASH ATTIRE — Admin flow fixes migration
-- Run in Supabase SQL Editor after prior migrations
-- ==========================================

-- 1) Product cost / inventory fields used by admin forms
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stitching_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS packaging_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS target_margin NUMERIC(5, 2) NOT NULL DEFAULT 40;

-- 2) Ensure materials schema matches app (stock + weighted avg)
ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS stock NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS min_stock_level NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS avg_unit_cost NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Backfill from legacy columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materials' AND column_name = 'quantity'
  ) THEN
    UPDATE materials SET stock = COALESCE(stock, quantity, 0) WHERE stock IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materials' AND column_name = 'cost_per_unit'
  ) THEN
    UPDATE materials SET avg_unit_cost = COALESCE(avg_unit_cost, cost_per_unit, 0) WHERE avg_unit_cost IS NULL;
  END IF;
END $$;

UPDATE materials SET type = COALESCE(type, 'product') WHERE type IS NULL;
UPDATE materials SET stock = COALESCE(stock, 0) WHERE stock IS NULL;
UPDATE materials SET min_stock_level = COALESCE(min_stock_level, 0) WHERE min_stock_level IS NULL;
UPDATE materials SET avg_unit_cost = COALESCE(avg_unit_cost, 0) WHERE avg_unit_cost IS NULL;

ALTER TABLE materials ALTER COLUMN type SET DEFAULT 'product';
ALTER TABLE materials ALTER COLUMN stock SET DEFAULT 0;
ALTER TABLE materials ALTER COLUMN min_stock_level SET DEFAULT 0;
ALTER TABLE materials ALTER COLUMN avg_unit_cost SET DEFAULT 0;

-- 3) material_purchases.unit (if missing)
ALTER TABLE material_purchases ADD COLUMN IF NOT EXISTS unit TEXT;

-- 4) Record purchase RPC (idempotent replace)
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
    v_new_avg := ((v_current_stock * v_current_avg) + (p_quantity * p_unit_cost)) / (v_current_stock + p_quantity);
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

-- 5) Delete purchase RPC — reverses stock + weighted average
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

-- 6) Create product RPC — persist cost fields + materials
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
        VALUES ((v_material->>'material_id')::UUID, -v_required_qty, 'INITIAL_SHOWCASE_SAMPLE', v_product_id);

        v_total_material_cost := v_total_material_cost + (v_required_qty * COALESCE(v_avg_unit_cost, 0));
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
      v_total_material_cost + COALESCE(p_showcase_stitching_cost, 0) + COALESCE((p_product->>'other_cost')::NUMERIC, 0)
    );
  END IF;

  RETURN v_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
