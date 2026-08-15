import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import { ProductStatus } from '~/enums/productStatus.js'
import { PaginationDefaults } from '~/constants/app.js'

const PRODUCT_UI_ONLY_FIELDS = [
  'materials',
  'createInitialShowcaseSample',
  'showcaseStitchingCost',
  'video',
  'categories',
  'product_materials',
  'initial_sample_created',
]

function mapProductMaterials(rows = []) {
  return rows.map((pm) => ({
    material_id: pm.material_id,
    name: pm.materials?.name || '',
    quantity: Number(pm.quantity_required) || 0,
    unit: pm.materials?.unit || '',
    unit_cost: Number(pm.materials?.avg_unit_cost) || 0,
    available_stock: Number(pm.materials?.stock) || 0,
  }))
}

function mapProduct(data) {
  if (!data) return data
  const materials = mapProductMaterials(data.product_materials || [])
  const { product_materials, ...rest } = data
  return {
    ...rest,
    materials,
    video: rest.videos?.[0] || null,
    stitching_cost: Number(rest.stitching_cost) || 0,
    packaging_cost: Number(rest.packaging_cost) || 0,
    other_cost: Number(rest.other_cost) || 0,
    low_stock_threshold: Number(rest.low_stock_threshold) || 5,
    target_margin: Number(rest.target_margin) || 40,
  }
}

function buildProductPayload(product) {
  const payload = { ...product }

  if (payload.video !== undefined) {
    payload.videos = payload.video ? [payload.video] : (payload.videos || [])
  }
  if (payload.showcaseStitchingCost !== undefined) {
    payload.showcase_stitching_cost = payload.showcaseStitchingCost
  }

  for (const key of PRODUCT_UI_ONLY_FIELDS) {
    delete payload[key]
  }

  // Never overwrite id / timestamps from client accidentally on create
  delete payload.id
  delete payload.created_at
  delete payload.updated_at

  if (payload.stitching_cost != null) payload.stitching_cost = Number(payload.stitching_cost) || 0
  if (payload.packaging_cost != null) payload.packaging_cost = Number(payload.packaging_cost) || 0
  if (payload.other_cost != null) payload.other_cost = Number(payload.other_cost) || 0
  if (payload.low_stock_threshold != null) payload.low_stock_threshold = Number(payload.low_stock_threshold) || 5
  if (payload.target_margin != null) payload.target_margin = Number(payload.target_margin) || 0
  if (payload.selling_price != null) payload.selling_price = Number(payload.selling_price) || 0
  if (payload.cost_price != null) payload.cost_price = Number(payload.cost_price) || 0
  if (payload.stock != null) payload.stock = Number(payload.stock) || 0

  return payload
}

function materialsForRpc(materials = []) {
  return materials
    .filter((m) => m.material_id)
    .map((m) => ({
      material_id: m.material_id,
      quantity: Number(m.quantity) || 0,
    }))
}

export const ProductService = {
  mapProduct,

  async getAll(filters = {}) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const {
      page = PaginationDefaults.PAGE,
      limit = PaginationDefaults.LIMIT,
      search,
      categoryId,
      status = ProductStatus.ACTIVE,
      featured,
      trending,
      sortBy = 'created_at',
      sortOrder = 'desc',
      isAdmin = false,
    } = filters

    let query = supabase
      .from('products')
      .select('*, categories(id, name, slug)', { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (featured != null) query = query.eq('is_featured', featured)
    if (trending != null) query = query.eq('is_trending', trending)
    if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    if (!isAdmin) query = query.eq('is_showcase', false)

    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

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
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        product_materials(
          id,
          material_id,
          quantity_required,
          materials(id, name, unit, avg_unit_cost, stock)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return mapProduct(data)
  },

  async syncMaterials(productId, materials = []) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error: deleteError } = await supabase
      .from('product_materials')
      .delete()
      .eq('product_id', productId)

    if (deleteError) throw new Error(handleSupabaseError(deleteError))

    const rows = materialsForRpc(materials).map((m) => ({
      product_id: productId,
      material_id: m.material_id,
      quantity_required: m.quantity,
    }))

    if (!rows.length) return

    const { error: insertError } = await supabase
      .from('product_materials')
      .insert(rows)

    if (insertError) throw new Error(handleSupabaseError(insertError))
  },

  async create(product) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const materials = product.materials || []
    const createSample = !!product.createInitialShowcaseSample
    const showcaseStitchingCost = Number(product.showcaseStitchingCost) || 0
    const productData = buildProductPayload(product)

    const { data: productId, error } = await supabase.rpc('create_product_with_sample', {
      p_product: productData,
      p_materials: materialsForRpc(materials),
      p_create_sample: createSample,
      p_showcase_stitching_cost: showcaseStitchingCost,
    })

    if (error) throw new Error(handleSupabaseError(error))

    return this.getById(productId)
  },

  async update(id, product) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const materials = product.materials
    const productData = buildProductPayload(product)

    // Status-only updates (and similar) may omit materials — don't wipe them
    const shouldSyncMaterials = Array.isArray(materials)

    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)

    if (error) throw new Error(handleSupabaseError(error))

    if (shouldSyncMaterials) {
      await this.syncMaterials(id, materials)
    }

    return this.getById(id)
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },

  async getFeatured(limit = 8) {
    return this.getAll({ featured: true, limit, status: ProductStatus.ACTIVE })
  },

  async getTrending(limit = 8) {
    return this.getAll({ trending: true, limit, status: ProductStatus.ACTIVE })
  },

  async getLowStock(threshold = 5) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock, status, low_stock_threshold')
      .order('stock', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return (data || []).filter((p) => {
      const limit = p.low_stock_threshold ?? threshold
      return p.stock <= limit
    })
  },
}
