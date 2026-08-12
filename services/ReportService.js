import { getSupabaseClient } from './supabaseClient.js'
import { PaymentStatus } from '~/enums/index.js'

function getDateRange(period) {
  const now = new Date()
  let from = null
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

  if (period === 'today') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  } else if (period === 'week') {
    const day = now.getDay() || 7
    from = new Date(now - (day - 1) * 86400000)
    from.setHours(0, 0, 0, 0)
    from = from.toISOString()
  } else if (period === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  } else if (period === 'year') {
    from = new Date(now.getFullYear(), 0, 1).toISOString()
  }

  return { from, to }
}

export const ReportService = {
  async getSalesReport(period = 'month', customFrom = null, customTo = null) {
    const supabase = getSupabaseClient()
    const { from, to } = period === 'custom' ? { from: customFrom, to: customTo } : getDateRange(period)

    if (!supabase) {
      return {
        totalRevenue: 119797,
        totalSales: 5,
        totalDiscount: 500,
        salesByDay: [],
      }
    }

    let query = supabase.from('sales').select('sale_date, final_amount, discount, payment_status, status')
    if (from) query = query.gte('sale_date', from)
    if (to) query = query.lte('sale_date', to)

    const { data, error } = await query
    if (error) return { totalRevenue: 0, totalSales: 0, totalDiscount: 0, salesByDay: [] }

    const rows = data || []
    const totalRevenue = rows.reduce((s, r) => s + (r.final_amount || 0), 0)
    const totalDiscount = rows.reduce((s, r) => s + (r.discount || 0), 0)

    // Group by day
    const byDay = {}
    rows.forEach(r => {
      const day = r.sale_date?.slice(0, 10)
      if (!day) return
      byDay[day] = (byDay[day] || 0) + (r.final_amount || 0)
    })
    const salesByDay = Object.entries(byDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { totalRevenue, totalSales: rows.length, totalDiscount, salesByDay }
  },

  async getExpenseReport(period = 'month', customFrom = null, customTo = null) {
    const supabase = getSupabaseClient()
    const { from, to } = period === 'custom' ? { from: customFrom, to: customTo } : getDateRange(period)

    if (!supabase) {
      return {
        totalExpenses: 73000,
        byType: { material_purchase: 60000, courier: 2800, packaging: 3200, marketing: 5000, miscellaneous: 2000 },
      }
    }

    let query = supabase.from('expenses').select('type, amount, expense_date')
    if (from) query = query.gte('expense_date', from)
    if (to) query = query.lte('expense_date', to)

    const { data, error } = await query
    if (error) return { totalExpenses: 0, byType: {} }

    const rows = data || []
    const totalExpenses = rows.reduce((s, r) => s + (r.amount || 0), 0)
    const byType = {}
    rows.forEach(r => { byType[r.type] = (byType[r.type] || 0) + (r.amount || 0) })

    return { totalExpenses, byType }
  },

  async getProfitReport(period = 'month', customFrom = null, customTo = null) {
    const [salesReport, expenseReport] = await Promise.all([
      this.getSalesReport(period, customFrom, customTo),
      this.getExpenseReport(period, customFrom, customTo),
    ])

    const estimatedProfit = salesReport.totalRevenue - expenseReport.totalExpenses

    return {
      revenue: salesReport.totalRevenue,
      expenses: expenseReport.totalExpenses,
      estimatedProfit,
    }
  },

  async getInventoryReport() {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { totalProducts: 8, inStock: 5, lowStock: 2, outOfStock: 1 }
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, stock, status')

    if (error) return { totalProducts: 0, inStock: 0, lowStock: 0, outOfStock: 0 }

    const rows = data || []
    const totalProducts = rows.length
    const outOfStock = rows.filter(p => p.stock === 0 || p.status === 'out_of_stock').length
    const lowStock = rows.filter(p => p.stock > 0 && p.stock <= 5).length
    const inStock = totalProducts - outOfStock - lowStock

    return { totalProducts, inStock, lowStock, outOfStock }
  },

  async getCustomerReport(period = 'month', customFrom = null, customTo = null) {
    const supabase = getSupabaseClient()
    const { from, to } = period === 'custom' ? { from: customFrom, to: customTo } : getDateRange(period)

    if (!supabase) {
      return {
        totalCustomers: 5,
        topCustomers: [
          { customer_name: 'Priya Sharma', total: 89500, orders: 5 },
          { customer_name: 'Meena Iyer', total: 54999, orders: 3 },
        ],
      }
    }

    const { data: custData } = await supabase.from('customers').select('id', { count: 'exact' })
    const totalCustomers = custData?.length || 0

    let salesQuery = supabase
      .from('sales')
      .select('customer_name, final_amount')
      .eq('payment_status', PaymentStatus.PAID)

    if (from) salesQuery = salesQuery.gte('sale_date', from)
    if (to) salesQuery = salesQuery.lte('sale_date', to)

    const { data: salesData } = await salesQuery

    const customerMap = {}
    ;(salesData || []).forEach(s => {
      const name = s.customer_name || 'Unknown'
      if (!customerMap[name]) customerMap[name] = { customer_name: name, total: 0, orders: 0 }
      customerMap[name].total += s.final_amount || 0
      customerMap[name].orders += 1
    })

    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    return { totalCustomers, topCustomers }
  },
}
