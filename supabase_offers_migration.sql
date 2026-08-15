-- ==========================================
-- THASH ATTIRE - OFFERS & COMBOS MIGRATION
-- ==========================================
-- Run this script in your Supabase SQL Editor to add the Offers functionality.

-- 1. OFFERS TABLE
CREATE TABLE offers (
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

-- 2. OFFER ITEMS TABLE
CREATE TABLE offer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SALE ITEMS TABLE
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL, -- Null if normal product sale
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0, -- Allocated price if combo
  cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0,    -- Snapshot of cost price at time of sale
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ALTER SALES TABLE
ALTER TABLE sales ADD COLUMN offer_id UUID REFERENCES offers(id) ON DELETE SET NULL;
-- Make legacy fields nullable so we don't break when inserting pure combo orders
ALTER TABLE sales ALTER COLUMN quantity DROP NOT NULL;
ALTER TABLE sales ALTER COLUMN selling_price DROP NOT NULL;

-- 5. MIGRATE EXISTING SALES DATA TO SALE_ITEMS (If any exists)
INSERT INTO sale_items (sale_id, product_id, product_name, quantity, selling_price, cost_price)
SELECT s.id, s.product_id, s.product_name, s.quantity, s.selling_price, p.cost_price
FROM sales s
JOIN products p ON s.product_id = p.id
WHERE s.product_id IS NOT NULL;

-- 6. TRIGGERS
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offer_items_updated_at BEFORE UPDATE ON offer_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to offers" ON offers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to offer_items" ON offer_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to sale_items" ON sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access to active offers" ON offers FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "Allow public read access to offer_items" ON offer_items FOR SELECT TO anon USING (true);


-- 8. TRANSACTIONAL ORDER CREATION RPC
-- This function allows creating an order and its items, and deducting inventory atomically.
CREATE OR REPLACE FUNCTION create_sale_transaction(
  p_sale JSONB,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_current_stock INTEGER;
  v_result JSONB;
BEGIN
  -- 1. Insert Sale
  INSERT INTO sales (
    order_number, customer_id, customer_name, offer_id,
    discount, final_amount, payment_method, payment_status,
    status, sale_date, order_date, expected_delivery, shipping_address, notes
  ) VALUES (
    p_sale->>'order_number',
    (p_sale->>'customer_id')::UUID,
    p_sale->>'customer_name',
    CASE WHEN p_sale->>'offer_id' IS NULL THEN NULL ELSE (p_sale->>'offer_id')::UUID END,
    (p_sale->>'discount')::NUMERIC,
    (p_sale->>'final_amount')::NUMERIC,
    p_sale->>'payment_method',
    p_sale->>'payment_status',
    p_sale->>'status',
    COALESCE((p_sale->>'sale_date')::TIMESTAMPTZ, NOW()),
    COALESCE((p_sale->>'order_date')::TIMESTAMPTZ, NOW()),
    CASE WHEN p_sale->>'expected_delivery' IS NULL THEN NULL ELSE (p_sale->>'expected_delivery')::TIMESTAMPTZ END,
    p_sale->>'shipping_address',
    p_sale->>'notes'
  ) RETURNING id INTO v_sale_id;

  -- 2. Insert Items and Deduct Inventory
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Check stock
    SELECT stock INTO v_current_stock FROM products WHERE id = (v_item->>'product_id')::UUID FOR UPDATE;
    
    IF v_current_stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for product %', (v_item->>'product_id');
    END IF;

    -- Insert sale item
    INSERT INTO sale_items (
      sale_id, offer_id, product_id, product_name, quantity, selling_price, cost_price
    ) VALUES (
      v_sale_id,
      CASE WHEN v_item->>'offer_id' IS NULL THEN NULL ELSE (v_item->>'offer_id')::UUID END,
      (v_item->>'product_id')::UUID,
      v_item->>'product_name',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'selling_price')::NUMERIC,
      (v_item->>'cost_price')::NUMERIC
    );

    -- Deduct stock
    UPDATE products 
    SET stock = stock - (v_item->>'quantity')::INTEGER,
        updated_at = NOW()
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;

  -- 3. Return created sale ID
  v_result := jsonb_build_object('id', v_sale_id);
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
