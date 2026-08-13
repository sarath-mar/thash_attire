/**
 * Mock materials data.
 * Each material tracks current stock and weighted average cost.
 *
 * Weighted Average Cost formula:
 *   (existing_stock × existing_avg_cost + new_qty × new_unit_cost) / (existing_stock + new_qty)
 */

import { MaterialType } from '~/enums/materialType.js'
import { MaterialUnit } from '~/enums/materialUnit.js'

export const MOCK_MATERIALS = [
  {
    id: 'mat-001',
    name: 'Kanjivaram Silk Fabric',
    type: MaterialType.PRODUCT,
    supplier: 'Silk Traders India',
    unit: MaterialUnit.METER,
    current_stock: 22.5,
    avg_unit_cost: 224,          // Weighted average per meter
    total_inventory_value: 5040, // current_stock × avg_unit_cost
    min_stock_level: 10,
    notes: 'Premium quality silk for sarees and lehengas',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z',
  },
  {
    id: 'mat-002',
    name: 'Georgette Fabric',
    type: MaterialType.PRODUCT,
    supplier: 'Mumbai Textile Hub',
    unit: MaterialUnit.METER,
    current_stock: 18,
    avg_unit_cost: 340,
    total_inventory_value: 6120,
    min_stock_level: 8,
    notes: 'Lightweight fabric for dupattas and anarkali',
    created_at: '2026-01-12T10:00:00Z',
    updated_at: '2026-08-05T10:00:00Z',
  },
  {
    id: 'mat-003',
    name: 'Zari Thread',
    type: MaterialType.PRODUCT,
    supplier: 'Gold Thread Co.',
    unit: MaterialUnit.ROLL,
    current_stock: 8,
    avg_unit_cost: 820,
    total_inventory_value: 6560,
    min_stock_level: 3,
    notes: 'Pure gold zari for embroidery work',
    created_at: '2026-01-14T10:00:00Z',
    updated_at: '2026-07-20T10:00:00Z',
  },
  {
    id: 'mat-004',
    name: 'Invisible Zip (10 inch)',
    type: MaterialType.PRODUCT,
    supplier: 'Raj Accessories',
    unit: MaterialUnit.PIECE,
    current_stock: 45,
    avg_unit_cost: 18,
    total_inventory_value: 810,
    min_stock_level: 20,
    notes: 'For kurtis and gowns',
    created_at: '2026-01-16T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'mat-005',
    name: 'Pearl Buttons (5mm)',
    type: MaterialType.PRODUCT,
    supplier: 'Raj Accessories',
    unit: MaterialUnit.PIECE,
    current_stock: 180,
    avg_unit_cost: 3.5,
    total_inventory_value: 630,
    min_stock_level: 50,
    notes: 'For blouses and kurtis',
    created_at: '2026-01-18T10:00:00Z',
    updated_at: '2026-07-15T10:00:00Z',
  },
  {
    id: 'mat-006',
    name: 'Cotton Lace Trim',
    type: MaterialType.PRODUCT,
    supplier: 'Kerala Lace House',
    unit: MaterialUnit.METER,
    current_stock: 3.5,
    avg_unit_cost: 95,
    total_inventory_value: 332.5,
    min_stock_level: 10,
    notes: 'Low stock — reorder needed',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-08-08T10:00:00Z',
  },
  {
    id: 'mat-007',
    name: 'Velvet Fabric',
    type: MaterialType.PRODUCT,
    supplier: 'Surat Velvet Mills',
    unit: MaterialUnit.METER,
    current_stock: 0,
    avg_unit_cost: 960,
    total_inventory_value: 0,
    min_stock_level: 5,
    notes: 'For bridal lehengas — currently out of stock',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z',
  },
  // Common Materials
  {
    id: 'mat-c01',
    name: 'Thank-You Card Cover',
    type: MaterialType.COMMON,
    supplier: 'Premium Packaging Co.',
    unit: MaterialUnit.PIECE,
    current_stock: 68,
    avg_unit_cost: 5,
    total_inventory_value: 340,
    min_stock_level: 20,
    notes: 'Used for every order',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'mat-c02',
    name: 'Brand Tag',
    type: MaterialType.COMMON,
    supplier: 'Premium Packaging Co.',
    unit: MaterialUnit.PIECE,
    current_stock: 85,
    avg_unit_cost: 2,
    total_inventory_value: 170,
    min_stock_level: 30,
    notes: 'Attached to each garment',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'mat-c03',
    name: 'Branded Sticker',
    type: MaterialType.COMMON,
    supplier: 'PrintMaster Kerala',
    unit: MaterialUnit.PIECE,
    current_stock: 92,
    avg_unit_cost: 1.5,
    total_inventory_value: 138,
    min_stock_level: 30,
    notes: 'For packaging seal',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'mat-c04',
    name: 'Courier Cover (Small)',
    type: MaterialType.COMMON,
    supplier: 'PackRight India',
    unit: MaterialUnit.PIECE,
    current_stock: 38,
    avg_unit_cost: 12,
    total_inventory_value: 456,
    min_stock_level: 20,
    notes: 'For small parcels',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-08-05T10:00:00Z',
  },
  {
    id: 'mat-c05',
    name: 'Tissue Paper (Sheet)',
    type: MaterialType.COMMON,
    supplier: 'Premium Packaging Co.',
    unit: MaterialUnit.PIECE,
    current_stock: 120,
    avg_unit_cost: 0.75,
    total_inventory_value: 90,
    min_stock_level: 50,
    notes: 'Wrapping inside parcel',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
]

export function getStockStatus(material) {
  if (material.current_stock === 0) return 'out_of_stock'
  if (material.current_stock <= material.min_stock_level) return 'low_stock'
  return 'in_stock'
}

/**
 * Calculate weighted average cost after a new purchase.
 * @param {number} existingStock  - current quantity in inventory
 * @param {number} existingAvg   - current weighted average cost per unit
 * @param {number} newQty        - quantity being purchased
 * @param {number} newTotalCost  - total price paid (NOT unit price)
 * @returns {object} { newAvgCost, newStock, totalValue }
 */
export function calcWeightedAvg(existingStock, existingAvg, newQty, newTotalCost) {
  const newUnitCost = newQty > 0 ? newTotalCost / newQty : 0
  const existingValue = existingStock * existingAvg
  const totalQty = existingStock + newQty
  const totalValue = existingValue + newTotalCost
  const newAvgCost = totalQty > 0 ? totalValue / totalQty : newUnitCost
  return {
    newAvgCost: Math.round(newAvgCost * 100) / 100,
    newStock: totalQty,
    totalValue: Math.round(totalValue * 100) / 100,
    newUnitCost: Math.round(newUnitCost * 100) / 100,
    existingValue: Math.round(existingValue * 100) / 100,
  }
}
