import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

const MOCK_CUSTOMERS = [
  {
    id: 'cust-001',
    name: 'Priya Sharma',
    phone: '9876543210',
    address: 'Chennai, Tamil Nadu',
    notes: 'Regular customer',
    total_orders: 5,
    total_amount: 89500,
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'cust-002',
    name: 'Meena Iyer',
    phone: '9845678901',
    address: 'Coimbatore, Tamil Nadu',
    notes: 'Prefers silk sarees',
    total_orders: 3,
    total_amount: 54999,
    created_at: '2026-01-08T10:00:00Z',
    updated_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 'cust-003',
    name: 'Divya Nair',
    phone: '9123456789',
    address: 'Kochi, Kerala',
    notes: '',
    total_orders: 2,
    total_amount: 35998,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'cust-004',
    name: 'Lakshmi Reddy',
    phone: '9654321098',
    address: 'Hyderabad, Telangana',
    notes: 'Wedding shopping',
    total_orders: 1,
    total_amount: 45000,
    created_at: '2026-01-12T10:00:00Z',
    updated_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'cust-005',
    name: 'Anjali Krishnan',
    phone: '9345678901',
    address: 'Trivandrum, Kerala',
    notes: '',
    total_orders: 4,
    total_amount: 51200,
    created_at: '2026-01-14T10:00:00Z',
    updated_at: '2026-01-14T10:00:00Z',
  },
]

const MOCK_PURCHASES = {
  'cust-001': [
    { id: 'sale-001', product_name: 'Royal Zari Kanjivaram Silk Saree', quantity: 1, selling_price: 24999, total_amount: 24999, sale_date: '2026-08-10T10:30:00Z', payment_status: 'paid' },
    { id: 'sale-004', product_name: 'Chanderi Silk Handblock Printed Kurti', quantity: 2, selling_price: 8999, total_amount: 17998, sale_date: '2026-06-15T10:00:00Z', payment_status: 'paid' },
  ],
  'cust-002': [
    { id: 'sale-002', product_name: 'Hand-Embroidered Organza Anarkali Set', quantity: 1, selling_price: 18500, total_amount: 18500, sale_date: '2026-08-09T14:00:00Z', payment_status: 'paid' },
  ],
}

export const CustomerService = {
  async getAll(filters = {}) {
    const { search = '', page = 1, limit = 20 } = filters
    const supabase = getSupabaseClient()

    if (!supabase) {
      let result = [...MOCK_CUSTOMERS]
      if (search) {
        const q = search.toLowerCase()
        result = result.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      }
      const total = result.length
      const from = (page - 1) * limit
      return { data: result.slice(from, from + limit), total }
    }

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) {
      console.warn('[CustomerService] getAll failed, using mock:', error.message)
      return { data: MOCK_CUSTOMERS, total: MOCK_CUSTOMERS.length }
    }
    return { data: data || [], total: count || 0 }
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_CUSTOMERS.find(c => c.id === id) || null

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return MOCK_CUSTOMERS.find(c => c.id === id) || null
    return data
  },

  async getPurchaseHistory(customerId) {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_PURCHASES[customerId] || []

    const { data, error } = await supabase
      .from('sales')
      .select('id, product_name, quantity, selling_price, total_amount, sale_date, payment_status')
      .eq('customer_id', customerId)
      .order('sale_date', { ascending: false })

    if (error) return MOCK_PURCHASES[customerId] || []
    return data || []
  },

  async create(customer) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const newCust = { ...customer, id: 'cust-' + Date.now(), total_orders: 0, total_amount: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      MOCK_CUSTOMERS.push(newCust)
      return newCust
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, customer) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_CUSTOMERS.findIndex(c => c.id === id)
      if (idx !== -1) {
        MOCK_CUSTOMERS[idx] = { ...MOCK_CUSTOMERS[idx], ...customer, updated_at: new Date().toISOString() }
        return MOCK_CUSTOMERS[idx]
      }
      return customer
    }

    const { data, error } = await supabase
      .from('customers')
      .update({ ...customer, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_CUSTOMERS.findIndex(c => c.id === id)
      if (idx !== -1) MOCK_CUSTOMERS.splice(idx, 1)
      return
    }

    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
