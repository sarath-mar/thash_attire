const CART_KEY = 'thash-attire-cart'

const items = ref([])
let hydrated = false

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist() {
  if (!hydrated || !import.meta.client) return
  localStorage.setItem(CART_KEY, JSON.stringify(items.value))
}

function ensureHydrated() {
  if (hydrated || !import.meta.client) return
  items.value = readCart()
  hydrated = true
}

function itemKey(item) {
  return [item.productId, item.size || '', item.color || ''].join('|')
}

function offerStillApplies(list) {
  if (!list.length) return false
  const offerId = list[0].offerId
  if (!offerId) return false
  return list.every(item => item.offerId === offerId && item.quantity === item.offerQty && item.offerLineTotal != null)
}

function lineAmount(item, list = items.value) {
  if (offerStillApplies(list)) return Number(item.offerLineTotal) || 0
  const unit = item.listPrice != null ? Number(item.listPrice) : Number(item.price) || 0
  return unit * (Number(item.quantity) || 0)
}

export function useCart() {
  onMounted(ensureHydrated)

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + lineAmount(item), 0))

  function addItem(item) {
    ensureHydrated()
    const key = itemKey(item)
    const existing = items.value.find(entry => itemKey(entry) === key)
    if (existing) {
      existing.quantity = Math.min(20, existing.quantity + (item.quantity || 1))
      if (item.offerId) {
        existing.offerId = item.offerId
        existing.price = Number(item.price) || existing.price
        if (item.listPrice != null) existing.listPrice = Number(item.listPrice)
      }
    } else {
      items.value.push({
        productId: item.productId,
        name: item.name,
        price: Number(item.price) || 0,
        listPrice: item.listPrice != null ? Number(item.listPrice) : Number(item.price) || 0,
        offerLineTotal: item.offerLineTotal != null ? Number(item.offerLineTotal) : null,
        image: item.image || '',
        size: item.size || '',
        color: item.color || '',
        sku: item.sku || '',
        quantity: Math.min(20, item.quantity || 1),
        offerId: item.offerId || '',
        offerQty: item.offerQty || item.quantity || 1,
      })
    }
    persist()
  }

  function setQuantity(key, quantity) {
    ensureHydrated()
    const entry = items.value.find(item => itemKey(item) === key)
    if (!entry) return
    entry.quantity = Math.min(20, Math.max(1, quantity))
    persist()
  }

  function removeItem(key) {
    ensureHydrated()
    items.value = items.value.filter(item => itemKey(item) !== key)
    persist()
  }

  function clear() {
    ensureHydrated()
    items.value = []
    persist()
  }

  return {
    items,
    count,
    subtotal,
    itemKey,
    lineAmount,
    addItem,
    setQuantity,
    removeItem,
    clear,
  }
}
