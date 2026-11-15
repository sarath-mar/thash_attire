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

export function useCart() {
  onMounted(ensureHydrated)

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))

  function addItem(item) {
    ensureHydrated()
    const key = itemKey(item)
    const existing = items.value.find(entry => itemKey(entry) === key)
    if (existing) {
      existing.quantity = Math.min(20, existing.quantity + (item.quantity || 1))
    } else {
      items.value.push({
        productId: item.productId,
        name: item.name,
        price: Number(item.price) || 0,
        image: item.image || '',
        size: item.size || '',
        color: item.color || '',
        sku: item.sku || '',
        quantity: Math.min(20, item.quantity || 1),
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
    addItem,
    setQuantity,
    removeItem,
    clear,
  }
}
