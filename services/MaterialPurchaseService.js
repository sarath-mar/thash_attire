import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

export const MaterialPurchaseService = {
  async getAll(materialId = null, search = '') {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase
      .from('material_purchases')
      .select('*, materials(id, name, unit)')
      .order('purchase_date', { ascending: false })

    if (materialId) query = query.eq('material_id', materialId)
    if (search) query = query.or(`supplier.ilike.%${search}%`)

    const { data, error } = await query
    if (error) throw new Error(handleSupabaseError(error))
    
    return (data || []).map(p => ({ ...p, material_name: p.materials?.name || '' }))
  },

  async create(purchase) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const totalCost = Number(purchase.total_amount) || 0
    const quantity = Number(purchase.quantity) || 0
    const unitCost = quantity > 0 ? totalCost / quantity : 0
    const payload = { ...purchase, total_amount: totalCost, unit_cost: unitCost }

    const { data, error } = await supabase
      .from('material_purchases')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('material_purchases').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
