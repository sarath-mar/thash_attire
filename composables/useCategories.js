import { CategoryService } from '~/services/CategoryService.js'
import { ErrorMessages } from '~/constants/index.js'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const { error: showError } = useSnackbar()

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

  return {
    categories: readonly(categories),
    loading: readonly(loading),
    error: readonly(error),
    fetchCategories,
  }
}
