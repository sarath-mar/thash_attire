export function formatDate(date, options = {}) {
  if (!date) return ''

  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const {
    day = '2-digit',
    month = 'short',
    year = 'numeric',
    hour,
    minute,
  } = options

  const formatOptions = { day, month, year }

  if (hour !== undefined) {
    formatOptions.hour = hour
    formatOptions.minute = minute ?? '2-digit'
    formatOptions.hour12 = true
  }

  return new Intl.DateTimeFormat('en-IN', formatOptions).format(d)
}

export function toDateInput(value) {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function addDays(value, days) {
  const input = toDateInput(value || new Date())
  if (!input) return ''
  const [year, month, day] = input.split('-').map(Number)
  return toDateInput(new Date(year, month - 1, day + days))
}

export function expectedDeliveryOf(order) {
  if (!order) return ''
  if (order.expected_delivery) return order.expected_delivery
  const received = order.order_date || order.sale_date || order.created_at
  return received ? addDays(received, 5) : ''
}

export function formatDateApi(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

export function getMonthYear(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(d)
}

export function getStartOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getEndOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
}

export function getStartOfYear(date = new Date()) {
  return new Date(date.getFullYear(), 0, 1)
}

export function getMonthsInYear(year = new Date().getFullYear()) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(new Date(year, i, 1)),
  }))
}
