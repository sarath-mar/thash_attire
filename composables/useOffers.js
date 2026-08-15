import { OfferService } from '~/services/OfferService.js'
import { ErrorMessages } from '~/constants/index.js'
import { PaginationDefaults } from '~/constants/app.js'

export function useOffers() {
  const offers = ref([])
  const offer = ref(null)
  const total = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const { success, error: showError } = useSnackbar()

  const totalPages = computed(() => Math.ceil(total.value / PaginationDefaults.ADMIN_LIMIT))

  const fetchOffers = async (filters = {}) => {
    loading.value = true
    try {
      const result = await OfferService.getAll({ limit: PaginationDefaults.ADMIN_LIMIT, ...filters })
      offers.value = result.data
      total.value = result.total
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const fetchOffer = async (id) => {
    loading.value = true
    try {
      offer.value = await OfferService.getById(id)
    } catch (err) {
      showError(err.message || ErrorMessages.FETCH_FAILED)
    } finally {
      loading.value = false
    }
  }

  const createOffer = async (data, items) => {
    saving.value = true
    try {
      const result = await OfferService.create(data, items)
      offers.value = [result, ...offers.value]
      total.value += 1
      success('Offer created successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const updateOffer = async (id, data, items) => {
    saving.value = true
    try {
      const result = await OfferService.update(id, data, items)
      const idx = offers.value.findIndex(o => o.id === id)
      if (idx !== -1) offers.value[idx] = result
      if (offer.value?.id === id) offer.value = result
      success('Offer updated successfully')
      return result
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return null
    } finally {
      saving.value = false
    }
  }

  const deleteOffer = async (id) => {
    try {
      await OfferService.delete(id)
      offers.value = offers.value.filter(o => o.id !== id)
      total.value = Math.max(0, total.value - 1)
      success('Offer deleted successfully')
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
      return false
    }
  }

  // Calculate regular total for an offer based on product selling prices
  const calcRegularTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.product?.selling_price || item.selling_price || 0) * (item.quantity || 1), 0)
  }

  const calcSavings = (regularTotal, offerPrice) => {
    return Math.max(0, regularTotal - offerPrice)
  }

  const calcSavingsPercentage = (regularTotal, offerPrice) => {
    if (regularTotal <= 0) return 0
    const savings = calcSavings(regularTotal, offerPrice)
    return Math.round((savings / regularTotal) * 100)
  }

  // Allocate combo price proportionally to each product
  const allocateComboPrice = (items, offerPrice) => {
    const regularTotal = calcRegularTotal(items)
    if (regularTotal <= 0) return items.map(i => 0)

    let remaining = offerPrice
    const allocated = items.map((item, index) => {
      const itemRegularTotal = (item.product?.selling_price || item.selling_price || 0) * (item.quantity || 1)
      const proportion = itemRegularTotal / regularTotal
      
      // Calculate allocated amount for this entire line item
      let lineAllocatedAmount = Number((offerPrice * proportion).toFixed(2))
      
      // Adjust the last item to avoid rounding errors (must sum exactly to offerPrice)
      if (index === items.length - 1) {
        lineAllocatedAmount = remaining
      } else {
        remaining -= lineAllocatedAmount
      }

      // Calculate unit allocated price
      const unitAllocatedPrice = Number((lineAllocatedAmount / (item.quantity || 1)).toFixed(2))
      return unitAllocatedPrice
    })
    
    return allocated
  }

  return {
    offers: readonly(offers),
    offer: readonly(offer),
    total: readonly(total),
    loading: readonly(loading),
    saving: readonly(saving),
    totalPages,
    fetchOffers,
    fetchOffer,
    createOffer,
    updateOffer,
    deleteOffer,
    calcRegularTotal,
    calcSavings,
    calcSavingsPercentage,
    allocateComboPrice
  }
}
