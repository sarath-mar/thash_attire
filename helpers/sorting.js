export function sortBy(items, field, direction = 'asc') {
  if (!items?.length) return []

  return [...items].sort((a, b) => {
    const aVal = getNestedValue(a, field)
    const bVal = getNestedValue(b, field)

    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    let comparison = 0

    if (typeof aVal === 'string') {
      comparison = aVal.localeCompare(bVal)
    } else {
      comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    }

    return direction === 'desc' ? -comparison : comparison
  })
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function sortByDate(items, field, direction = 'desc') {
  return sortBy(items, field, direction)
}

export function sortByName(items, direction = 'asc') {
  return sortBy(items, 'name', direction)
}
