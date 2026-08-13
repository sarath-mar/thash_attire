import { MaterialType } from '~/enums/materialType.js'
import { OrderStatus } from '~/enums/orderStatus.js'

export const MOCK_MATERIAL_PURCHASES = [
  {
    id: 'mp-001',
    material_id: 'mat-001',
    material_name: 'Kanjivaram Silk Fabric',
    material_type: MaterialType.PRODUCT,
    supplier: 'Silk Traders India',
    purchase_date: '2026-01-10',
    quantity: 20,
    unit: 'meter',
    total_amount: 4000,       // ₹4,000 for 20m
    unit_cost: 200,           // 4000/20 = ₹200/m
    notes: 'Initial stock purchase',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'mp-002',
    material_id: 'mat-001',
    material_name: 'Kanjivaram Silk Fabric',
    material_type: MaterialType.PRODUCT,
    supplier: 'Silk Traders India',
    purchase_date: '2026-03-15',
    quantity: 30,
    unit: 'meter',
    total_amount: 7200,       // ₹7,200 for 30m
    unit_cost: 240,           // 7200/30 = ₹240/m
    notes: 'Second batch - slightly higher price',
    // After this: Total 50m, Total Value ₹11,200, Avg ₹224/m
    created_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 'mp-003',
    material_id: 'mat-002',
    material_name: 'Georgette Fabric',
    material_type: MaterialType.PRODUCT,
    supplier: 'Mumbai Textile Hub',
    purchase_date: '2026-01-12',
    quantity: 20,
    unit: 'meter',
    total_amount: 6800,
    unit_cost: 340,
    notes: '',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'mp-004',
    material_id: 'mat-c01',
    material_name: 'Thank-You Card Cover',
    material_type: MaterialType.COMMON,
    supplier: 'Premium Packaging Co.',
    purchase_date: '2026-01-05',
    quantity: 100,
    unit: 'piece',
    total_amount: 500,        // ₹500 for 100 covers
    unit_cost: 5,             // ₹5/cover
    notes: 'Initial packaging stock',
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'mp-005',
    material_id: 'mat-003',
    material_name: 'Zari Thread',
    material_type: MaterialType.PRODUCT,
    supplier: 'Gold Thread Co.',
    purchase_date: '2026-01-14',
    quantity: 10,
    unit: 'roll',
    total_amount: 8200,
    unit_cost: 820,
    notes: 'For bridal orders',
    created_at: '2026-01-14T10:00:00Z',
  },
]

export const MOCK_MATERIAL_USAGE = [
  {
    id: 'mu-001',
    material_id: 'mat-001',
    order_id: 'ord-001',
    order_number: 'TA-2026-001',
    quantity_used: 5.5,
    unit: 'meter',
    unit_cost: 224,
    total_cost: 1232,
    date: '2026-08-10T10:30:00Z',
  },
  {
    id: 'mu-002',
    material_id: 'mat-001',
    order_id: 'ord-004',
    order_number: 'TA-2026-004',
    quantity_used: 7,
    unit: 'meter',
    unit_cost: 224,
    total_cost: 1568,
    date: '2026-08-07T09:45:00Z',
  },
]

// Complete stock history for a material (purchases + usage)
export function getMaterialStockHistory(materialId) {
  const purchases = MOCK_MATERIAL_PURCHASES
    .filter(p => p.material_id === materialId)
    .map(p => ({ ...p, transaction_type: 'purchase', quantity_change: p.quantity }))

  const usage = MOCK_MATERIAL_USAGE
    .filter(u => u.material_id === materialId)
    .map(u => ({ ...u, transaction_type: 'usage', quantity_change: -u.quantity_used }))

  return [...purchases, ...usage].sort((a, b) =>
    new Date(b.created_at || b.date) - new Date(a.created_at || a.date),
  )
}

export const MOCK_DASHBOARD_STATS = {
  // Sales stats
  today_sales: 2,
  today_revenue: 43499,
  month_revenue: 197797,
  total_revenue: 556000,
  month_orders: 12,
  total_orders: 47,

  // Order status counts
  orders_new: 3,
  orders_payment_pending: 2,
  orders_in_stitching: 4,
  orders_ready_to_ship: 2,
  orders_shipped: 1,
  orders_delivered: 5,

  // Profit stats
  month_product_cost: 94500,
  month_revenue_calc: 197797,
  month_gross_profit: 103297,
  month_profit_margin: 52.2,

  // Inventory
  total_material_value: 19816.5,
  low_stock_materials: 2,
  out_of_stock_materials: 1,

  // Chart data — 7 day revenue vs cost
  chart_data: [
    { date: '2026-08-07', revenue: 43000, cost: 22585 },
    { date: '2026-08-08', revenue: 17998, cost: 8460 },
    { date: '2026-08-09', revenue: 18500, cost: 9235 },
    { date: '2026-08-10', revenue: 24999, cost: 12535 },
    { date: '2026-08-11', revenue: 8500, cost: 4200 },
    { date: '2026-08-12', revenue: 12300, cost: 6035 },
    { date: '2026-08-13', revenue: 0, cost: 0 },
  ],

  // Recent orders
  recent_orders: [
    { id: 'ord-001', order_number: 'TA-2026-001', customer_name: 'Priya Sharma', product_name: 'Royal Zari Kanjivaram Silk Saree', total_amount: 24999, payment_status: 'paid', order_status: OrderStatus.DELIVERED, order_date: '2026-08-10T10:30:00Z' },
    { id: 'ord-002', order_number: 'TA-2026-002', customer_name: 'Meena Iyer', product_name: 'Hand-Embroidered Organza Anarkali Set', total_amount: 18500, payment_status: 'paid', order_status: OrderStatus.HANDED_TO_COURIER, order_date: '2026-08-09T14:00:00Z' },
    { id: 'ord-003', order_number: 'TA-2026-003', customer_name: 'Divya Nair', product_name: 'Chanderi Silk Handblock Printed Kurti', total_amount: 17998, payment_status: 'pending', order_status: OrderStatus.PAYMENT_PENDING, order_date: '2026-08-08T11:15:00Z' },
    { id: 'ord-004', order_number: 'TA-2026-004', customer_name: 'Lakshmi Reddy', product_name: 'Intricate Velvet Bridal Lehenga Choli', total_amount: 43000, payment_status: 'paid', order_status: OrderStatus.SENT_TO_STITCHING, order_date: '2026-08-07T09:45:00Z' },
    { id: 'ord-005', order_number: 'TA-2026-005', customer_name: 'Anjali Krishnan', product_name: 'Tissue Georgette Ruffled Saree', total_amount: 12300, payment_status: 'paid', order_status: OrderStatus.COMPLETED, order_date: '2026-08-06T16:30:00Z' },
  ],

  // Low stock materials
  low_stock_materials_list: [
    { id: 'mat-006', name: 'Cotton Lace Trim', current_stock: 3.5, unit: 'meter', min_stock_level: 10, avg_unit_cost: 95 },
    { id: 'mat-007', name: 'Velvet Fabric', current_stock: 0, unit: 'meter', min_stock_level: 5, avg_unit_cost: 960 },
  ],
}
