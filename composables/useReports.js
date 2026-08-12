import { ReportService } from '~/services/ReportService.js'
import { ErrorMessages } from '~/constants/index.js'

export function useReports() {
  const salesReport = ref(null)
  const expenseReport = ref(null)
  const profitReport = ref(null)
  const inventoryReport = ref(null)
  const customerReport = ref(null)

  const loading = ref(false)
  const period = ref('month')
  const customDateFrom = ref('')
  const customDateTo = ref('')
  const { error: showError } = useSnackbar()

  const fetchSalesReport = async () => {
    try {
      salesReport.value = await ReportService.getSalesReport(period.value, customDateFrom.value, customDateTo.value)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    }
  }

  const fetchExpenseReport = async () => {
    try {
      expenseReport.value = await ReportService.getExpenseReport(period.value, customDateFrom.value, customDateTo.value)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    }
  }

  const fetchProfitReport = async () => {
    try {
      profitReport.value = await ReportService.getProfitReport(period.value, customDateFrom.value, customDateTo.value)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    }
  }

  const fetchInventoryReport = async () => {
    try {
      inventoryReport.value = await ReportService.getInventoryReport()
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    }
  }

  const fetchCustomerReport = async () => {
    try {
      customerReport.value = await ReportService.getCustomerReport(period.value, customDateFrom.value, customDateTo.value)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    }
  }

  const fetchAll = async () => {
    loading.value = true
    try {
      await Promise.all([
        fetchSalesReport(),
        fetchExpenseReport(),
        fetchProfitReport(),
        fetchInventoryReport(),
        fetchCustomerReport(),
      ])
    } finally {
      loading.value = false
    }
  }

  return {
    salesReport: readonly(salesReport),
    expenseReport: readonly(expenseReport),
    profitReport: readonly(profitReport),
    inventoryReport: readonly(inventoryReport),
    customerReport: readonly(customerReport),
    loading: readonly(loading),
    period,
    customDateFrom,
    customDateTo,
    fetchSalesReport,
    fetchExpenseReport,
    fetchProfitReport,
    fetchInventoryReport,
    fetchCustomerReport,
    fetchAll,
  }
}
