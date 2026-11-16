-- Run once in the Supabase SQL Editor.
-- Lets admin record when an order was paid, and which UPI app sent the money.

ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_app TEXT;

ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_payment_app_check;
ALTER TABLE sales
  ADD CONSTRAINT sales_payment_app_check
  CHECK (payment_app IS NULL OR payment_app IN ('google_pay', 'phonepe', 'paytm', 'bhim', 'other'));
