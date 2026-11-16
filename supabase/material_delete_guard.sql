-- Run once in the Supabase SQL Editor.
-- A material delete must stop when recipes, purchases, or stock history still depend on it.
-- Product recipes still disappear when the product itself is deleted.

ALTER TABLE product_materials DROP CONSTRAINT IF EXISTS product_materials_material_id_fkey;
ALTER TABLE product_materials
  ADD CONSTRAINT product_materials_material_id_fkey
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT;

ALTER TABLE material_purchases DROP CONSTRAINT IF EXISTS material_purchases_material_id_fkey;
ALTER TABLE material_purchases
  ADD CONSTRAINT material_purchases_material_id_fkey
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT;

ALTER TABLE material_stock_movements DROP CONSTRAINT IF EXISTS material_stock_movements_material_id_fkey;
ALTER TABLE material_stock_movements
  ADD CONSTRAINT material_stock_movements_material_id_fkey
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT;
