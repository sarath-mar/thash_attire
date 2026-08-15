import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import { ProductStatus } from '~/enums/productStatus.js'
import { PaginationDefaults } from '~/constants/app.js'

export const ProductService = {
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
      .select('*, categories(id, name, slug)')
      .eq('id', id)
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async create(product) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { materials, createInitialShowcaseSample, showcaseStitchingCost, target_margin, low_stock_threshold, stitching_cost, packaging_cost, other_cost, ...productData } = product

    const { data: productId, error } = await supabase.rpc('create_product_with_sample', {
      p_product: productData,
      p_materials: materials || [],
      p_create_sample: !!createInitialShowcaseSample,
      p_showcase_stitching_cost: showcaseStitchingCost || 0
    })

    if (error) throw new Error(handleSupabaseError(error))
    
    // Fetch the created product to return
    return this.getById(productId)
  },

  async update(id, product) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not initialized')

    const { materials, createInitialShowcaseSample, target_margin, low_stock_threshold, stitching_cost, packaging_cost, other_cost, ...productData } = product

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
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
      .select('id, name, sku, stock, status')
      .lte('stock', threshold)
      .order('stock', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },
}
