export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`
}

export function isValidFileType(file, allowedTypes) {
  if (!file || !allowedTypes) return false
  return allowedTypes.includes(file.type)
}

export function isValidFileSize(file, maxSize) {
  if (!file) return false
  return file.size <= maxSize
}

export function getFileExtension(filename) {
  if (!filename) return ''
  return filename.split('.').pop()?.toLowerCase() || ''
}
