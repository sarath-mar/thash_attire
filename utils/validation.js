import { ValidationMessages } from '~/constants/validationMessages.js'
import { Regex } from '~/constants/regex.js'

export function requiredRule(message = ValidationMessages.REQUIRED) {
  return (value) => {
    if (value == null || value === '' || (Array.isArray(value) && !value.length)) {
      return message
    }
    return true
  }
}

export function emailRule(message = ValidationMessages.EMAIL) {
  return (value) => {
    if (!value) return true
    return Regex.EMAIL.test(value) || message
  }
}

export function phoneRule(message = ValidationMessages.PHONE) {
  return (value) => {
    if (!value) return true
    const cleaned = String(value).replace(/\D/g, '')
    return Regex.PHONE.test(cleaned) || message
  }
}

export function minLengthRule(min, message) {
  return (value) => {
    if (!value) return true
    return value.length >= min || message || ValidationMessages.MIN_LENGTH(min)
  }
}

export function maxLengthRule(max, message) {
  return (value) => {
    if (!value) return true
    return value.length <= max || message || ValidationMessages.MAX_LENGTH(max)
  }
}

export function minValueRule(min, message) {
  return (value) => {
    if (value == null || value === '') return true
    return Number(value) >= min || message || ValidationMessages.MIN_VALUE(min)
  }
}

export function positiveNumberRule(message = ValidationMessages.POSITIVE_NUMBER) {
  return (value) => {
    if (value == null || value === '') return true
    return Number(value) > 0 || message
  }
}

export function urlRule(message = ValidationMessages.INVALID_URL) {
  return (value) => {
    if (!value) return true
    return Regex.URL.test(value) || message
  }
}

export function combineRules(...rules) {
  return (value) => {
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) return result
    }
    return true
  }
}
