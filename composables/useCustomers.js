import { CustomerService } from '~/services/CustomerService.js'
import { ErrorMessages } from '~/constants/index.js'
import { PaginationDefaults } from '~/constants/app.js'

export function useCustomers() {
  const customers = ref([])
  const customer = ref(null)
  const purchaseHistory = ref([])
  const total = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const { success, error: showError } = useSnackbar()

  const totalPages = computed(() => Math.ceil(total.value / PaginationDefaults.ADMIN_LIMIT))

  const fetchCustomers = async (filters = {}) => {
    loading.value = true
    try {
      const result = await CustomerService.getAll({ limit: PaginationDefaults.ADMIN_LIMIT, ...filters })
      customers.value = result.data
      total.value = result.total
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const fetchCustomer = async (id) => {
    loading.value = true
    try {
      customer.value = await CustomerService.getById(id)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const fetchPurchaseHistory = async (customerId) => {
    try {
      purchaseHistory.value = await CustomerService.getPurchaseHistory(customerId)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    }
  }

  const createCustomer = async (data) => {
    saving.value = true
    try {
      const result = await CustomerService.create(data)
      customers.value = [result, ...customers.value]
      total.value += 1
      success('Customer added successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const updateCustomer = async (id, data) => {
    saving.value = true
    try {
      const result = await CustomerService.update(id, data)
      const idx = customers.value.findIndex(c => c.id === id)
      if (idx !== -1) customers.value[idx] = result
      if (customer.value?.id === id) customer.value = result
      success('Customer updated successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deleteCustomer = async (id) => {
    try {
      await CustomerService.delete(id)
      customers.value = customers.value.filter(c => c.id !== id)
      total.value = Math.max(0, total.value - 1)
      success('Customer deleted successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  return {
    customers: readonly(customers),
    customer: readonly(customer),
    purchaseHistory: readonly(purchaseHistory),
    total: readonly(total),
    loading: readonly(loading),
    saving: readonly(saving),
    totalPages,
    fetchCustomers,
    fetchCustomer,
    fetchPurchaseHistory,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  }
}
