import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

const MOCK_PURCHASES = [
  {
    id: 'mp-001',
    material_id: 'mat-001',
    material_name: 'Kanjivaram Silk',
    supplier: 'Silk Traders India',
    purchase_date: '2026-01-10',
    quantity: 50,
    unit: 'meter',
    unit_cost: 1200,
    total_cost: 60000,
    notes: 'Initial stock purchase',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'mp-002',
    material_id: 'mat-002',
    material_name: 'Georgette Fabric',
    supplier: 'Mumbai Textile Hub',
    purchase_date: '2026-01-12',
    quantity: 30,
    unit: 'meter',
    unit_cost: 350,
    total_cost: 10500,
    notes: '',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'mp-003',
    material_id: 'mat-003',
    material_name: 'Zari Thread',
    supplier: 'Gold Thread Co.',
    purchase_date: '2026-01-14',
    quantity: 10,
    unit: 'roll',
    unit_cost: 800,
    total_cost: 8000,
    notes: 'For bridal orders',
    created_at: '2026-01-14T10:00:00Z',
  },
]

export const MaterialPurchaseService = {
  async getAll(materialId = null, search = '') {
    const supabase = getSupabaseClient()
    if (!supabase) {
      let result = [...MOCK_PURCHASES]
      if (materialId) result = result.filter(p => p.material_id === materialId)
      if (search) {
        const q = search.toLowerCase()
        result = result.filter(p => p.material_name?.toLowerCase().includes(q) || (p.supplier || '').toLowerCase().includes(q))
      }
      return result
    }

    let query = supabase
      .from('material_purchases')
      .select('*, materials(id, name, unit)')
      .order('purchase_date', { ascending: false })

    if (materialId) query = query.eq('material_id', materialId)
    if (search) query = query.or(`supplier.ilike.%${search}%`)

    const { data, error } = await query
    if (error) {
      console.warn('[MaterialPurchaseService] getAll failed, using mock:', error.message)
      return [...MOCK_PURCHASES]
    }
    return (data || []).map(p => ({ ...p, material_name: p.materials?.name || '' }))
  },

  async create(purchase) {
    const supabase = getSupabaseClient()
    const totalCost = (purchase.quantity || 0) * (purchase.unit_cost || 0)
    const payload = { ...purchase, total_cost: totalCost }

    if (!supabase) {
      const newP = {
        ...payload,
        id: 'mp-' + Date.now(),
        material_name: purchase.material_name || '',
        created_at: new Date().toISOString(),
      }
      MOCK_PURCHASES.unshift(newP)
      return newP
    }

    const { data, error } = await supabase
      .from('material_purchases')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))

    // Update material quantity
    try {
      const current = await supabase
        .from('materials')
        .select('quantity')
        .eq('id', purchase.material_id)
        .single()

      if (!current.error && current.data) {
        const newQty = (current.data.quantity || 0) + (purchase.quantity || 0)
        await supabase
          .from('materials')
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', purchase.material_id)
      }
    } catch (err) {
      console.warn('[MaterialPurchaseService] Failed to update material quantity:', err.message)
    }

    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_PURCHASES.findIndex(p => p.id === id)
      if (idx !== -1) MOCK_PURCHASES.splice(idx, 1)
      return
    }

    const { error } = await supabase.from('material_purchases').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
