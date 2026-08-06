import { AppConfig } from '~/constants/app.js'

export function formatCurrency(amount, options = {}) {
  if (amount == null || isNaN(amount)) return `${AppConfig.CURRENCY_SYMBOL}0`

  const { showSymbol = true, minimumFractionDigits = 0, maximumFractionDigits = 2 } = options

  const formatted = new Intl.NumberFormat(AppConfig.LOCALE, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: AppConfig.CURRENCY,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)

  return formatted
}

export function parseCurrency(value) {
  if (typeof value === 'number') return value
  if (!value) return 0
  return parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0
}
