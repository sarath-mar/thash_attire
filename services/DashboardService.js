import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import { AppConfig } from '~/constants/app.js'

const MOCK_SUMMARY = {
  totalProducts: 8,
  totalStock: 60,
  totalCustomers: 24,
  totalSales: 37,
  totalRevenue: 482500,
  totalExpenses: 68000,
  estimatedProfit: 414500,
}

const MOCK_RECENT_SALES = [
  {
    id: 'sale-001',
    customer: { name: 'Priya Sharma' },
    product: { name: 'Royal Zari Kanjivaram Silk Saree', sku: 'TA-SAR-001' },
    quantity: 1,
    final_amount: 24999,
    payment_status: 'paid',
    sale_date: '2026-08-10T10:30:00Z',
  },
  {
    id: 'sale-002',
    customer: { name: 'Meena Iyer' },
    product: { name: 'Hand-Embroidered Organza Anarkali Set', sku: 'TA-GWN-002' },
    quantity: 1,
    final_amount: 18500,
    payment_status: 'paid',
    sale_date: '2026-08-09T14:00:00Z',
  },
  {
    id: 'sale-003',
    customer: { name: 'Divya Nair' },
    product: { name: 'Chanderi Silk Handblock Printed Kurti', sku: 'TA-KRT-004' },
    quantity: 2,
    final_amount: 17998,
    payment_status: 'pending',
    sale_date: '2026-08-08T11:15:00Z',
  },
  {
    id: 'sale-004',
    customer: { name: 'Lakshmi Reddy' },
    product: { name: 'Intricate Velvet Bridal Lehenga Choli', sku: 'TA-BRD-003' },
    quantity: 1,
    final_amount: 45000,
    payment_status: 'paid',
    sale_date: '2026-08-07T09:45:00Z',
  },
  {
    id: 'sale-005',
    customer: { name: 'Anjali Krishnan' },
    product: { name: 'Tissue Georgette Ruffled Saree', sku: 'TA-SAR-007' },
    quantity: 1,
    final_amount: 12800,
    payment_status: 'paid',
    sale_date: '2026-08-06T16:30:00Z',
  },
]

const MOCK_TOP_PRODUCTS = [
  { id: 'prod-001', name: 'Royal Zari Kanjivaram Silk Saree', sku: 'TA-SAR-001', total_sold: 12, revenue: 299988 },
  { id: 'prod-003', name: 'Intricate Velvet Bridal Lehenga Choli', sku: 'TA-BRD-003', total_sold: 5, revenue: 225000 },
  { id: 'prod-002', name: 'Hand-Embroidered Organza Anarkali Set', sku: 'TA-GWN-002', total_sold: 9, revenue: 166500 },
  { id: 'prod-004', name: 'Chanderi Silk Handblock Printed Kurti', sku: 'TA-KRT-004', total_sold: 11, revenue: 98989 },
  { id: 'prod-007', name: 'Tissue Georgette Ruffled Saree', sku: 'TA-SAR-007', total_sold: 7, revenue: 89600 },
]

export const DashboardService = {
  async getSummary() {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_SUMMARY

    try {
      const [productsRes, customersRes, salesRes, expensesRes] = await Promise.all([
        supabase.from('products').select('id, stock', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact' }),
        supabase.from('sales').select('final_amount', { count: 'exact' }),
        supabase.from('expenses').select('amount'),
      ])

      const totalProducts = productsRes.count || 0
      const totalStock = (productsRes.data || []).reduce((sum, p) => sum + (p.stock || 0), 0)
      const totalCustomers = customersRes.count || 0
      const totalSales = salesRes.count || 0
      const totalRevenue = (salesRes.data || []).reduce((sum, s) => sum + (s.final_amount || 0), 0)
      const totalExpenses = (expensesRes.data || []).reduce((sum, e) => sum + (e.amount || 0), 0)

      // Simplified profit: revenue - expenses (cost price tracking is more detailed)
      const estimatedProfit = totalRevenue - totalExpenses

      return { totalProducts, totalStock, totalCustomers, totalSales, totalRevenue, totalExpenses, estimatedProfit }
    } catch (err) {
      console.warn('[DashboardService] getSummary failed, using mock data:', err.message)
      return MOCK_SUMMARY
    }
  },

  async getRecentSales(limit = 5) {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_RECENT_SALES.slice(0, limit)

    try {
      const { data, error } = await supabase
        .from('sales')
        .select('id, final_amount, payment_status, sale_date, quantity, customers(name), products(name, sku)')
        .order('sale_date', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []).map((sale) => ({
        ...sale,
        customer: sale.customers,
        product: sale.products,
      }))
    } catch (err) {
      console.warn('[DashboardService] getRecentSales failed, using mock data:', err.message)
      return MOCK_RECENT_SALES.slice(0, limit)
    }
  },

  async getLowStockProducts(threshold = 5) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return [
        { id: 'prod-003', name: 'Intricate Velvet Bridal Lehenga Choli', sku: 'TA-BRD-003', stock: 3 },
        { id: 'prod-008', name: 'Mirror Work Raw Silk Cocktail Suit', sku: 'TA-KRT-008', stock: 2 },
      ]
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, stock')
        .lte('stock', threshold)
        .order('stock', { ascending: true })
        .limit(10)

      if (error) throw error
      return data || []
    } catch (err) {
      console.warn('[DashboardService] getLowStockProducts failed:', err.message)
      return []
    }
  },

  async getTopSellingProducts(limit = 5) {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_TOP_PRODUCTS.slice(0, limit)

    try {
      // Aggregate sold quantity per product from sale_items
      const { data, error } = await supabase
        .from('sale_items')
        .select('product_id, quantity, unit_price, products(name, sku)')
        .limit(200)

      if (error) throw error

      // Group and sum by product
      const productMap = {}
      for (const item of data || []) {
        const pid = item.product_id
        if (!productMap[pid]) {
          productMap[pid] = {
            id: pid,
            name: item.products?.name || 'Unknown',
            sku: item.products?.sku || '',
            total_sold: 0,
            revenue: 0,
          }
        }
        productMap[pid].total_sold += item.quantity || 0
        productMap[pid].revenue += (item.quantity || 0) * (item.unit_price || 0)
      }

      return Object.values(productMap)
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, limit)
    } catch (err) {
      console.warn('[DashboardService] getTopSellingProducts failed:', err.message)
      return MOCK_TOP_PRODUCTS.slice(0, limit)
    }
  },
}
