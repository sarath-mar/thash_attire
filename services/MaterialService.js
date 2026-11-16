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

async function countRelatedRows(supabase, table, column, id) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(column, id)

  if (error) throw new Error(handleSupabaseError(error))
  return count || 0
}

function formatStockAmount(stock) {
  const value = Number(stock)
  if (!Number.isFinite(value)) return '0'
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
}

function materialDeleteBlockMessage({ recipes, purchases, movements, stock, unit }) {
  const parts = []

  if (recipes) {
    parts.push(recipes === 1
      ? 'It is used in a product recipe, so that product would lose this material.'
      : `It is used in ${recipes} product recipes, so those products would lose this material.`)
  }
  if (stock > 0) {
    parts.push(`${formatStockAmount(stock)} ${unit || 'units'} is still in stock.`)
  }
  if (purchases || movements) {
    parts.push('It has purchase or stock history, which would be erased with it.')
  }

  if (!parts.length) return ''
  return `This material can't be deleted. ${parts.join(' ')}`
}

function materialDeleteErrorMessage(error) {
  const raw = String(error?.message || '')
  if (/product_materials/i.test(raw)) {
    return "This material can't be deleted. It is used in a product recipe, so that product would lose this material."
  }
  if (/material_purchases|material_stock_movements/i.test(raw)) {
    return "This material can't be deleted. It has purchase or stock history, which would be erased with it."
  }
  return handleSupabaseError(error)
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
    if (!id) throw new Error('Select a material before deleting.')

    const material = await this.getById(id)
    const [recipes, purchases, movements] = await Promise.all([
      countRelatedRows(supabase, 'product_materials', 'material_id', id),
      countRelatedRows(supabase, 'material_purchases', 'material_id', id),
      countRelatedRows(supabase, 'material_stock_movements', 'material_id', id),
    ])

    const blockMessage = materialDeleteBlockMessage({
      recipes,
      purchases,
      movements,
      stock: Number(material.stock ?? material.current_stock) || 0,
      unit: material.unit,
    })
    if (blockMessage) throw new Error(blockMessage)

    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (error) throw new Error(materialDeleteErrorMessage(error))
  },
}
