import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const ReviewService = {
  async getActive() {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },

  async getAll() {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },

  async create(review) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, review) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('reviews')
      .update(review)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
