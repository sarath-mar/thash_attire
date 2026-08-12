export const PaymentStatus = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  REFUNDED: 'refunded',
})

export const PaymentStatusLabels = Object.freeze({
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.PAID]: 'Paid',
  [PaymentStatus.PARTIAL]: 'Partial',
  [PaymentStatus.REFUNDED]: 'Refunded',
})

export const PaymentStatusColors = Object.freeze({
  [PaymentStatus.PENDING]: 'warning',
  [PaymentStatus.PAID]: 'success',
  [PaymentStatus.PARTIAL]: 'info',
  [PaymentStatus.REFUNDED]: 'error',
})

export const PaymentMethod = Object.freeze({
  CASH: 'cash',
  UPI: 'upi',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
})

export const PaymentMethodLabels = Object.freeze({
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.UPI]: 'UPI',
  [PaymentMethod.CARD]: 'Card',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
})

