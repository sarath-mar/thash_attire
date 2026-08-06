export function generateSlug(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateSKU(prefix = 'TA', categoryCode = '') {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}${categoryCode ? `-${categoryCode}` : ''}-${timestamp}${random}`
}

export function truncate(text, length = 100) {
  if (!text || text.length <= length) return text
  return `${text.slice(0, length).trim()}...`
}

export function capitalize(text) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key]
    return acc
  }, {})
}

export function omit(obj, keys) {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export function isEmpty(value) {
  if (value == null) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  if (typeof value === 'string') return value.trim() === ''
  return false
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
