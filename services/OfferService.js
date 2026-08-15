import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const OfferService = {
  async getAll(filters = {}) {
    const { page = 1, limit = 20, status, search } = filters
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase
      .from('offers')
      .select('*, offer_items(*, product:products(*))', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('name', `%${search}%`)

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
      .from('offers')
      .select('*, offer_items(*, product:products(*))')
      .eq('id', id)
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async create(offer, items) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    // Since we don't have a transaction RPC for offer creation yet, we'll do it sequentially
    // Create offer
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .insert(offer)
      .select()
      .single()

    if (offerError) throw new Error(handleSupabaseError(offerError))

    // Create offer items
    if (items && items.length > 0) {
      const itemsPayload = items.map(item => ({
        offer_id: offerData.id,
        product_id: item.product_id,
        quantity: item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('offer_items')
        .insert(itemsPayload)

      if (itemsError) {
        // Rollback attempt
        await supabase.from('offers').delete().eq('id', offerData.id)
        throw new Error(handleSupabaseError(itemsError))
      }
    }

    return this.getById(offerData.id)
  },

  async update(id, offer, items) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error: updateError } = await supabase
      .from('offers')
      .update(offer)
      .eq('id', id)

    if (updateError) throw new Error(handleSupabaseError(updateError))

    if (items) {
      // Delete old items
      await supabase.from('offer_items').delete().eq('offer_id', id)
      
      // Insert new items
      if (items.length > 0) {
        const itemsPayload = items.map(item => ({
          offer_id: id,
          product_id: item.product_id,
          quantity: item.quantity
        }))

        const { error: itemsError } = await supabase
          .from('offer_items')
          .insert(itemsPayload)

        if (itemsError) throw new Error(handleSupabaseError(itemsError))
      }
    }

    return this.getById(id)
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('offers').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  }
}
