-- ==========================================
-- THASH ATTIRE - FINAL ADMIN MIGRATION
-- ==========================================
-- Add order_date to sales table to keep it separate from created_at

ALTER TABLE sales ADD COLUMN IF NOT EXISTS order_date TIMESTAMPTZ DEFAULT NOW();

-- Backfill order_date with sale_date for existing records (optional but recommended)
UPDATE sales SET order_date = sale_date WHERE order_date IS NULL;

-- Add notes column to materials table (was missing from original schema)
ALTER TABLE materials ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add unit column to material_purchases table (was missing from original schema)
ALTER TABLE material_purchases ADD COLUMN IF NOT EXISTS unit TEXT;

-- ==========================================
-- RPC: record_material_purchase
-- Atomically inserts a purchase record and
-- updates material stock + avg_unit_cost (weighted average)
-- ==========================================
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
  -- Get current stock and avg cost
  SELECT stock, avg_unit_cost INTO v_current_stock, v_current_avg
  FROM materials WHERE id = p_material_id FOR UPDATE;

  -- Weighted average: (old_stock * old_avg + new_qty * new_unit_cost) / (old_stock + new_qty)
  IF (v_current_stock + p_quantity) > 0 THEN
    v_new_avg := ((v_current_stock * v_current_avg) + (p_quantity * p_unit_cost)) / (v_current_stock + p_quantity);
  ELSE
    v_new_avg := p_unit_cost;
  END IF;

  -- Update material stock and avg_unit_cost
  UPDATE materials
  SET
    stock = v_current_stock + p_quantity,
    avg_unit_cost = v_new_avg,
    updated_at = NOW()
  WHERE id = p_material_id;

  -- Insert the purchase record
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
