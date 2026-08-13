/**
 * In-memory mock store for materials UI phase.
 * Initialized from mock/materials.js and mock/dashboard.js.
 * Replace with Supabase services in the API integration phase.
 */

import { MOCK_MATERIALS, calcWeightedAvg } from './materials.js'
import { MOCK_MATERIAL_PURCHASES, getMaterialStockHistory } from './dashboard.js'

let materials = structuredClone(MOCK_MATERIALS)
let purchases = structuredClone(MOCK_MATERIAL_PURCHASES)

export function getMockMaterials() {
  return materials
}

export function getMockMaterialById(id) {
  return materials.find(m => m.id === id) || null
}

export function getMockMaterialsByType(type, search = '') {
  let result = materials.filter(m => m.type === type)
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.supplier || '').toLowerCase().includes(q),
    )
  }
  return result.sort((a, b) => a.name.localeCompare(b.name))
}

export function getMockAllMaterials(search = '') {
  let result = [...materials]
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.supplier || '').toLowerCase().includes(q),
    )
  }
  return result.sort((a, b) => a.name.localeCompare(b.name))
}

export function createMockMaterial(data) {
  const material = {
    ...data,
    id: `mat-${Date.now()}`,
    current_stock: 0,
    avg_unit_cost: 0,
    total_inventory_value: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  materials.unshift(material)
  return material
}

export function updateMockMaterial(id, data) {
  const idx = materials.findIndex(m => m.id === id)
  if (idx === -1) return null
  materials[idx] = {
    ...materials[idx],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return materials[idx]
}

export function deleteMockMaterial(id) {
  const idx = materials.findIndex(m => m.id === id)
  if (idx !== -1) materials.splice(idx, 1)
}

export function getMockPurchases(materialId = null, search = '') {
  let result = [...purchases]
  if (materialId) result = result.filter(p => p.material_id === materialId)
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(p =>
      p.material_name?.toLowerCase().includes(q) ||
      (p.supplier || '').toLowerCase().includes(q),
    )
  }
  return result.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
}

export function createMockPurchase(purchase) {
  const material = getMockMaterialById(purchase.material_id)
  if (!material) throw new Error('Material not found')

  const quantity = Number(purchase.quantity) || 0
  const totalAmount = Number(purchase.total_amount) || 0
  const unitCost = quantity > 0 ? Math.round((totalAmount / quantity) * 100) / 100 : 0

  const avgResult = calcWeightedAvg(
    material.current_stock,
    material.avg_unit_cost,
    quantity,
    totalAmount,
  )

  updateMockMaterial(material.id, {
    current_stock: avgResult.newStock,
    avg_unit_cost: avgResult.newAvgCost,
    total_inventory_value: avgResult.totalValue,
  })

  const record = {
    id: `mp-${Date.now()}`,
    material_id: purchase.material_id,
    material_name: material.name,
    material_type: material.type,
    supplier: purchase.supplier || material.supplier || '',
    purchase_date: purchase.purchase_date,
    quantity,
    unit: purchase.unit || material.unit,
    total_amount: totalAmount,
    unit_cost: unitCost,
    notes: purchase.notes || '',
    created_at: new Date().toISOString(),
  }

  purchases.unshift(record)
  return record
}

export function deleteMockPurchase(id) {
  const idx = purchases.findIndex(p => p.id === id)
  if (idx !== -1) purchases.splice(idx, 1)
}

export { getMaterialStockHistory }
