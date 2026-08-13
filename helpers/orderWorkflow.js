import { OrderStatus } from '~/enums/orderStatus.js'

export const OrderNextActions = Object.freeze({
  [OrderStatus.ORDER_RECEIVED]: { status: OrderStatus.PAYMENT_PENDING, label: 'Mark Payment Pending', icon: 'mdi-clock-outline' },
  [OrderStatus.PAYMENT_PENDING]: { status: OrderStatus.PAYMENT_RECEIVED, label: 'Mark Payment Received', icon: 'mdi-cash-check' },
  [OrderStatus.PAYMENT_RECEIVED]: { status: OrderStatus.SENT_TO_STITCHING, label: 'Send to Stitching', icon: 'mdi-needle' },
  [OrderStatus.SENT_TO_STITCHING]: { status: OrderStatus.STITCHING_COMPLETED, label: 'Mark Stitching Completed', icon: 'mdi-check-circle-outline' },
  [OrderStatus.STITCHING_COMPLETED]: { status: OrderStatus.PACKED, label: 'Mark as Packed', icon: 'mdi-package-variant-closed' },
  [OrderStatus.PACKED]: { status: OrderStatus.HANDED_TO_COURIER, label: 'Hand to Courier', icon: 'mdi-truck-outline' },
  [OrderStatus.HANDED_TO_COURIER]: { status: OrderStatus.DELIVERED, label: 'Mark Delivered', icon: 'mdi-home-check-outline' },
  [OrderStatus.DELIVERED]: { status: OrderStatus.COMPLETED, label: 'Mark Completed', icon: 'mdi-check-all' },
})

export function getNextOrderAction(currentStatus) {
  return OrderNextActions[currentStatus] || null
}
