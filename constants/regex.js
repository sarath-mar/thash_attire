export const Regex = Object.freeze({
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+91|91|0)?[6-9]\d{9}$/,
  PHONE_INTERNATIONAL: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  SKU: /^[A-Z0-9-]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  NUMERIC: /^\d+(\.\d+)?$/,
})
