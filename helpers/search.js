export function searchItems(items, query, fields = ['name']) {
  if (!query || !items?.length) return items || []

  const normalizedQuery = query.toLowerCase().trim()

  return items.filter((item) =>
    fields.some((field) => {
      const value = getNestedValue(item, field)
      return value && String(value).toLowerCase().includes(normalizedQuery)
    }),
  )
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function highlightMatch(text, query) {
  if (!query || !text) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
