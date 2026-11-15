import { createClient } from '@supabase/supabase-js'

let customerClient = null

export function getCustomerSupabaseClient() {
  if (customerClient) return customerClient

  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl
  const key = config.public.supabaseAnonKey

  if (!url || !key) {
    console.warn('[Supabase] Missing configuration. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY.')
    return null
  }

  customerClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'thash-customer-auth',
      flowType: 'pkce',
    },
  })

  return customerClient
}
