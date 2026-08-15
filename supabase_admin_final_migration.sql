-- ==========================================
-- THASH ATTIRE - FINAL ADMIN MIGRATION
-- ==========================================
-- Add order_date to sales table to keep it separate from created_at

ALTER TABLE sales ADD COLUMN IF NOT EXISTS order_date TIMESTAMPTZ DEFAULT NOW();

-- Backfill order_date with sale_date for existing records (optional but recommended)
UPDATE sales SET order_date = sale_date WHERE order_date IS NULL;
