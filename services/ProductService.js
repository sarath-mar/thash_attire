import { getSupabaseClient, handleSupabaseError, buildQuery } from './supabaseClient.js'
import { ProductStatus } from '~/enums/productStatus.js'
import { PaginationDefaults } from '~/constants/app.js'

const MOCK_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Royal Zari Kanjivaram Silk Saree',
    description: 'Handcrafted Kanjivaram silk saree adorned with intricate pure zari weaving across rich emerald silk. Comes with unstitched blouse piece.',
    category_id: 'cat-001',
    categories: { id: 'cat-001', name: 'Silk Sarees', slug: 'silk-sarees' },
    selling_price: 24999,
    cost_price: 12500,
    sizes: ['Free Size'],
    colors: ['Emerald Green', 'Royal Gold', 'Ruby Red'],
    stock: 8,
    sku: 'TA-SAR-001',
    is_featured: true,
    is_trending: true,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'],
    status: 'active',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'prod-002',
    name: 'Hand-Embroidered Organza Anarkali Set',
    description: 'Bespoke dusty rose organza Anarkali dress featuring delicate pearl and sequins hand embroidery with matching dupatta and pants.',
    category_id: 'cat-003',
    categories: { id: 'cat-003', name: 'Indo-Western Gowns', slug: 'indo-western-gowns' },
    selling_price: 18500,
    cost_price: 9200,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Dusty Rose', 'Champagne Gold', 'Ivory'],
    stock: 5,
    sku: 'TA-GWN-002',
    is_featured: true,
    is_trending: true,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [],
    status: 'active',
    created_at: '2026-01-18T10:00:00Z',
  },
  {
    id: 'prod-003',
    name: 'Intricate Velvet Bridal Lehenga Choli',
    description: 'Opulent crimson maroon velvet lehenga embroidered with antique gold gota patti work. Paired with a heavy blouse and net dupatta.',
    category_id: 'cat-005',
    categories: { id: 'cat-005', name: 'Bridal Couture', slug: 'bridal-couture' },
    selling_price: 45000,
    cost_price: 22000,
    sizes: ['M', 'L'],
    colors: ['Maroon Crimson', 'Antique Gold'],
    stock: 3,
    sku: 'TA-BRD-003',
    is_featured: true,
    is_trending: true,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [],
    status: 'active',
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'prod-004',
    name: 'Chanderi Silk Handblock Printed Kurti',
    description: 'Breathable royal blue Chanderi silk tunic detailed with gold foil block prints and mirror work neckline.',
    category_id: 'cat-002',
    categories: { id: 'cat-002', name: 'Designer Kurtis', slug: 'designer-kurtis' },
    selling_price: 8999,
    cost_price: 4200,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Royal Blue', 'Mint Green', 'Ivory'],
    stock: 14,
    sku: 'TA-KRT-004',
    is_featured: true,
    is_trending: false,
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [],
    status: 'active',
    created_at: '2026-01-22T10:00:00Z',
  },
  {
    id: 'prod-005',
    name: 'Pashmina Hand-Woven Zari Dupatta',
    description: 'Pure Pashmina silk dupatta woven by master artisans, finished with intricate antique gold zari borders and tassels.',
    category_id: 'cat-004',
    categories: { id: 'cat-004', name: 'Artisanal Dupattas', slug: 'artisanal-dupattas' },
    selling_price: 6499,
    cost_price: 3100,
    sizes: ['Free Size'],
    colors: ['Peach Pink', 'Royal Gold', 'Sky Blue'],
    stock: 10,
    sku: 'TA-DUP-005',
    is_featured: true,
    is_trending: false,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [],
    status: 'active',
    created_at: '2026-01-25T10:00:00Z',
  },
  {
    id: 'prod-006',
    name: 'Brocade Silk Crop Top & Flared Skirt',
    description: 'Contemporary 2-piece set in mustard yellow brocade silk featuring a structured crop top and high-waist flared skirt.',
    category_id: 'cat-003',
    categories: { id: 'cat-003', name: 'Indo-Western Gowns', slug: 'indo-western-gowns' },
    selling_price: 14200,
    cost_price: 7000,
    sizes: ['S', 'M', 'L'],
    colors: ['Mustard Yellow', 'Deep Purple'],
    stock: 6,
    sku: 'TA-IND-006',
    is_featured: false,
    is_trending: true,
    images: [
      'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [],
    status: 'active',
    created_at: '2026-01-28T10:00:00Z',
  },
  {
    id: 'prod-007',
    name: 'Tissue Georgette Ruffled Saree',
    description: 'Modern pre-stitched ruffled saree in tissue georgette with a embellished crystal corset blouse.',
    category_id: 'cat-001',
    categories: { id: 'cat-001', name: 'Silk Sarees', slug: 'silk-sarees' },
    selling_price: 12800,
    cost_price: 6000,
    sizes: ['Free Size'],
    colors: ['Blush Pink', 'Silver Mist'],
    stock: 12,
    sku: 'TA-SAR-007',
    is_featured: false,
    is_trending: true,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [],
    status: 'active',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prod-008',
    name: 'Mirror Work Raw Silk Cocktail Suit',
    description: 'Statement wine red raw silk straight pantsuit featuring heavy hand-sewn glass mirror accent detailing.',
    category_id: 'cat-002',
    categories: { id: 'cat-002', name: 'Designer Kurtis', slug: 'designer-kurtis' },
    selling_price: 16999,
    cost_price: 8100,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Wine Red', 'Midnight Black'],
    stock: 2,
    sku: 'TA-KRT-008',
    is_featured: false,
    is_trending: true,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [],
    status: 'active',
    created_at: '2026-02-03T10:00:00Z',
  },
]

export const ProductService = {
  async getAll(filters = {}) {
    const supabase = getSupabaseClient()
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

    if (!supabase) {
      let result = [...MOCK_PRODUCTS]
      if (status) result = result.filter(p => p.status === status)
      if (categoryId) result = result.filter(p => p.category_id === categoryId)
      if (featured != null) result = result.filter(p => p.is_featured === featured)
      if (trending != null) result = result.filter(p => p.is_trending === trending)
      if (search) {
        const q = search.toLowerCase()
        result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      }

      result.sort((a, b) => {
        if (sortOrder === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1
        return a[sortBy] < b[sortBy] ? 1 : -1
      })

      const total = result.length
      const from = (page - 1) * limit
      const data = result.slice(from, from + limit)
      return { data, total }
    }

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
    if (error) {
      console.warn('[ProductService] Supabase error, falling back to mock data:', error.message)
      return this.getAllMock(filters)
    }

    return { data: data || [], total: count || 0 }
  },

  getAllMock(filters = {}) {
    let result = [...MOCK_PRODUCTS]
    const { page = 1, limit = 12, search, categoryId, featured, trending } = filters
    if (categoryId) result = result.filter(p => p.category_id === categoryId)
    if (featured != null) result = result.filter(p => p.is_featured === featured)
    if (trending != null) result = result.filter(p => p.is_trending === trending)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    }
    const total = result.length
    const from = (page - 1) * limit
    return { data: result.slice(from, from + limit), total }
  },

  async getById(id) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0]
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('id', id)
      .single()

    if (error) {
      return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0]
    }
    return data
  },

  async create(product) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      const newProd = { ...product, id: 'prod-' + Date.now(), created_at: new Date().toISOString() }
      MOCK_PRODUCTS.unshift(newProd)
      return newProd
    }

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
    if (!supabase) {
      const idx = MOCK_PRODUCTS.findIndex(p => p.id === id)
      if (idx !== -1) {
        MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...product, updated_at: new Date().toISOString() }
        return MOCK_PRODUCTS[idx]
      }
      return product
    }

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
    if (!supabase) {
      const idx = MOCK_PRODUCTS.findIndex(p => p.id === id)
      if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1)
      return
    }

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
    if (!supabase) {
      return MOCK_PRODUCTS.filter(p => p.stock <= threshold)
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock, status')
      .lte('stock', threshold)
      .order('stock', { ascending: true })

    if (error) return MOCK_PRODUCTS.filter(p => p.stock <= threshold)
    return data || []
  },
}

