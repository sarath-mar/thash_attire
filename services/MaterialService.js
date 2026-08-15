import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const MaterialService = {
  async getAll(search = '', type = null) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase
      .from('materials')
      .select('*')
      .order('name', { ascending: true })

    if (search) {
      query = query.or(`name.ilike.%${search}%,supplier.ilike.%${search}%`)
    }
    if (type) query = query.eq('type', type)

    const { data, error } = await query
    if (error) throw new Error(handleSupabaseError(error))
    
    return (data || []).map(m => ({
      ...m,
      current_stock: m.stock,
      total_inventory_value: (m.stock || 0) * (m.avg_unit_cost || 0),
    }))
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async create(material) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('materials')
      .insert(material)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, material) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('materials')
      .update(material)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
