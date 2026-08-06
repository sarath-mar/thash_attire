export const SaleStatus = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
})

export const SaleStatusLabels = Object.freeze({
  [SaleStatus.PENDING]: 'Pending',
  [SaleStatus.COMPLETED]: 'Completed',
  [SaleStatus.CANCELLED]: 'Cancelled',
  [SaleStatus.REFUNDED]: 'Refunded',
})

export const SaleStatusColors = Object.freeze({
  [SaleStatus.PENDING]: 'warning',
  [SaleStatus.COMPLETED]: 'success',
  [SaleStatus.CANCELLED]: 'error',
  [SaleStatus.REFUNDED]: 'info',
})
