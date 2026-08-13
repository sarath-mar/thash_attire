import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const ExpenseService = {
  async getAll(filters = {}) {
    const { page = 1, limit = 20, type, search, dateFrom, dateTo } = filters
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })

    if (type) query = query.eq('category', type) // Note: schema uses 'category', not 'type'
    if (search) query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`)
    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(handleSupabaseError(error))
    
    return { data: data || [], total: count || 0 }
  },

  async create(expense) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

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
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },

  async getTotalByType(dateFrom, dateTo) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase.from('expenses').select('category, amount')
    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    const { data, error } = await query
    if (error) throw new Error(handleSupabaseError(error))

    const grouped = {}
    ;(data || []).forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + (Number(e.amount) || 0)
    })
    return grouped
  },
}
