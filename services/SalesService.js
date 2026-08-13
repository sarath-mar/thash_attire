import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import { PaymentStatus, SaleStatus } from '~/enums/index.js'

export const SalesService = {
  async getAll(filters = {}) {
    const { page = 1, limit = 20, paymentStatus, saleStatus, search, dateFrom, dateTo } = filters
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase
      .from('sales')
      .select('*', { count: 'exact' })
      .order('sale_date', { ascending: false })

    if (paymentStatus) query = query.eq('payment_status', paymentStatus)
    if (saleStatus) query = query.eq('status', saleStatus)
    if (search) query = query.or(`customer_name.ilike.%${search}%,product_name.ilike.%${search}%,order_number.ilike.%${search}%`)
    if (dateFrom) query = query.gte('sale_date', dateFrom)
    if (dateTo) query = query.lte('sale_date', dateTo)

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(handleSupabaseError(error))
    
    return { data: data || [], total: count || 0 }
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async create(sale) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    // Calculate final_amount
    const subtotal = (sale.quantity || 1) * (sale.selling_price || 0)
    const finalAmount = subtotal - (sale.discount || 0)
    
    const payload = {
      ...sale,
      final_amount: finalAmount,
      status: sale.status || SaleStatus.COMPLETED,
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
          }).eq('id', sale.customer_id)
        }
      } catch (err) {
        console.warn('[SalesService] Failed to update customer totals:', err.message)
      }
    }

    return data
  },

  async update(id, sale) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('sales')
      .update(sale)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async updatePaymentStatus(id, paymentStatus) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase
      .from('sales')
      .update({ payment_status: paymentStatus })
      .eq('id', id)

    if (error) throw new Error(handleSupabaseError(error))
  },

  async updateOrderStatus(id, status, statusHistory) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase
      .from('sales')
      .update({ status: status, status_history: statusHistory })
      .eq('id', id)

    if (error) throw new Error(handleSupabaseError(error))
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('sales').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },

  async getRevenueByPeriod(period = 'month') {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

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
    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },
}
