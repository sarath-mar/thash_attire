import { SalesService } from '~/services/SalesService.js'
import { ErrorMessages } from '~/constants/index.js'
import { PaginationDefaults } from '~/constants/app.js'

export function useSales() {
  const sales = ref([])
  const sale = ref(null)
  const total = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const { success, error: showError } = useSnackbar()

  const totalPages = computed(() => Math.ceil(total.value / PaginationDefaults.ADMIN_LIMIT))

  const fetchSales = async (filters = {}) => {
    loading.value = true
    try {
      const result = await SalesService.getAll({ limit: PaginationDefaults.ADMIN_LIMIT, ...filters })
      sales.value = result.data
      total.value = result.total
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const fetchSale = async (id) => {
    loading.value = true
    try {
      sale.value = await SalesService.getById(id)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const createSale = async (data) => {
    saving.value = true
    try {
      const result = await SalesService.create(data)
      sales.value = [result, ...sales.value]
      total.value += 1
      success('Sale recorded successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await SalesService.updatePaymentStatus(id, paymentStatus)
      const idx = sales.value.findIndex(s => s.id === id)
      if (idx !== -1) sales.value[idx] = { ...sales.value[idx], payment_status: paymentStatus }
      success('Payment status updated')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  const deleteSale = async (id) => {
    try {
      await SalesService.delete(id)
      sales.value = sales.value.filter(s => s.id !== id)
      total.value = Math.max(0, total.value - 1)
      success('Sale deleted successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  return {
    sales: readonly(sales),
    sale: readonly(sale),
    total: readonly(total),
    loading: readonly(loading),
    saving: readonly(saving),
    totalPages,
    fetchSales,
    fetchSale,
    createSale,
    updatePaymentStatus,
    deleteSale,
  }
}
