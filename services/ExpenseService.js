import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

const MOCK_EXPENSES = [
  {
    id: 'exp-001',
    title: 'Silk Fabric Purchase - Jan Batch',
    type: 'material_purchase',
    amount: 60000,
    expense_date: '2026-01-10',
    description: 'Purchased Kanjivaram silk for new collection',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'exp-002',
    title: 'Courier charges - January',
    type: 'courier',
    amount: 2800,
    expense_date: '2026-01-31',
    description: 'Delivery charges for 14 orders',
    created_at: '2026-01-31T10:00:00Z',
    updated_at: '2026-01-31T10:00:00Z',
  },
  {
    id: 'exp-003',
    title: 'Packaging materials',
    type: 'packaging',
    amount: 3200,
    expense_date: '2026-02-05',
    description: 'Boxes, tissue paper, thank-you cards',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-05T10:00:00Z',
  },
  {
    id: 'exp-004',
    title: 'Instagram promotions',
    type: 'marketing',
    amount: 5000,
    expense_date: '2026-02-10',
    description: 'Paid promotion for new collection launch',
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'exp-005',
    title: 'Electricity bill',
    type: 'miscellaneous',
    amount: 2000,
    expense_date: '2026-02-15',
    description: 'Monthly electricity for workspace',
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
]

export const ExpenseService = {
  async getAll(filters = {}) {
    const { page = 1, limit = 20, type, search, dateFrom, dateTo } = filters
    const supabase = getSupabaseClient()

    if (!supabase) {
      let result = [...MOCK_EXPENSES]
      if (type) result = result.filter(e => e.type === type)
      if (search) {
        const q = search.toLowerCase()
        result = result.filter(e => e.title.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q))
      }
      if (dateFrom) result = result.filter(e => e.expense_date >= dateFrom)
      if (dateTo) result = result.filter(e => e.expense_date <= dateTo)
      result.sort((a, b) => b.expense_date.localeCompare(a.expense_date))
      const total = result.length
      const from = (page - 1) * limit
      return { data: result.slice(from, from + limit), total }
    }

    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .order('expense_date', { ascending: false })

    if (type) query = query.eq('type', type)
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    if (dateFrom) query = query.gte('expense_date', dateFrom)
    if (dateTo) query = query.lte('expense_date', dateTo)

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) {
      console.warn('[ExpenseService] getAll failed, using mock:', error.message)
      return { data: MOCK_EXPENSES, total: MOCK_EXPENSES.length }
    }
    return { data: data || [], total: count || 0 }
  },

  async create(expense) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const newExp = { ...expense, id: 'exp-' + Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      MOCK_EXPENSES.unshift(newExp)
      return newExp
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, expense) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_EXPENSES.findIndex(e => e.id === id)
      if (idx !== -1) {
        MOCK_EXPENSES[idx] = { ...MOCK_EXPENSES[idx], ...expense, updated_at: new Date().toISOString() }
        return MOCK_EXPENSES[idx]
      }
      return expense
    }

    const { data, error } = await supabase
      .from('expenses')
      .update({ ...expense, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_EXPENSES.findIndex(e => e.id === id)
      if (idx !== -1) MOCK_EXPENSES.splice(idx, 1)
      return
    }

    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },

  async getTotalByType(dateFrom, dateTo) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const grouped = {}
      MOCK_EXPENSES.forEach(e => {
        grouped[e.type] = (grouped[e.type] || 0) + e.amount
      })
      return grouped
    }

    let query = supabase.from('expenses').select('type, amount')
    if (dateFrom) query = query.gte('expense_date', dateFrom)
    if (dateTo) query = query.lte('expense_date', dateTo)

    const { data, error } = await query
    if (error) return {}

    const grouped = {}
    ;(data || []).forEach(e => {
      grouped[e.type] = (grouped[e.type] || 0) + (e.amount || 0)
    })
    return grouped
  },
}
