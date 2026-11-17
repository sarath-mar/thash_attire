import { formatCurrency } from '~/helpers/currency.js'
import { expectedDeliveryOf, formatDate } from '~/helpers/date.js'
import { getWhatsAppLink } from '~/helpers/phone.js'
import { OrderStatusLabels } from '~/enums/orderStatus.js'
import { PaymentStatusLabels } from '~/enums/paymentStatus.js'

function whatsAppNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  return digits
}

function orderLines(order) {
  const items = Array.isArray(order?.sale_items) && order.sale_items.length
    ? order.sale_items
    : [{
        product_name: order?.product_name || 'Custom order',
        quantity: order?.quantity || 1,
        selling_price: order?.selling_price || order?.final_amount || 0,
      }]

  return items.map((item) => {
    const qty = Number(item.quantity) || 1
    const amount = (Number(item.selling_price) || 0) * qty
    return `${item.product_name || 'Piece'} x ${qty} - ${formatCurrency(amount)}`
  })
}

export function orderWhatsAppLink(order) {
  const phone = whatsAppNumber(order?.customer_phone)
  if (!phone) return ''

  const status = OrderStatusLabels[order?.status || order?.order_status] || 'In progress'
  const payment = PaymentStatusLabels[order?.payment_status] || 'Pending'
  const expected = expectedDeliveryOf(order)
  const lines = [
    `Hello ${order?.customer_name || ''},`.trim(),
    '',
    `Your Thash Attire order ${order?.order_number || ''}`,
    '',
    ...orderLines(order),
    `Total: ${formatCurrency(order?.final_amount ?? order?.total_amount)}`,
    `Status: ${status}`,
    `Payment: ${payment}`,
  ]
  if (expected) lines.push(`Expected delivery: ${formatDate(expected)}`)
  lines.push('', 'Thank you.')

  return getWhatsAppLink(phone, lines.join('\n'))
}

export function shareOrderOnWhatsApp(order) {
  const url = orderWhatsAppLink(order)
  if (!url) return false
  window.open(url, '_blank', 'noopener')
  return true
}
