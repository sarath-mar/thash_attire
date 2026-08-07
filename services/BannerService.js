import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'

const MOCK_BANNERS = [
  {
    id: 'ban-001',
    title: 'The Royal Couture Collection',
    subtitle: 'Artisanal Kanjivaram & Pure Silk Creations',
    description: 'Immerse yourself in timeless elegance crafted by master weavers across India.',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=85',
    link: '/products',
    button_text: 'Explore Collection',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'ban-002',
    title: 'Modern Festive Elegance',
    subtitle: 'Bespoke Indo-Western Gowns & Anarkalis',
    description: 'Celebrate life with lightweight hand-embroidered organza and silk silhouettes.',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1800&q=85',
    link: '/products?category=cat-003',
    button_text: 'View Gowns',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'ban-003',
    title: 'Bridal Heritage Luxe',
    subtitle: 'Handcrafted Velvet & Zari Masterpieces',
    description: 'Designed for the modern bride seeking grandeur, grace, and exquisite detail.',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1800&q=85',
    link: '/products?category=cat-005',
    button_text: 'Discover Bridal',
    is_active: true,
    sort_order: 3,
  },
]

export const BannerService = {
  async getActive() {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_BANNERS

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) return MOCK_BANNERS
    return data
  },

  async getAll() {
    const supabase = getSupabaseClient()
    if (!supabase) return MOCK_BANNERS

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) return MOCK_BANNERS
    return data
  },

  async create(banner) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const newBan = { ...banner, id: 'ban-' + Date.now(), is_active: true }
      MOCK_BANNERS.push(newBan)
      return newBan
    }

    const { data, error } = await supabase
      .from('banners')
      .insert(banner)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async update(id, banner) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_BANNERS.findIndex(b => b.id === id)
      if (idx !== -1) {
        MOCK_BANNERS[idx] = { ...MOCK_BANNERS[idx], ...banner }
        return MOCK_BANNERS[idx]
      }
      return banner
    }

    const { data, error } = await supabase
      .from('banners')
      .update(banner)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(handleSupabaseError(error))
    return data
  },

  async delete(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const idx = MOCK_BANNERS.findIndex(b => b.id === id)
      if (idx !== -1) MOCK_BANNERS.splice(idx, 1)
      return
    }

    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) throw new Error(handleSupabaseError(error))
  },
}

