-- Run this once in the Supabase SQL Editor on an existing project.
-- Adds homepage reviews, and lets a combo offer use its set price at checkout.

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

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active reviews" ON reviews;
CREATE POLICY "Public read active reviews" ON reviews
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Staff manage reviews" ON reviews;
CREATE POLICY "Staff manage reviews" ON reviews
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
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
    status, sale_date, order_date, shipping_address, notes, status_history
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

    IF COALESCE(v_product.stock, 0) >= v_qty THEN
      UPDATE products
      SET stock = stock - v_qty, updated_at = NOW()
      WHERE id = v_product.id;
    END IF;
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

-- A banner only needs a title. Image, dates, and button fields can be empty.
ALTER TABLE banners ALTER COLUMN image_url DROP NOT NULL;

REVOKE ALL ON FUNCTION public.upsert_my_customer_profile(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_my_customer_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.place_customer_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_customer_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- Storage buckets used by the admin uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('products', 'products', true),
  ('product-videos', 'product-videos', true),
  ('materials', 'materials', false),
  ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read storefront files" ON storage.objects;
CREATE POLICY "Public read storefront files" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('products', 'product-videos', 'banners'));

DROP POLICY IF EXISTS "Staff manage storefront files" ON storage.objects;
CREATE POLICY "Staff manage storefront files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id IN ('products', 'product-videos', 'materials', 'banners') AND public.is_staff())
  WITH CHECK (bucket_id IN ('products', 'product-videos', 'materials', 'banners') AND public.is_staff());
