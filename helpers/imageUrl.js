import { DefaultImages } from '~/constants/defaults.js'

export function getImageUrl(path, fallback = DefaultImages.PRODUCT) {
  if (!path) return fallback
  if (path.startsWith('http') || path.startsWith('/')) return path
  return path
}

export function getSupabaseImageUrl(supabase, bucket, path) {
  if (!path || !supabase) return DefaultImages.PRODUCT

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || DefaultImages.PRODUCT
}

export function getThumbnailUrl(url, width = 400) {
  if (!url) return DefaultImages.PRODUCT
  return url
}

export function getProductImageUrl(product, fallback = DefaultImages.PRODUCT) {
  if (!product) return fallback
  const images = product.images || []
  return getImageUrl(images[0], fallback)
}
