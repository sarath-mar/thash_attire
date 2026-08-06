export function formatPhone(phone) {
  if (!phone) return ''
  const cleaned = String(phone).replace(/\D/g, '')

  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }

  return phone
}

export function getWhatsAppLink(phone, message = '') {
  if (!phone) return '#'
  const cleaned = String(phone).replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleaned}${message ? `?text=${encodedMessage}` : ''}`
}

export function cleanPhone(phone) {
  if (!phone) return ''
  return String(phone).replace(/\D/g, '')
}
