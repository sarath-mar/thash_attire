/**
 * Profit and margin calculation helpers.
 * Used by product and order cost UI.
 */

export function calcProfit(sellingPrice, totalCost) {
  const price = Number(sellingPrice) || 0
  const cost = Number(totalCost) || 0
  return Math.round((price - cost) * 100) / 100
}

export function calcProfitMargin(sellingPrice, totalCost) {
  const price = Number(sellingPrice) || 0
  const cost = Number(totalCost) || 0
  if (price <= 0) return 0
  const margin = ((price - cost) / price) * 100
  return Math.round(margin * 100) / 100
}

export function calcRecommendedPrice(totalCost, targetMarginPercent) {
  const cost = Number(totalCost) || 0
  const margin = Number(targetMarginPercent) || 0
  if (margin >= 100) return cost
  const divisor = 1 - margin / 100
  if (divisor <= 0) return cost
  return Math.round((cost / divisor) * 100) / 100
}

export function calcMaterialLineCost(quantity, avgUnitCost) {
  const qty = Number(quantity) || 0
  const cost = Number(avgUnitCost) || 0
  return Math.round(qty * cost * 100) / 100
}

export function meetsTargetMargin(sellingPrice, totalCost, targetMarginPercent) {
  const currentMargin = calcProfitMargin(sellingPrice, totalCost)
  return currentMargin >= Number(targetMarginPercent)
}
