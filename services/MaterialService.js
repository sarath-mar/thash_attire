import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

const MOCK_MATERIALS = [
  {
    id: 'mat-001',
    name: 'Kanjivaram Silk',
    supplier: 'Silk Traders India',
    quantity: 45,
    unit: 'meter',
    purchase_price: 1200,
    notes: 'Premium quality silk for sarees',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'mat-002',
    name: 'Georgette Fabric',
    supplier: 'Mumbai Textile Hub',
    quantity: 30,
    unit: 'meter',
    purchase_price: 350,
    notes: 'Lightweight fabric for dupattas',
    created_at: '2026-01-12T10:00:00Z',
    updated_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'mat-003',
    name: 'Zari Thread',
    supplier: 'Gold Thread Co.',
    quantity: 10,
    unit: 'roll',
    purchase_price: 800,
    notes: 'Pure gold zari for embroidery',
    created_at: '2026-01-14T10:00:00Z',
    updated_at: '2026-01-14T10:00:00Z',
  },
  {
    id: 'mat-004',
    name: 'Organza',
    supplier: 'Delhi Fabric House',
    quantity: 20,
    unit: 'meter',
    purchase_price: 280,
    notes: 'For anarkali sets',
    created_at: '2026-01-16T10:00:00Z',
    updated_at: '2026-01-16T10:00:00Z',
  },
  {
    id: 'mat-005',
    name: 'Velvet Fabric',
    supplier: 'Surat Velvet Mills',
    quantity: 5,
    unit: 'meter',
    purchase_price: 950,
    notes: 'For bridal lehengas',
    created_at: '2026-01-18T10:00:00Z',
    updated_at: '2026-01-18T10:00:00Z',
  },
]

export const MaterialService = {
  async getAll(search = '') {
    const supabase = getSupabaseClient()
    if (!supabase) {
      if (search) {
        const q = search.toLowerCase()
        return MOCK_MATERIALS.filter(m => m.name.toLowerCase().includes(q) || (m.supplier || '').toLowerCase().includes(q))
      }
      return [...MOCK_MATERIALS]
    }

    let query = supabase
      .from('materials')
      .select('*')
      .order('name', { ascending: true })

    if (search) {
      query = query.or(`name.ilike.%${search}%,supplier.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) {
      console.warn('[MaterialService] getAll failed, using mock:', error.message)
      return [...MOCK_MATERIALS]
    }
    return data || []
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_MATERIALS.find(m => m.id === id) || null

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return MOCK_MATERIALS.find(m => m.id === id) || null
    return data
  },

  async create(material) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const newMat = { ...material, id: 'mat-' + Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      MOCK_MATERIALS.push(newMat)
      return newMat
    }

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
    if (!supabase) {
      const idx = MOCK_MATERIALS.findIndex(m => m.id === id)
      if (idx !== -1) {
        MOCK_MATERIALS[idx] = { ...MOCK_MATERIALS[idx], ...material, updated_at: new Date().toISOString() }
        return MOCK_MATERIALS[idx]
      }
      return material
    }

    const { data, error } = await supabase
      .from('materials')
      .update({ ...material, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async adjustQuantity(id, delta) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_MATERIALS.findIndex(m => m.id === id)
      if (idx !== -1) {
        MOCK_MATERIALS[idx].quantity = Math.max(0, (MOCK_MATERIALS[idx].quantity || 0) + delta)
        MOCK_MATERIALS[idx].updated_at = new Date().toISOString()
      }
      return
    }

    const current = await this.getById(id)
    if (!current) throw new Error('Material not found')

    const newQty = Math.max(0, (current.quantity || 0) + delta)
    const { error } = await supabase
      .from('materials')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(handleSupabaseError(error))
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_MATERIALS.findIndex(m => m.id === id)
      if (idx !== -1) MOCK_MATERIALS.splice(idx, 1)
      return
    }

    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
