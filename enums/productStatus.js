export const ProductStatus = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
  DRAFT: 'draft',
})

export const ProductStatusLabels = Object.freeze({
  [ProductStatus.ACTIVE]: 'Active',
  [ProductStatus.INACTIVE]: 'Inactive',
  [ProductStatus.OUT_OF_STOCK]: 'Out of Stock',
  [ProductStatus.DRAFT]: 'Draft',
})

export const ProductStatusColors = Object.freeze({
  [ProductStatus.ACTIVE]: 'success',
  [ProductStatus.INACTIVE]: 'grey',
  [ProductStatus.OUT_OF_STOCK]: 'warning',
  [ProductStatus.DRAFT]: 'info',
})
