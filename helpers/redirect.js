export function safeInternalPath(value, fallback = '/') {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/admin')) return fallback
  if (value === '/account' || value.startsWith('/account/') || value.startsWith('/cart') || value.startsWith('/checkout')) {
    return '/'
  }
  return value
}
