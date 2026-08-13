/**
 * Extended product mock data for admin UI (materials, costs, inventory).
 */

export const MOCK_PRODUCT_DETAILS = {
  'prod-001': {
    stitching_cost: 3500,
    packaging_cost: 35,
    other_cost: 0,
    target_margin: 40,
    low_stock_threshold: 3,
    materials: [
      { material_id: 'mat-001', name: 'Kanjivaram Silk Fabric', quantity: 5.5, unit: 'meter', unit_cost: 224, available_stock: 22.5 },
      { material_id: 'mat-003', name: 'Zari Thread', quantity: 1, unit: 'roll', unit_cost: 820, available_stock: 8 },
      { material_id: 'mat-005', name: 'Pearl Buttons (5mm)', quantity: 8, unit: 'piece', unit_cost: 3.5, available_stock: 180 },
    ],
    common_materials: [
      { material_id: 'mat-c01', name: 'Thank-You Card Cover', quantity: 1, unit_cost: 5 },
      { material_id: 'mat-c02', name: 'Brand Tag', quantity: 1, unit_cost: 2 },
      { material_id: 'mat-c03', name: 'Branded Sticker', quantity: 1, unit_cost: 1.5 },
    ],
  },
  'prod-002': {
    stitching_cost: 2800,
    packaging_cost: 35,
    other_cost: 0,
    target_margin: 42,
    low_stock_threshold: 2,
    materials: [
      { material_id: 'mat-002', name: 'Georgette Fabric', quantity: 4, unit: 'meter', unit_cost: 340, available_stock: 18 },
      { material_id: 'mat-004', name: 'Invisible Zip (10 inch)', quantity: 1, unit: 'piece', unit_cost: 18, available_stock: 45 },
    ],
    common_materials: [
      { material_id: 'mat-c01', name: 'Thank-You Card Cover', quantity: 1, unit_cost: 5 },
      { material_id: 'mat-c02', name: 'Brand Tag', quantity: 1, unit_cost: 2 },
    ],
  },
}

export function getProductDetails(productId) {
  return MOCK_PRODUCT_DETAILS[productId] || {
    stitching_cost: 0,
    packaging_cost: 35,
    other_cost: 0,
    target_margin: 40,
    low_stock_threshold: 5,
    materials: [],
    common_materials: [
      { material_id: 'mat-c01', name: 'Thank-You Card Cover', quantity: 1, unit_cost: 5 },
      { material_id: 'mat-c02', name: 'Brand Tag', quantity: 1, unit_cost: 2 },
    ],
  }
}
