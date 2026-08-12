import { InventoryService } from '~/services/InventoryService.js'
import { ProductService } from '~/services/ProductService.js'
import { ErrorMessages } from '~/constants/index.js'

export function useInventory() {
  const products = ref([])
  const total = ref(0)
  const loading = ref(false)
  const adjusting = ref(false)
  const { success, error: showError } = useSnackbar()

  const fetchInventory = async (filters = {}) => {
    loading.value = true
    try {
      // Try InventoryService first; fall back to ProductService with all statuses
      const result = await InventoryService.getAll(filters)
      if (result.data.length > 0) {
        products.value = result.data
        total.value = result.total
      } else {
        // Mock fallback via ProductService
        const allStatuses = await ProductService.getAll({ ...filters, status: null, limit: 100 })
        products.value = allStatuses.data
        total.value = allStatuses.total
      }
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const adjustStock = async (productId, newStock) => {
    adjusting.value = true
    try {
      await InventoryService.adjustStock(productId, newStock)
      const idx = products.value.findIndex(p => p.id === productId)
      if (idx !== -1) {
        products.value[idx] = {
          ...products.value[idx],
          stock: newStock,
          status: newStock === 0 ? 'out_of_stock' : 'active',
        }
      }
      success('Stock updated successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    } finally {
      adjusting.value = false
    }
  }

  const getStockStatus = (product) => {
    const threshold = product.low_stock_threshold || 5
    if (product.stock === 0) return 'out_of_stock'
    if (product.stock <= threshold) return 'low_stock'
    return 'in_stock'
  }

  return {
    products: readonly(products),
    total: readonly(total),
    loading: readonly(loading),
    adjusting: readonly(adjusting),
    fetchInventory,
    adjustStock,
    getStockStatus,
  }
}
