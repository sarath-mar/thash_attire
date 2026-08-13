import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const CustomerService = {
  async getAll(filters = {}) {
    const { search = '', page = 1, limit = 20 } = filters
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

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
    if (error) throw new Error(handleSupabaseError(error))
    
    return { data: data || [], total: count || 0 }
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async getPurchaseHistory(customerId) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('sales')
      .select('id, product_name, quantity, selling_price, final_amount as total_amount, sale_date, payment_status')
      .eq('customer_id', customerId)
      .order('sale_date', { ascending: false })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },

  async create(customer) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

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
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
