import { createClient } from '@supabase/supabase-js'

let supabaseClient = null

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl
  const key = config.public.supabaseAnonKey

  if (!url || !key) {
    console.warn('[Supabase] Missing configuration. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY.')
    return null
  }

  supabaseClient = createClient(url, key)
  return supabaseClient
}

export function handleSupabaseError(error, fallbackMessage = 'An error occurred') {
  if (!error) return fallbackMessage
  return error.message || fallbackMessage
}

export function buildQuery(query, filters = {}) {
  let q = query

  Object.entries(filters).forEach(([key, value]) => {
    if (value == null || value === '') return

    if (key === 'search' && value) {
      return
    }

    if (key === 'orderBy') {
      const { field, ascending = true } = value
      q = q.order(field, { ascending })
      return
    }

    if (key === 'limit') {
      q = q.limit(value)
      return
    }

    if (key === 'offset') {
      q = q.range(value, value + (filters.limit || 20) - 1)
      return
    }

    if (Array.isArray(value)) {
      q = q.in(key, value)
    } else {
      q = q.eq(key, value)
    }
  })

  return q
}
