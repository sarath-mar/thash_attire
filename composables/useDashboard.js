import { DashboardService } from '~/services/DashboardService.js'
import { ErrorMessages } from '~/constants/index.js'

export function useDashboard() {
  const { error: showError } = useSnackbar()

  const summary = ref(null)
  const recentSales = ref([])
  const lowStockProducts = ref([])
  const topProducts = ref([])

  const loadingSummary = ref(false)
  const loadingRecentSales = ref(false)
  const loadingLowStock = ref(false)
  const loadingTopProducts = ref(false)

  const fetchSummary = async () => {
    loadingSummary.value = true
    try {
      summary.value = await DashboardService.getSummary()
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
    } finally {
      loadingSummary.value = false
    }
  }

  const fetchRecentSales = async (limit = 5) => {
    loadingRecentSales.value = true
    try {
      recentSales.value = await DashboardService.getRecentSales(limit)
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
    } finally {
      loadingRecentSales.value = false
    }
  }

  const fetchLowStockProducts = async (threshold = 5) => {
    loadingLowStock.value = true
    try {
      lowStockProducts.value = await DashboardService.getLowStockProducts(threshold)
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
    } finally {
      loadingLowStock.value = false
    }
  }

  const fetchTopProducts = async (limit = 5) => {
    loadingTopProducts.value = true
    try {
      topProducts.value = await DashboardService.getTopSellingProducts(limit)
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
    } finally {
      loadingTopProducts.value = false
    }
  }

  const fetchAll = async () => {
    await Promise.all([
      fetchSummary(),
      fetchRecentSales(),
      fetchLowStockProducts(),
      fetchTopProducts(),
    ])
  }

  return {
    summary: readonly(summary),
    recentSales: readonly(recentSales),
    lowStockProducts: readonly(lowStockProducts),
    topProducts: readonly(topProducts),
    loadingSummary: readonly(loadingSummary),
    loadingRecentSales: readonly(loadingRecentSales),
    loadingLowStock: readonly(loadingLowStock),
    loadingTopProducts: readonly(loadingTopProducts),
    fetchSummary,
    fetchRecentSales,
    fetchLowStockProducts,
    fetchTopProducts,
    fetchAll,
  }
}
