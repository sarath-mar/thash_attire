export function filterByField(items, field, value) {
  if (!items?.length || value == null || value === '') return items || []
  return items.filter((item) => getNestedValue(item, field) === value)
}

export function filterByFields(items, filters = {}) {
  if (!items?.length) return []

  return items.filter((item) =>
    Object.entries(filters).every(([field, value]) => {
      if (value == null || value === '' || (Array.isArray(value) && !value.length)) {
        return true
      }

      const itemValue = getNestedValue(item, field)

      if (Array.isArray(value)) {
        return value.includes(itemValue)
      }

      return itemValue === value
    }),
  )
}

export function filterByPriceRange(items, min, max, priceField = 'selling_price') {
  if (!items?.length) return []

  return items.filter((item) => {
    const price = getNestedValue(item, priceField)
    if (price == null) return false
    if (min != null && price < min) return false
    if (max != null && price > max) return false
    return true
  })
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}
