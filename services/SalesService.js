import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import { PaymentStatus, SaleStatus } from '~/enums/index.js'

const MOCK_SALES = [
  {
    id: 'sale-001',
    customer_id: 'cust-001',
    customer_name: 'Priya Sharma',
    customer_phone: '9876543210',
    product_id: 'prod-001',
    product_name: 'Royal Zari Kanjivaram Silk Saree',
    quantity: 1,
    selling_price: 24999,
    discount: 0,
    final_amount: 24999,
    payment_method: 'upi',
    payment_status: 'paid',
    status: 'completed',
    sale_date: '2026-08-10T10:30:00Z',
    notes: '',
    created_at: '2026-08-10T10:30:00Z',
  },
  {
    id: 'sale-002',
    customer_id: 'cust-002',
    customer_name: 'Meena Iyer',
    customer_phone: '9845678901',
    product_id: 'prod-002',
    product_name: 'Hand-Embroidered Organza Anarkali Set',
    quantity: 1,
    selling_price: 18500,
    discount: 0,
    final_amount: 18500,
    payment_method: 'cash',
    payment_status: 'paid',
    status: 'completed',
    sale_date: '2026-08-09T14:00:00Z',
    notes: '',
    created_at: '2026-08-09T14:00:00Z',
  },
  {
    id: 'sale-003',
    customer_id: 'cust-003',
    customer_name: 'Divya Nair',
    customer_phone: '9123456789',
    product_id: 'prod-004',
    product_name: 'Chanderi Silk Handblock Printed Kurti',
    quantity: 2,
    selling_price: 8999,
    discount: 0,
    final_amount: 17998,
    payment_method: 'upi',
    payment_status: 'pending',
    status: 'pending',
    sale_date: '2026-08-08T11:15:00Z',
    notes: 'Will pay tomorrow',
    created_at: '2026-08-08T11:15:00Z',
  },
  {
    id: 'sale-004',
    customer_id: 'cust-004',
    customer_name: 'Lakshmi Reddy',
    customer_phone: '9654321098',
    product_id: 'prod-003',
    product_name: 'Intricate Velvet Bridal Lehenga Choli',
    quantity: 1,
    selling_price: 45000,
    discount: 0,
    final_amount: 45000,
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    status: 'completed',
    sale_date: '2026-08-07T09:45:00Z',
    notes: 'Bridal set',
    created_at: '2026-08-07T09:45:00Z',
  },
  {
    id: 'sale-005',
    customer_id: 'cust-005',
    customer_name: 'Anjali Krishnan',
    customer_phone: '9345678901',
    product_id: 'prod-007',
    product_name: 'Tissue Georgette Ruffled Saree',
    quantity: 1,
    selling_price: 12800,
    discount: 500,
    final_amount: 12300,
    payment_method: 'cash',
    payment_status: 'paid',
    status: 'completed',
    sale_date: '2026-08-06T16:30:00Z',
    notes: 'Festival discount applied',
    created_at: '2026-08-06T16:30:00Z',
  },
]

export const SalesService = {
  async getAll(filters = {}) {
    const { page = 1, limit = 20, paymentStatus, saleStatus, search, dateFrom, dateTo } = filters
    const supabase = getSupabaseClient()

    if (!supabase) {
      let result = [...MOCK_SALES]
      if (paymentStatus) result = result.filter(s => s.payment_status === paymentStatus)
      if (saleStatus) result = result.filter(s => s.status === saleStatus)
      if (search) {
        const q = search.toLowerCase()
        result = result.filter(s =>
          s.customer_name?.toLowerCase().includes(q) ||
          s.product_name?.toLowerCase().includes(q),
        )
      }
      result.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))
      const total = result.length
      const from = (page - 1) * limit
      return { data: result.slice(from, from + limit), total }
    }

    let query = supabase
      .from('sales')
      .select('*', { count: 'exact' })
      .order('sale_date', { ascending: false })

    if (paymentStatus) query = query.eq('payment_status', paymentStatus)
    if (saleStatus) query = query.eq('status', saleStatus)
    if (search) query = query.or(`customer_name.ilike.%${search}%,product_name.ilike.%${search}%`)
    if (dateFrom) query = query.gte('sale_date', dateFrom)
    if (dateTo) query = query.lte('sale_date', dateTo)

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) {
      console.warn('[SalesService] getAll failed, using mock:', error.message)
      return { data: MOCK_SALES, total: MOCK_SALES.length }
    }
    return { data: data || [], total: count || 0 }
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_SALES.find(s => s.id === id) || null

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return MOCK_SALES.find(s => s.id === id) || null
    return data
  },

  async create(sale) {
    const supabase = getSupabaseClient()
    // Calculate final_amount
    const subtotal = (sale.quantity || 1) * (sale.selling_price || 0)
    const finalAmount = subtotal - (sale.discount || 0)
    const payload = {
      ...sale,
      final_amount: finalAmount,
      status: sale.status || SaleStatus.COMPLETED,
    }

    if (!supabase) {
      const newSale = { ...payload, id: 'sale-' + Date.now(), created_at: new Date().toISOString() }
      MOCK_SALES.unshift(newSale)
      return newSale
    }

    const { data, error } = await supabase
      .from('sales')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))

    // Update customer totals
    if (sale.customer_id) {
      try {
        const custRes = await supabase
          .from('customers')
          .select('total_orders, total_amount')
          .eq('id', sale.customer_id)
          .single()

        if (!custRes.error && custRes.data) {
          await supabase.from('customers').update({
            total_orders: (custRes.data.total_orders || 0) + 1,
            total_amount: (custRes.data.total_amount || 0) + finalAmount,
            updated_at: new Date().toISOString(),
          }).eq('id', sale.customer_id)
        }
      } catch (err) {
        console.warn('[SalesService] Failed to update customer totals:', err.message)
      }
    }

    return data
  },

  async updatePaymentStatus(id, paymentStatus) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_SALES.findIndex(s => s.id === id)
      if (idx !== -1) MOCK_SALES[idx].payment_status = paymentStatus
      return
    }

    const { error } = await supabase
      .from('sales')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(handleSupabaseError(error))
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_SALES.findIndex(s => s.id === id)
      if (idx !== -1) MOCK_SALES.splice(idx, 1)
      return
    }

    const { error } = await supabase.from('sales').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },

  async getRevenueByPeriod(period = 'month') {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const now = new Date()
    let dateFrom
    if (period === 'week') dateFrom = new Date(now - 7 * 86400000).toISOString()
    else if (period === 'month') dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    else if (period === 'year') dateFrom = new Date(now.getFullYear(), 0, 1).toISOString()

    let query = supabase
      .from('sales')
      .select('sale_date, final_amount')
      .eq('payment_status', PaymentStatus.PAID)
      .order('sale_date', { ascending: true })

    if (dateFrom) query = query.gte('sale_date', dateFrom)

    const { data, error } = await query
    if (error) return []
    return data || []
  },
}
