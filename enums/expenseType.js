export const ExpenseType = Object.freeze({
  MATERIAL_PURCHASE: 'material_purchase',
  COURIER: 'courier',
  PACKAGING: 'packaging',
  MARKETING: 'marketing',
  MISCELLANEOUS: 'miscellaneous',
})

export const ExpenseTypeLabels = Object.freeze({
  [ExpenseType.MATERIAL_PURCHASE]: 'Material Purchase',
  [ExpenseType.COURIER]: 'Courier',
  [ExpenseType.PACKAGING]: 'Packaging',
  [ExpenseType.MARKETING]: 'Marketing',
  [ExpenseType.MISCELLANEOUS]: 'Miscellaneous',
})
