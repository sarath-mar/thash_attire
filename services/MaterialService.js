import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import {
  getMockAllMaterials,
  getMockMaterialById,
  createMockMaterial,
  updateMockMaterial,
  deleteMockMaterial,
} from '~/mock/materialStore.js'

export const MaterialService = {
  async getAll(search = '', type = null) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      let result = getMockAllMaterials(search)
      if (type) result = result.filter(m => m.type === type)
      return result
    }

    let query = supabase
      .from('materials')
      .select('*')
      .order('name', { ascending: true })

    if (search) {
      query = query.or(`name.ilike.%${search}%,supplier.ilike.%${search}%`)
    }
    if (type) query = query.eq('type', type)

    const { data, error } = await query
    if (error) {
      console.warn('[MaterialService] getAll failed, using mock:', error.message)
      return getMockAllMaterials(search)
    }
    return data || []
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) return getMockMaterialById(id)

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return getMockMaterialById(id)
    return data
  },

  async create(material) {
    const supabase = getSupabaseClient()
    if (!supabase) return createMockMaterial(material)

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
    if (!supabase) return updateMockMaterial(id, material)

    const { data, error } = await supabase
      .from('materials')
      .update({ ...material, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      deleteMockMaterial(id)
      return
    }

    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}
