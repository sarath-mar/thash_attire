import { MaterialService } from '~/services/MaterialService.js'
import { ErrorMessages } from '~/constants/index.js'

export function useMaterials() {
  const materials = ref([])
  const material = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const { success, error: showError } = useSnackbar()

  const fetchMaterials = async (search = '') => {
    loading.value = true
    try {
      materials.value = await MaterialService.getAll(search)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const fetchMaterial = async (id) => {
    loading.value = true
    try {
      material.value = await MaterialService.getById(id)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const createMaterial = async (data) => {
    saving.value = true
    try {
      const result = await MaterialService.create(data)
      materials.value = [result, ...materials.value]
      success('Material added successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const updateMaterial = async (id, data) => {
    saving.value = true
    try {
      const result = await MaterialService.update(id, data)
      const idx = materials.value.findIndex(m => m.id === id)
      if (idx !== -1) materials.value[idx] = result
      success('Material updated successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deleteMaterial = async (id) => {
    try {
      await MaterialService.delete(id)
      materials.value = materials.value.filter(m => m.id !== id)
      success('Material deleted successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  return {
    materials: readonly(materials),
    material: readonly(material),
    loading: readonly(loading),
    saving: readonly(saving),
    fetchMaterials,
    fetchMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  }
}
