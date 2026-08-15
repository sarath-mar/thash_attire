-- Migration: Add Showcase Sample Logic

-- 1. Alter products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS showcase_stitching_cost NUMERIC(10,2) NULL,
  ADD COLUMN IF NOT EXISTS initial_sample_created BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Create product_samples table
CREATE TABLE IF NOT EXISTS product_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  material_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  showcase_stitching_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  other_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create material_stock_movements if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_reason') THEN
        CREATE TYPE movement_reason AS ENUM ('PURCHASE', 'PRODUCTION', 'ADJUSTMENT', 'INITIAL_SHOWCASE_SAMPLE');
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

-- 4. Create an RPC function to atomically create product, materials, and sample
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
  -- Handle Arrays
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

  -- Insert Product
  INSERT INTO products (
    name, sku, description, category_id, selling_price, cost_price, 
    stock, status, is_featured, is_trending, sizes, colors, images, videos,
    is_showcase, showcase_stitching_cost, initial_sample_created
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
    p_create_sample
  ) RETURNING id INTO v_product_id;

  -- Process Materials
  IF p_materials IS NOT NULL THEN
    FOR v_material IN SELECT * FROM jsonb_array_elements(p_materials)
    LOOP
      v_required_qty := (v_material->>'quantity')::NUMERIC;
      
      -- Insert product_materials
      INSERT INTO product_materials (product_id, material_id, quantity_required)
      VALUES (v_product_id, (v_material->>'material_id')::UUID, v_required_qty);

      IF p_create_sample THEN
        -- Get current stock and cost
        SELECT stock, avg_unit_cost INTO v_available_stock, v_avg_unit_cost
        FROM materials 
        WHERE id = (v_material->>'material_id')::UUID FOR UPDATE;

        IF v_available_stock < v_required_qty THEN
          RAISE EXCEPTION 'Insufficient stock for material ID %', v_material->>'material_id';
        END IF;

        -- Deduct Stock
        UPDATE materials 
        SET stock = stock - v_required_qty,
            updated_at = NOW()
        WHERE id = (v_material->>'material_id')::UUID;

        -- Create Movement Record
        INSERT INTO material_stock_movements (material_id, quantity, reason, reference_id)
        VALUES ((v_material->>'material_id')::UUID, -v_required_qty, 'INITIAL_SHOWCASE_SAMPLE', v_product_id);

        -- Add to total cost
        v_total_material_cost := v_total_material_cost + (v_required_qty * v_avg_unit_cost);
      END IF;
    END LOOP;
  END IF;

  IF p_create_sample THEN
    -- Insert product_samples record
    INSERT INTO product_samples (
      product_id, material_cost, showcase_stitching_cost, other_cost, total_cost
    ) VALUES (
      v_product_id, 
      v_total_material_cost, 
      COALESCE(p_showcase_stitching_cost, 0),
      0, 
      v_total_material_cost + COALESCE(p_showcase_stitching_cost, 0)
    );
  END IF;

  RETURN v_product_id;
END;
$$ LANGUAGE plpgsql;
