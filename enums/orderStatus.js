// Full order status workflow for Thash Attire's stitching business
export const OrderStatus = Object.freeze({
  ORDER_RECEIVED: 'order_received',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_RECEIVED: 'payment_received',
  SENT_TO_STITCHING: 'sent_to_stitching',
  STITCHING_COMPLETED: 'stitching_completed',
  PACKED: 'packed',
  HANDED_TO_COURIER: 'handed_to_courier',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
})

export const OrderStatusLabels = Object.freeze({
  [OrderStatus.ORDER_RECEIVED]: 'Order Received',
  [OrderStatus.PAYMENT_PENDING]: 'Payment Pending',
  [OrderStatus.PAYMENT_RECEIVED]: 'Payment Received',
  [OrderStatus.SENT_TO_STITCHING]: 'Sent to Stitching',
  [OrderStatus.STITCHING_COMPLETED]: 'Stitching Completed',
  [OrderStatus.PACKED]: 'Packed',
  [OrderStatus.HANDED_TO_COURIER]: 'Handed to Courier',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.COMPLETED]: 'Completed',
  [OrderStatus.CANCELLED]: 'Cancelled',
})

export const OrderStatusColors = Object.freeze({
  [OrderStatus.ORDER_RECEIVED]: 'info',
  [OrderStatus.PAYMENT_PENDING]: 'warning',
  [OrderStatus.PAYMENT_RECEIVED]: 'success',
  [OrderStatus.SENT_TO_STITCHING]: 'info',
  [OrderStatus.STITCHING_COMPLETED]: 'success',
  [OrderStatus.PACKED]: 'success',
  [OrderStatus.HANDED_TO_COURIER]: 'info',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.CANCELLED]: 'error',
})

export const OrderStatusIcons = Object.freeze({
  [OrderStatus.ORDER_RECEIVED]: 'mdi-clipboard-check-outline',
  [OrderStatus.PAYMENT_PENDING]: 'mdi-clock-outline',
  [OrderStatus.PAYMENT_RECEIVED]: 'mdi-cash-check',
  [OrderStatus.SENT_TO_STITCHING]: 'mdi-needle',
  [OrderStatus.STITCHING_COMPLETED]: 'mdi-check-circle-outline',
  [OrderStatus.PACKED]: 'mdi-package-variant-closed',
  [OrderStatus.HANDED_TO_COURIER]: 'mdi-truck-outline',
  [OrderStatus.DELIVERED]: 'mdi-home-check-outline',
  [OrderStatus.COMPLETED]: 'mdi-check-all',
  [OrderStatus.CANCELLED]: 'mdi-close-circle-outline',
})

// The ordered list of active workflow steps (excludes cancelled)
export const OrderWorkflowSteps = Object.freeze([
  OrderStatus.ORDER_RECEIVED,
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PAYMENT_RECEIVED,
  OrderStatus.SENT_TO_STITCHING,
  OrderStatus.STITCHING_COMPLETED,
  OrderStatus.PACKED,
  OrderStatus.HANDED_TO_COURIER,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
])
