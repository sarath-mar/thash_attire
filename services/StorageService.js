import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import { StorageBucket } from '~/enums/storageBucket.js'

export const StorageService = {
  async upload(bucket, path, file, options = {}) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const { upsert = false } = options

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert, cacheControl: '3600' })

    if (error) throw new Error(handleSupabaseError(error, 'Upload failed'))
    return data
  },

  async uploadMultiple(bucket, files, folder = '') {
    const results = []
    for (const file of files) {
      const path = folder ? `${folder}/${Date.now()}-${file.name}` : `${Date.now()}-${file.name}`
      const result = await this.upload(bucket, path, file)
      results.push(result)
    }
    return results
  },

  async delete(bucket, paths) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const pathArray = Array.isArray(paths) ? paths : [paths]
    const { error } = await supabase.storage.from(bucket).remove(pathArray)
    if (error) throw new Error(handleSupabaseError(error, 'Delete failed'))
  },

  getPublicUrl(bucket, path) {
    const supabase = getSupabaseClient()
    if (!supabase) return ''

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data?.publicUrl || ''
  },

  async uploadProductImage(file, productId) {
    const path = `${productId}/${Date.now()}-${file.name}`
    return this.upload(StorageBucket.PRODUCTS, path, file)
  },

  async uploadProductVideo(file, productId) {
    const path = `${productId}/${Date.now()}-${file.name}`
    return this.upload(StorageBucket.PRODUCT_VIDEOS, path, file)
  },

  async uploadBanner(file) {
    const path = `${Date.now()}-${file.name}`
    return this.upload(StorageBucket.BANNERS, path, file)
  },
}
