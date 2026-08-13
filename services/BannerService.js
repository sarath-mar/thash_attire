import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const BannerService = {
  async getActive() {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },

  async getAll() {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },

  async create(banner) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

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
    if (!supabase) throw new Error('Supabase client not initialized')

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
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
