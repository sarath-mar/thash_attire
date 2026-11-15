import { getCustomerSupabaseClient } from './customerSupabaseClient.js'
import { handleSupabaseError } from './supabaseClient.js'

const PENDING_KEY = 'ta-customer-pending-profile'
const REDIRECT_KEY = 'ta-customer-redirect'

function requireClient() {
  const supabase = getCustomerSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export function mapCustomerAuthError(error, fallback = 'Something went wrong. Please try again.') {
  const message = handleSupabaseError(error, fallback)
  if (/upsert_my_customer_profile|place_customer_order|schema cache|could not find the function/i.test(message)) {
    return 'Customer accounts are not ready yet. Run supabase/customer_auth.sql in the Supabase SQL editor.'
  }
  if (/otp|token|expired/i.test(message)) {
    return 'That code is invalid or has expired. Request a new one.'
  }
  if (/rate limit/i.test(message)) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (/provider is not enabled|unsupported provider/i.test(message)) {
    return 'Google sign-in is not enabled yet. Turn on the Google provider in Supabase Auth.'
  }
  if (/redirect/i.test(message)) {
    return 'This site URL is not allowed yet. Add it to the Supabase Auth redirect URLs.'
  }
  if (/already used|already linked|mobile number/i.test(message)) return message
  return message
}

export function rememberCustomerRedirect(path) {
  if (!import.meta.client) return
  sessionStorage.setItem(REDIRECT_KEY, path || '/')
}

export function consumeCustomerRedirect(fallback = '/') {
  if (!import.meta.client) return fallback
  const value = sessionStorage.getItem(REDIRECT_KEY) || fallback
  sessionStorage.removeItem(REDIRECT_KEY)
  return value
}

export function stashPendingProfile(profile) {
  if (!import.meta.client) return
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({
    name: profile?.name || '',
    phone: profile?.phone || '',
  }))
}

export function clearPendingProfile() {
  if (!import.meta.client) return
  sessionStorage.removeItem(PENDING_KEY)
}

function readPendingProfile() {
  if (!import.meta.client) return {}
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_KEY) || '{}')
  } catch {
    return {}
  }
}

export const CustomerAuthService = {
  async getSession() {
    const supabase = getCustomerSupabaseClient()
    if (!supabase) return null
    const { data, error } = await supabase.auth.getSession()
    if (error) throw new Error(mapCustomerAuthError(error))
    return data.session
  },

  async sendEmailCode(email, profile = {}) {
    const supabase = requireClient()
    if (profile.name || profile.phone) stashPendingProfile(profile)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: profile.name ? { full_name: profile.name } : undefined,
      },
    })

    if (error) throw new Error(mapCustomerAuthError(error, 'We could not send the code'))
  },

  async verifyEmailCode(email, token) {
    const supabase = requireClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: String(token || '').trim(),
      type: 'email',
    })

    if (error) throw new Error(mapCustomerAuthError(error, 'That code is invalid or has expired. Request a new one.'))
    return data
  },

  async signInWithGoogle() {
    const supabase = requireClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })

    if (error) throw new Error(mapCustomerAuthError(error, 'Google sign-in could not be started'))
  },

  async completeRedirectLogin() {
    const supabase = requireClient()
    const url = new URL(window.location.href)
    const oauthError = url.searchParams.get('error_description') || url.searchParams.get('error')
    if (oauthError) throw new Error(decodeURIComponent(oauthError.replace(/\+/g, ' ')))

    const code = url.searchParams.get('code')
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        const { data } = await supabase.auth.getSession()
        if (!data.session) throw new Error(mapCustomerAuthError(error, 'Sign-in could not be completed'))
      }
    }

    const { data, error } = await supabase.auth.getSession()
    if (error) throw new Error(mapCustomerAuthError(error))
    if (!data.session) throw new Error('Sign-in could not be completed. Please try again.')
    return data.session
  },

  async syncProfile(user, extra = {}) {
    const supabase = requireClient()
    const pending = readPendingProfile()
    const meta = user?.user_metadata || {}
    const email = extra.email || user?.email || null

    const { data: existing, error: readError } = await supabase
      .from('customers')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (readError) throw new Error(mapCustomerAuthError(readError, 'We could not load your profile'))

    const name = extra.name || pending.name || existing?.name || meta.full_name || meta.name || null
    const phone = extra.phone || pending.phone || null
    const address = extra.address || null
    const hasEdits = Boolean(extra.name || extra.phone || extra.address || pending.name || pending.phone)

    if (existing && !hasEdits) return existing

    const { data, error } = await supabase.rpc('upsert_my_customer_profile', {
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_address: address,
    })

    if (error) throw new Error(mapCustomerAuthError(error, 'We could not save your profile'))
    clearPendingProfile()
    return data
  },

  async logout() {
    const supabase = getCustomerSupabaseClient()
    if (!supabase) return
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw new Error(mapCustomerAuthError(error, 'Could not log out'))
  },
}
