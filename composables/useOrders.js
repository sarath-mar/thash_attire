import { SalesService } from '~/services/SalesService.js'
import { ErrorMessages } from '~/constants/index.js'
import { PaginationDefaults } from '~/constants/app.js'

export function useOrders() {
  const orders = ref([])
  const order = ref(null)
  const total = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const { success, error: showError } = useSnackbar()

  const totalPages = computed(() => Math.ceil(total.value / PaginationDefaults.ADMIN_LIMIT))

  const fetchOrders = async (filters = {}) => {
    loading.value = true
    try {
      const result = await SalesService.getAll({ limit: PaginationDefaults.ADMIN_LIMIT, ...filters })
      orders.value = result.data
      total.value = result.total
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const fetchOrder = async (id) => {
    loading.value = true
    try {
      order.value = await SalesService.getById(id)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (data) => {
    saving.value = true
    try {
      const result = await SalesService.create(data)
      orders.value = [result, ...orders.value]
      total.value += 1
      success('Order created successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const updateOrder = async (id, data) => {
    saving.value = true
    try {
      // We will need to implement SalesService.update
      const result = await SalesService.update(id, data)
      const idx = orders.value.findIndex(o => o.id === id)
      if (idx !== -1) orders.value[idx] = result
      if (order.value?.id === id) order.value = result
      success('Order updated successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const advanceOrderStatus = async (id, nextStatus, notes = '') => {
    saving.value = true
    try {
      const orderData = await SalesService.getById(id)
      const history = [...(orderData.status_history || [])]
      const now = new Date().toISOString()
      if (!history.find(h => h.status === nextStatus)) {
        history.push({ status: nextStatus, date: now, notes })
      }
      const result = await SalesService.updateOrderStatus(id, nextStatus, history)
      
      const idx = orders.value.findIndex(o => o.id === id)
      // fetch updated order to replace
      const updatedOrder = await SalesService.getById(id)
      if (idx !== -1) orders.value[idx] = updatedOrder
      if (order.value?.id === id) order.value = updatedOrder
      
      success('Order status updated')
      return updatedOrder
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deleteOrder = async (id) => {
    try {
      await SalesService.delete(id)
      orders.value = orders.value.filter(o => o.id !== id)
      total.value = Math.max(0, total.value - 1)
      success('Order deleted successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  return {
    orders: readonly(orders),
    order: readonly(order),
    total: readonly(total),
    loading: readonly(loading),
    saving: readonly(saving),
    totalPages,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    advanceOrderStatus,
    deleteOrder,
  }
}
