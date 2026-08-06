import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const BannerService = {
  async getActive() {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },

  async getAll() {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },

  async create(banner) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('banners')
      .insert(banner)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, banner) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('banners')
      .update(banner)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
