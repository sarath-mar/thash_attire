import { PaginationDefaults } from '~/constants/app.js'

export function paginate(items, page = 1, limit = PaginationDefaults.LIMIT) {
  if (!items?.length) {
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    }
  }

  const total = items.length
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.max(1, Math.min(page, totalPages || 1))
  const start = (currentPage - 1) * limit
  const data = items.slice(start, start + limit)

  return {
    data,
    total,
    page: currentPage,
    limit,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  }
}

export function getPaginationRange(currentPage, totalPages, delta = 2) {
  const range = []
  const start = Math.max(1, currentPage - delta)
  const end = Math.min(totalPages, currentPage + delta)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  return range
}
