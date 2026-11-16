import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import { PaymentStatus } from '~/enums/paymentStatus.js'
import { OrderStatus } from '~/enums/orderStatus.js'

function localDayKey(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function saleCost(sale) {
  return (sale.sale_items || []).reduce(
    (sum, item) => sum + (Number(item.cost_price) || 0) * (Number(item.quantity) || 0),
    0,
  )
}

function buildPaidChart(sales) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const points = []
  for (let offset = 364; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const key = localDayKey(date)
    points.push({ date: key, revenue: 0, cost: 0 })
  }
  const index = new Map(points.map((point, position) => [point.date, position]))
  for (const sale of sales) {
    const position = index.get(localDayKey(sale.sale_date || sale.order_date))
    if (position === undefined) continue
    points[position].revenue += Number(sale.final_amount) || 0
    points[position].cost += saleCost(sale)
  }
  return points
}

export const DashboardService = {
  async getSummary() {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const [productsRes, customersRes, salesRes, pendingRes, expensesRes] = await Promise.all([
      supabase.from('products').select('id, stock', { count: 'exact' }),
      supabase.from('customers').select('id', { count: 'exact' }),
      supabase
        .from('sales')
        .select('final_amount, sale_date, order_date, status, sale_items(quantity, cost_price)')
        .eq('payment_status', PaymentStatus.PAID),
      supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .in('payment_status', [PaymentStatus.PENDING, PaymentStatus.PARTIAL])
        .neq('status', OrderStatus.CANCELLED),
      supabase.from('expenses').select('amount'),
    ])

    if (salesRes.error) throw new Error(handleSupabaseError(salesRes.error))
    if (pendingRes.error) throw new Error(handleSupabaseError(pendingRes.error))

    const paidSales = salesRes.data || []
    const now = new Date()
    const todayKey = localDayKey(now)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    let todayRevenue = 0
    let monthRevenue = 0
    let monthProductCost = 0
    let totalRevenue = 0
    const statusCounts = {
      [OrderStatus.ORDER_RECEIVED]: 0,
      [OrderStatus.PAYMENT_RECEIVED]: 0,
      [OrderStatus.SENT_TO_STITCHING]: 0,
      [OrderStatus.STITCHING_COMPLETED]: 0,
      [OrderStatus.PACKED]: 0,
      [OrderStatus.HANDED_TO_COURIER]: 0,
      [OrderStatus.DELIVERED]: 0,
      [OrderStatus.COMPLETED]: 0,
    }

    for (const sale of paidSales) {
      const amount = Number(sale.final_amount) || 0
      const cost = saleCost(sale)
      const when = new Date(sale.sale_date || sale.order_date)
      totalRevenue += amount
      if (localDayKey(when) === todayKey) todayRevenue += amount
      if (!Number.isNaN(when.getTime()) && when >= monthStart) {
        monthRevenue += amount
        monthProductCost += cost
      }
      if (statusCounts[sale.status] !== undefined) statusCounts[sale.status] += 1
    }

    const monthGrossProfit = monthRevenue - monthProductCost
    const totalProducts = productsRes.count || 0
    const totalStock = (productsRes.data || []).reduce((sum, product) => sum + (product.stock || 0), 0)
    const totalCustomers = customersRes.count || 0
    const totalExpenses = (expensesRes.data || []).reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

    return {
      totalProducts,
      totalStock,
      totalCustomers,
      totalSales: paidSales.length,
      totalRevenue,
      todayRevenue,
      monthRevenue,
      monthProductCost,
      monthGrossProfit,
      monthProfitMargin: monthRevenue ? Math.round((monthGrossProfit / monthRevenue) * 100) : 0,
      ordersNew: (statusCounts[OrderStatus.ORDER_RECEIVED] || 0) + (statusCounts[OrderStatus.PAYMENT_RECEIVED] || 0),
      ordersPaymentPending: pendingRes.count || 0,
      ordersInStitching: statusCounts[OrderStatus.SENT_TO_STITCHING] || 0,
      ordersReadyToShip: (statusCounts[OrderStatus.STITCHING_COMPLETED] || 0) + (statusCounts[OrderStatus.PACKED] || 0),
      ordersShipped: statusCounts[OrderStatus.HANDED_TO_COURIER] || 0,
      ordersDelivered: (statusCounts[OrderStatus.DELIVERED] || 0) + (statusCounts[OrderStatus.COMPLETED] || 0),
      chartData: buildPaidChart(paidSales),
      totalExpenses,
      estimatedProfit: totalRevenue - totalExpenses,
    }
  },

  async getRecentSales(limit = 5) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('sales')
      .select('id, order_number, customer_name, product_name, final_amount, payment_status, status, sale_date')
      .eq('payment_status', PaymentStatus.PAID)
      .order('sale_date', { ascending: false })
      .limit(limit)

    if (error) throw new Error(handleSupabaseError(error))

    return (data || []).map(sale => ({
      ...sale,
      total_amount: sale.final_amount,
      order_status: sale.status,
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
      .from('sale_items')
      .select('product_id, product_name, quantity, selling_price, sales!inner(payment_status)')
      .eq('sales.payment_status', PaymentStatus.PAID)
      .limit(1000)

    if (error) throw new Error(handleSupabaseError(error))

    // Group and sum by product
    const productMap = {}
    for (const item of data || []) {
      const pid = item.product_id
      if (!productMap[pid]) {
        productMap[pid] = {
          id: pid,
          name: item.product_name || 'Unknown',
          sku: '',
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
