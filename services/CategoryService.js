import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const CategoryService = {
  async getAll() {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async create(category) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, category) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
