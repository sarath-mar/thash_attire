import { MaterialPurchaseService } from '~/services/MaterialPurchaseService.js'
import { ErrorMessages } from '~/constants/index.js'

export function useMaterialPurchases() {
  const purchases = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const { success, error: showError } = useSnackbar()

  const fetchPurchases = async (materialId = null, search = '') => {
    loading.value = true
    try {
      purchases.value = await MaterialPurchaseService.getAll(materialId, search)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const createPurchase = async (data) => {
    saving.value = true
    try {
      const result = await MaterialPurchaseService.create(data)
      purchases.value = [result, ...purchases.value]
      success('Purchase recorded successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deletePurchase = async (id) => {
    try {
      await MaterialPurchaseService.delete(id)
      purchases.value = purchases.value.filter(p => p.id !== id)
      success('Purchase record deleted')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  return {
    purchases: readonly(purchases),
    loading: readonly(loading),
    saving: readonly(saving),
    fetchPurchases,
    createPurchase,
    deletePurchase,
  }
}
