import { BannerService } from '~/services/BannerService.js'
import { ErrorMessages } from '~/constants/index.js'

export function useBanners() {
  const banners = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const { success, error: showError } = useSnackbar()

  const fetchActiveBanners = async () => {
    loading.value = true
    try {
      banners.value = await BannerService.getActive()
      return banners.value
    } catch {
      banners.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchAllBanners = async () => {
    loading.value = true
    try {
      banners.value = await BannerService.getAll()
      return banners.value
    } catch {
      showError('Failed to fetch banners')
      banners.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const createBanner = async (data) => {
    saving.value = true
    try {
      const result = await BannerService.create(data)
      banners.value = [...banners.value, result].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      success('Banner created successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const updateBanner = async (id, data) => {
    saving.value = true
    try {
      const result = await BannerService.update(id, data)
      const idx = banners.value.findIndex(b => b.id === id)
      if (idx !== -1) banners.value[idx] = result
      banners.value.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      success('Banner updated successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deleteBanner = async (id) => {
    try {
      await BannerService.delete(id)
      banners.value = banners.value.filter(b => b.id !== id)
      success('Banner deleted successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  return {
    banners: readonly(banners),
    loading: readonly(loading),
    saving: readonly(saving),
    fetchActiveBanners,
    fetchAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
  }
}
