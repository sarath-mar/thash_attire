import { getSupabaseClient, handleSupabaseError, buildQuery } from './supabaseClient.js'
import { ProductStatus } from '~/enums/productStatus.js'
import { PaginationDefaults } from '~/constants/app.js'

export const ProductService = {
  async getAll(filters = {}) {
    const supabase = getSupabaseClient()
    if (!supabase) return { data: [], total: 0 }

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
    } = filters

    let query = supabase
      .from('products')
      .select('*, categories(id, name, slug)', { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (featured != null) query = query.eq('is_featured', featured)
    if (trending != null) query = query.eq('is_trending', trending)
    if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)

    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(handleSupabaseError(error))

    return { data: data || [], total: count || 0 }
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) return null

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
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, product) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

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
    if (!supabase) return []

    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock, status')
      .lte('stock', threshold)
      .order('stock', { ascending: true })

    if (error) throw new Error(handleSupabaseError(error))
    return data || []
  },
}
