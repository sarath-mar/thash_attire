import { ProductService } from '~/services/ProductService.js'
import { ErrorMessages } from '~/constants/index.js'
import { PaginationDefaults } from '~/constants/app.js'

export function useProducts() {
  const products = ref([])
  const product = ref(null)
  const total = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const { error: showError } = useSnackbar()

  const fetchProducts = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const result = await ProductService.getAll(filters)
      products.value = result.data
      total.value = result.total
      return result
    } catch (err) {
      error.value = err.message
      showError(err.message || ErrorMessages.FETCH_FAILED)
      return { data: [], total: 0 }
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      product.value = await ProductService.getById(id)
      return product.value
    } catch (err) {
      error.value = err.message
      showError(err.message || ErrorMessages.FETCH_FAILED)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchFeatured = async (limit = 8) => {
    loading.value = true
    try {
      const result = await ProductService.getFeatured(limit)
      products.value = result.data
      return result.data
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchTrending = async (limit = 8) => {
    loading.value = true
    try {
      const result = await ProductService.getTrending(limit)
      products.value = result.data
      return result.data
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
      return []
    } finally {
      loading.value = false
    }
  }

  const totalPages = computed(() =>
    Math.ceil(total.value / (PaginationDefaults.LIMIT)),
  )

  return {
    products: readonly(products),
    product: readonly(product),
    total: readonly(total),
    loading: readonly(loading),
    error: readonly(error),
    totalPages,
    fetchProducts,
    fetchProduct,
    fetchFeatured,
    fetchTrending,
  }
}
