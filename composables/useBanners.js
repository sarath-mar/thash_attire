import { BannerService } from '~/services/BannerService.js'

export function useBanners() {
  const banners = ref([])
  const loading = ref(false)

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

  return {
    banners: readonly(banners),
    loading: readonly(loading),
    fetchActiveBanners,
  }
}
