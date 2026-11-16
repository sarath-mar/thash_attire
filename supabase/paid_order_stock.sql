-- Run once in the Supabase SQL Editor.
-- Dashboard orders are paid sales only.
-- Product stock drops when an order is created as paid, or when payment is recorded later.
-- Existing orders are marked already deducted so stock is not reduced a second time.

ALTER TABLE sales ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN;
UPDATE sales SET stock_deducted = true WHERE stock_deducted IS NULL;
ALTER TABLE sales ALTER COLUMN stock_deducted SET DEFAULT false;
ALTER TABLE sales ALTER COLUMN stock_deducted SET NOT NULL;

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

-- Puts pieces back when a paid order is cancelled. Runs only if stock was deducted.
CREATE OR REPLACE FUNCTION public.restore_sale_stock(p_sale_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM sale_items
    WHERE sale_id = p_sale_id
    ORDER BY product_id
  LOOP
    IF v_item.product_id IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE products
    SET stock = stock + COALESCE(v_item.quantity, 0),
        updated_at = NOW()
    WHERE id = v_item.product_id;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.restore_sale_stock(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.restore_sale_stock(UUID) FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_sale_stock_on_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
    IF COALESCE(OLD.stock_deducted, false) THEN
      PERFORM public.restore_sale_stock(OLD.id);
      NEW.stock_deducted := false;
    END IF;
  ELSIF OLD.status = 'cancelled' AND NEW.status IS DISTINCT FROM 'cancelled' THEN
    IF COALESCE(NEW.payment_status, '') = 'paid' AND NOT COALESCE(NEW.stock_deducted, false) THEN
      PERFORM public.deduct_sale_stock(OLD.id);
      NEW.stock_deducted := true;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_sale_stock_on_status ON sales;
CREATE TRIGGER sync_sale_stock_on_status
  BEFORE UPDATE OF status ON sales
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_sale_stock_on_status();

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

REVOKE ALL ON FUNCTION public.place_customer_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_customer_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
