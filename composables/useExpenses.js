import { ExpenseService } from '~/services/ExpenseService.js'
import { ErrorMessages } from '~/constants/index.js'
import { PaginationDefaults } from '~/constants/app.js'

export function useExpenses() {
  const expenses = ref([])
  const total = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const { success, error: showError } = useSnackbar()

  const totalPages = computed(() => Math.ceil(total.value / PaginationDefaults.ADMIN_LIMIT))

  const fetchExpenses = async (filters = {}) => {
    loading.value = true
    try {
      const result = await ExpenseService.getAll({ limit: PaginationDefaults.ADMIN_LIMIT, ...filters })
      expenses.value = result.data
      total.value = result.total
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const createExpense = async (data) => {
    saving.value = true
    try {
      const result = await ExpenseService.create(data)
      expenses.value = [result, ...expenses.value]
      total.value += 1
      success('Expense added successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const updateExpense = async (id, data) => {
    saving.value = true
    try {
      const result = await ExpenseService.update(id, data)
      const idx = expenses.value.findIndex(e => e.id === id)
      if (idx !== -1) expenses.value[idx] = result
      success('Expense updated successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deleteExpense = async (id) => {
    try {
      await ExpenseService.delete(id)
      expenses.value = expenses.value.filter(e => e.id !== id)
      total.value = Math.max(0, total.value - 1)
      success('Expense deleted successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  return {
    expenses: readonly(expenses),
    total: readonly(total),
    loading: readonly(loading),
    saving: readonly(saving),
    totalPages,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}
