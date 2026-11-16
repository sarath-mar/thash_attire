-- Run once in the Supabase SQL Editor.
-- New orders get an expected delivery 5 days after the order date.
-- Existing orders with no delivery date are filled in the same way.

CREATE OR REPLACE FUNCTION public.sales_default_expected_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expected_delivery IS NULL THEN
    NEW.expected_delivery := COALESCE(NEW.order_date, NEW.sale_date, NOW()) + INTERVAL '5 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sales_default_expected_delivery ON sales;
CREATE TRIGGER sales_default_expected_delivery
  BEFORE INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION public.sales_default_expected_delivery();

UPDATE sales
SET expected_delivery = COALESCE(order_date, sale_date, created_at) + INTERVAL '5 days'
WHERE expected_delivery IS NULL;
