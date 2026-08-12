import { CategoryService } from '~/services/CategoryService.js'
import { ErrorMessages } from '~/constants/index.js'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const { success, error: showError } = useSnackbar()

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      categories.value = await CategoryService.getAll()
      return categories.value
    } catch (err) {
      error.value = err.message
      showError(err.message || ErrorMessages.FETCH_FAILED)
      return []
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (data) => {
    saving.value = true
    try {
      const result = await CategoryService.create(data)
      categories.value = [...categories.value, result]
      success('Category created successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const updateCategory = async (id, data) => {
    saving.value = true
    try {
      const result = await CategoryService.update(id, data)
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx !== -1) categories.value[idx] = result
      success('Category updated successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deleteCategory = async (id) => {
    try {
      await CategoryService.delete(id)
      categories.value = categories.value.filter(c => c.id !== id)
      success('Category deleted successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  const toggleStatus = async (id) => {
    const cat = categories.value.find(c => c.id === id)
    if (!cat) return false
    return updateCategory(id, { is_active: !cat.is_active })
  }

  return {
    categories: readonly(categories),
    loading: readonly(loading),
    saving: readonly(saving),
    error: readonly(error),
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleStatus,
  }
}
