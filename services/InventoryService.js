import { getSupabaseClient } from './supabaseClient.js'

export const InventoryService = {
  async getAll(filters = {}) {
    const { search = '', stockStatus = '' } = filters
    const supabase = getSupabaseClient()

    if (!supabase) {
      // Fall back to empty — ProductService mock data will be used
      return { data: [], total: 0 }
    }

    let query = supabase
      .from('products')
      .select('id, name, sku, stock, low_stock_threshold, cost_price, selling_price, status, category_id, categories(name)', { count: 'exact' })
      .order('stock', { ascending: true })

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    if (stockStatus === 'out') {
      query = query.eq('stock', 0)
    } else if (stockStatus === 'low') {
      // Low stock: stock > 0 but <= threshold (default 5)
      query = query.gt('stock', 0).lte('stock', 5)
    } else if (stockStatus === 'in') {
      query = query.gt('stock', 5)
    }

    const { data, error, count } = await query
    if (error) {
      console.warn('[InventoryService] getAll failed:', error.message)
      return { data: [], total: 0 }
    }
    return { data: data || [], total: count || 0 }
  },

  async adjustStock(productId, newStock) {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { error } = await supabase
      .from('products')
      .update({
        stock: newStock,
        status: newStock === 0 ? 'out_of_stock' : 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (error) throw new Error(error.message)
  },
}
