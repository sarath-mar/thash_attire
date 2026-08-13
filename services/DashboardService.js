import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const DashboardService = {
  async getSummary() {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

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
    const totalRevenue = (salesRes.data || []).reduce((sum, s) => sum + (Number(s.final_amount) || 0), 0)
    const totalExpenses = (expensesRes.data || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

    const estimatedProfit = totalRevenue - totalExpenses

    return { totalProducts, totalStock, totalCustomers, totalSales, totalRevenue, totalExpenses, estimatedProfit }
  },

  async getRecentSales(limit = 5) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('sales')
      .select('id, final_amount, payment_status, sale_date, quantity, customers(name), products(name, sku)')
      .order('sale_date', { ascending: false })
      .limit(limit)

    if (error) throw new Error(handleSupabaseError(error))
    
    return (data || []).map((sale) => ({
      ...sale,
      customer: sale.customers,
      product: sale.products,
    }))
  },

  async getLowStockProducts(threshold = 5) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock')
      .lte('stock', threshold)
      .order('stock', { ascending: true })
      .limit(10)

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },

  async getTopSellingProducts(limit = 5) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('sales')
      .select('product_id, quantity, selling_price, products(name, sku)')
      .limit(200)

    if (error) throw new Error(handleSupabaseError(error))

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
      productMap[pid].revenue += (item.quantity || 0) * (item.selling_price || 0)
    }

    return Object.values(productMap)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, limit)
  },
}
