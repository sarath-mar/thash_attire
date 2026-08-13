export const StockStatus = Object.freeze({
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
})

export const StockStatusLabels = Object.freeze({
  [StockStatus.IN_STOCK]: 'In Stock',
  [StockStatus.LOW_STOCK]: 'Low Stock',
  [StockStatus.OUT_OF_STOCK]: 'Out of Stock',
})

export const StockStatusColors = Object.freeze({
  [StockStatus.IN_STOCK]: 'success',
  [StockStatus.LOW_STOCK]: 'warning',
  [StockStatus.OUT_OF_STOCK]: 'error',
})
