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

    const { data, error } = await supabase.rpc('record_material_purchase', {
      p_material_id: purchase.material_id,
      p_quantity: quantity,
      p_unit_cost: unitCost,
      p_total_amount: totalCost,
      p_purchase_date: purchase.purchase_date || new Date().toISOString(),
      p_supplier: purchase.supplier || null,
      p_unit: purchase.unit || null,
      p_notes: purchase.notes || null,
    })

    if (error) throw new Error(handleSupabaseError(error))

    // RPC returns { id } — fetch full record with material join so the list shows correct data
    const newId = data?.id
    if (!newId) return data

    const { data: full, error: fetchError } = await supabase
      .from('material_purchases')
      .select('*, materials(id, name, unit)')
      .eq('id', newId)
      .single()

    if (fetchError) throw new Error(handleSupabaseError(fetchError))
    return { ...full, material_name: full.materials?.name || '' }
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('material_purchases').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
