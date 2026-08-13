export const MaterialType = Object.freeze({
  PRODUCT: 'product',   // Materials used to make a specific product (fabric, zip, buttons)
  COMMON: 'common',     // Materials used across all orders (tags, covers, stickers)
})

export const MaterialTypeLabels = Object.freeze({
  [MaterialType.PRODUCT]: 'Product Material',
  [MaterialType.COMMON]: 'Common Material',
})

export const MaterialTypeColors = Object.freeze({
  [MaterialType.PRODUCT]: 'primary',
  [MaterialType.COMMON]: 'secondary',
})

export const MaterialTypeIcons = Object.freeze({
  [MaterialType.PRODUCT]: 'mdi-scissors-cutting',
  [MaterialType.COMMON]: 'mdi-package-variant-closed-check',
})
