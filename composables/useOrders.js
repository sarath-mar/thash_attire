import { OrderService } from '~/services/OrderService.js'
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
      const result = await OrderService.getAll({ limit: PaginationDefaults.ADMIN_LIMIT, ...filters })
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
      order.value = await OrderService.getById(id)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (data) => {
    saving.value = true
    try {
      const result = await OrderService.create(data)
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
      const result = await OrderService.update(id, data)
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
      const result = await OrderService.updateStatus(id, nextStatus, notes)
      const idx = orders.value.findIndex(o => o.id === id)
      if (idx !== -1) orders.value[idx] = result
      if (order.value?.id === id) order.value = result
      success('Order status updated')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deleteOrder = async (id) => {
    try {
      await OrderService.delete(id)
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
