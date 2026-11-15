import { getCustomerSupabaseClient } from './customerSupabaseClient.js'
import { mapCustomerAuthError } from './CustomerAuthService.js'

function requireClient() {
  const supabase = getCustomerSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export const CustomerOrderService = {
  async placeOrder({ items, shippingAddress, paymentMethod, name, phone, notes, offerId }) {
    const supabase = requireClient()
    const { data, error } = await supabase.rpc('place_customer_order', {
      p_items: items,
      p_shipping_address: shippingAddress,
      p_payment_method: paymentMethod,
      p_name: name || null,
      p_phone: phone || null,
      p_notes: notes || null,
      p_offer_id: offerId || null,
    })

    if (error) throw new Error(mapCustomerAuthError(error, 'We could not place your order'))
    return data
  },

  async getMine() {
    const supabase = requireClient()
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('order_date', { ascending: false })

    if (error) throw new Error(mapCustomerAuthError(error, 'We could not load your orders'))
    return data || []
  },

  async getById(id) {
    const supabase = requireClient()
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(mapCustomerAuthError(error, 'We could not load this order'))
    return data
  },
}
