import { OrderStatus, OrderStatusLabels, OrderWorkflowSteps } from '~/enums/orderStatus.js'

export const OrderNextActions = Object.freeze({
  [OrderStatus.ORDER_RECEIVED]: { status: OrderStatus.PAYMENT_RECEIVED, label: 'Record Payment', icon: 'mdi-cash-check' },
  [OrderStatus.PAYMENT_PENDING]: { status: OrderStatus.PAYMENT_RECEIVED, label: 'Record Payment', icon: 'mdi-cash-check' },
  [OrderStatus.PAYMENT_RECEIVED]: { status: OrderStatus.SENT_TO_STITCHING, label: 'Send to Stitching', icon: 'mdi-needle' },
  [OrderStatus.SENT_TO_STITCHING]: { status: OrderStatus.STITCHING_COMPLETED, label: 'Mark Stitching Completed', icon: 'mdi-check-circle-outline' },
  [OrderStatus.STITCHING_COMPLETED]: { status: OrderStatus.PACKED, label: 'Mark as Packed', icon: 'mdi-package-variant-closed' },
  [OrderStatus.PACKED]: { status: OrderStatus.HANDED_TO_COURIER, label: 'Hand to Courier', icon: 'mdi-truck-outline' },
  [OrderStatus.HANDED_TO_COURIER]: { status: OrderStatus.DELIVERED, label: 'Mark Delivered', icon: 'mdi-home-outline' },
  [OrderStatus.DELIVERED]: { status: OrderStatus.COMPLETED, label: 'Mark Completed', icon: 'mdi-check-all' },
})

export function getNextOrderAction(currentStatus) {
  return OrderNextActions[currentStatus] || null
}

export function orderStatusOf(order) {
  return order?.status || order?.order_status || ''
}

export function progressStep(status) {
  if (status === OrderStatus.PAYMENT_PENDING) return OrderStatus.ORDER_RECEIVED
  return status
}

export function statusMoveBlockMessage(currentStatus, nextStatus) {
  if (nextStatus === OrderStatus.CANCELLED) return ''

  const currentIndex = OrderWorkflowSteps.indexOf(progressStep(currentStatus))
  const nextIndex = OrderWorkflowSteps.indexOf(nextStatus)
  const paidIndex = OrderWorkflowSteps.indexOf(OrderStatus.PAYMENT_RECEIVED)
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentIndex) return ''
  if (currentIndex < paidIndex || nextIndex > paidIndex) return ''

  const label = OrderStatusLabels[nextStatus] || 'that step'
  return `This order can't go back to ${label}. Payment is already recorded, and the stock stays on this order.`
}

export function statusAfterPayment(currentStatus) {
  const currentIndex = OrderWorkflowSteps.indexOf(currentStatus)
  const paidIndex = OrderWorkflowSteps.indexOf(OrderStatus.PAYMENT_RECEIVED)
  if (currentIndex === -1 || currentIndex < paidIndex) return OrderStatus.PAYMENT_RECEIVED
  return currentStatus
}

export function historyWithStatus(history, status, extra = {}) {
  const next = Array.isArray(history) ? history.map(entry => ({ ...entry })) : []
  const now = extra.date || new Date().toISOString()
  const index = next.findIndex(entry => entry.status === status)
  if (index === -1) {
    next.push({ status, date: now, ...extra })
  } else {
    next[index] = { ...next[index], ...extra, status, date: next[index].date || now }
  }
  return next
}

export function paymentRecordFrom(order) {
  const history = Array.isArray(order?.status_history) ? order.status_history : []
  const entry = [...history].reverse().find(item => item?.payment)
  const payment = entry?.payment || {}
  return {
    date: order?.payment_date || payment.date || null,
    transactionId: order?.transaction_id || payment.transaction_id || '',
    app: order?.payment_app || payment.app || '',
    method: order?.payment_method || payment.method || '',
  }
}

export function presentSale(row) {
  if (!row) return row
  const payment = paymentRecordFrom(row)
  const status = row.status || row.order_status || null
  return {
    ...row,
    status,
    order_status: status,
    total_amount: row.final_amount ?? row.total_amount ?? 0,
    order_date: row.order_date || row.sale_date || null,
    payment_date: payment.date,
    transaction_id: payment.transactionId || null,
    payment_app: payment.app || null,
  }
}
