import { ProductService } from '~/services/ProductService.js'
import { ErrorMessages } from '~/constants/index.js'
import { PaginationDefaults } from '~/constants/app.js'

export function useProducts() {
  const products = ref([])
  const product = ref(null)
  const total = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const { success, error: showError } = useSnackbar()

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

  const createProduct = async (data) => {
    saving.value = true
    try {
      const result = await ProductService.create(data)
      products.value = [result, ...products.value]
      total.value += 1
      success('Product created successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const updateProduct = async (id, data) => {
    saving.value = true
    try {
      const result = await ProductService.update(id, data)
      const idx = products.value.findIndex(p => p.id === id)
      if (idx !== -1) products.value[idx] = result
      if (product.value?.id === id) product.value = result
      success('Product updated successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deleteProduct = async (id) => {
    try {
      await ProductService.delete(id)
      products.value = products.value.filter(p => p.id !== id)
      total.value = Math.max(0, total.value - 1)
      success('Product deleted successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  const totalPages = computed(() =>
    Math.ceil(total.value / (PaginationDefaults.ADMIN_LIMIT)),
  )

  return {
    products: readonly(products),
    product: readonly(product),
    total: readonly(total),
    loading: readonly(loading),
    saving: readonly(saving),
    error: readonly(error),
    totalPages,
    fetchProducts,
    fetchProduct,
    fetchFeatured,
    fetchTrending,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}
