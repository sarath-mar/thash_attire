import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import { MOCK_ORDERS } from '~/mock/orders.js'
import { PaginationDefaults } from '~/constants/app.js'

let mockOrders = structuredClone(MOCK_ORDERS)

export const OrderService = {
  async getAll(filters = {}) {
    const {
      page = PaginationDefaults.PAGE,
      limit = PaginationDefaults.ADMIN_LIMIT,
      search = '',
      orderStatus,
      paymentStatus,
      customerId,
      dateFrom,
      dateTo,
    } = filters

    const supabase = getSupabaseClient()
    if (!supabase) {
      let result = [...mockOrders]
      if (search) {
        const q = search.toLowerCase()
        result = result.filter(o =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.product_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q),
        )
      }
      if (orderStatus) result = result.filter(o => o.order_status === orderStatus)
      if (paymentStatus) result = result.filter(o => o.payment_status === paymentStatus)
      if (customerId) result = result.filter(o => o.customer_id === customerId)
      if (dateFrom) result = result.filter(o => o.order_date >= dateFrom)
      if (dateTo) result = result.filter(o => o.order_date <= dateTo)

      result.sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
      const total = result.length
      const from = (page - 1) * limit
      return { data: result.slice(from, from + limit), total }
    }

    let query = supabase.from('orders').select('*', { count: 'exact' }).order('order_date', { ascending: false })
    if (orderStatus) query = query.eq('order_status', orderStatus)
    if (paymentStatus) query = query.eq('payment_status', paymentStatus)
    if (customerId) query = query.eq('customer_id', customerId)
    if (search) query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
    if (dateFrom) query = query.gte('order_date', dateFrom)
    if (dateTo) query = query.lte('order_date', dateTo)

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) {
      console.warn('[OrderService] getAll failed, using mock:', error.message)
      return this.getAll({ ...filters, page, limit })
    }
    return { data: data || [], total: count || 0 }
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) return mockOrders.find(o => o.id === id) || null

    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
    if (error) return mockOrders.find(o => o.id === id) || null
    return data
  },

  async create(order) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const newOrder = {
        ...order,
        id: `ord-${Date.now()}`,
        order_number: order.order_number || `TA-2026-${String(mockOrders.length + 1).padStart(3, '0')}`,
        status_history: order.status_history || [],
        created_at: new Date().toISOString(),
      }
      mockOrders.unshift(newOrder)
      return newOrder
    }

    const { data, error } = await supabase.from('orders').insert(order).select().single()
    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, order) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = mockOrders.findIndex(o => o.id === id)
      if (idx !== -1) {
        mockOrders[idx] = { ...mockOrders[idx], ...order, updated_at: new Date().toISOString() }
        return mockOrders[idx]
      }
      return order
    }

    const { data, error } = await supabase.from('orders').update(order).eq('id', id).select().single()
    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async updateStatus(id, status, notes = '') {
    const order = await this.getById(id)
    if (!order) throw new Error('Order not found')

    const history = [...(order.status_history || [])]
    const now = new Date().toISOString()
    if (!history.find(h => h.status === status)) {
      history.push({ status, date: now, notes })
    }

    return this.update(id, { order_status: status, status_history: history })
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      mockOrders = mockOrders.filter(o => o.id !== id)
      return
    }

    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },

  async searchByPhone(phone) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return mockOrders.filter(o => o.customer_phone === phone)
    }

    const { data } = await supabase.from('orders').select('*').eq('customer_phone', phone)
    return data || []
  },
}
