import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

const MOCK_CATEGORIES = [
  {
    id: 'cat-001',
    name: 'Silk Sarees',
    slug: 'silk-sarees',
    description: 'Heritage Kanjivaram, Banarasi & Tussar silk sarees crafted by hand.',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'cat-002',
    name: 'Designer Kurtis',
    slug: 'designer-kurtis',
    description: 'Bespoke tunics and suit sets featuring delicate hand embroidery.',
    image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'cat-003',
    name: 'Indo-Western Gowns',
    slug: 'indo-western-gowns',
    description: 'Modern silhouettes blending traditional Indian aesthetics.',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'cat-004',
    name: 'Artisanal Dupattas',
    slug: 'artisanal-dupattas',
    description: 'Luxurious organza, Pashmina and zari woven scarves & dupattas.',
    image_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'cat-005',
    name: 'Bridal Couture',
    slug: 'bridal-couture',
    description: 'Heavy velvet and silk lehengas tailored for your grand day.',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 5,
  },
]

export const CategoryService = {
  async getAll() {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_CATEGORIES

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) return MOCK_CATEGORIES
    return data
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_CATEGORIES.find(c => c.id === id) || MOCK_CATEGORIES[0]

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return MOCK_CATEGORIES.find(c => c.id === id) || MOCK_CATEGORIES[0]
    return data
  },

  async create(category) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const newCat = { ...category, id: 'cat-' + Date.now(), is_active: true }
      MOCK_CATEGORIES.push(newCat)
      return newCat
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, category) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_CATEGORIES.findIndex(c => c.id === id)
      if (idx !== -1) {
        MOCK_CATEGORIES[idx] = { ...MOCK_CATEGORIES[idx], ...category }
        return MOCK_CATEGORIES[idx]
      }
      return category
    }

    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_CATEGORIES.findIndex(c => c.id === id)
      if (idx !== -1) MOCK_CATEGORIES.splice(idx, 1)
      return
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}

