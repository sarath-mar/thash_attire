import { getSupabaseClient, handleSupabaseError } from './supabaseClient.js'
import { Roles } from '~/enums/roles.js'

export const AuthService = {
  async login(email, password) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(handleSupabaseError(error, 'Login failed'))

    // const isAdmin = await this.verifyAdmin(data.user.id)
    // if (!isAdmin) {
    //   await this.logout()
    //   throw new Error('Access denied. Admin privileges required.')
    // }

    return data
  },

  async logout() {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signOut()
  },

  async getSession() {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  async getUser() {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async verifyAdmin(userId) {
    const supabase = getSupabaseClient()
    if (!supabase || !userId) return false

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !data) return false
    return data.role === Roles.ADMIN
  },

  onAuthStateChange(callback) {
    const supabase = getSupabaseClient()
    if (!supabase) return { data: { subscription: { unsubscribe: () => { } } } }
    return supabase.auth.onAuthStateChange(callback)
  },
}
