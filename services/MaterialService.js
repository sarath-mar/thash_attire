import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

const MATERIAL_WRITE_FIELDS = [
  'name',
  'type',
  'supplier',
  'unit',
  'min_stock_level',
  'notes',
]

function mapMaterial(m) {
  if (!m) return m
  return {
    ...m,
    current_stock: m.stock,
    total_inventory_value: (Number(m.stock) || 0) * (Number(m.avg_unit_cost) || 0),
  }
}

function sanitizeMaterialPayload(material) {
  const payload = {}
  for (const key of MATERIAL_WRITE_FIELDS) {
    if (material[key] !== undefined) payload[key] = material[key]
  }
  if (payload.min_stock_level != null) {
    payload.min_stock_level = Number(payload.min_stock_level) || 0
  }
  if (payload.supplier === '') payload.supplier = null
  if (payload.notes === '') payload.notes = null
  return payload
}

export const MaterialService = {
  mapMaterial,

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

    return (data || []).map(mapMaterial)
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
    return mapMaterial(data)
  },

  async create(material) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('materials')
      .insert(sanitizeMaterialPayload(material))
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return mapMaterial(data)
  },

  async update(id, material) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('materials')
      .update(sanitizeMaterialPayload(material))
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return mapMaterial(data)
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
