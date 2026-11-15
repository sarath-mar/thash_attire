import { safeInternalPath } from '~/helpers/redirect.js'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { initCustomerAuth, isAuthenticated } = useCustomerAuth()
  await initCustomerAuth()

  if (isAuthenticated.value) {
    const redirect = Array.isArray(to.query.redirect) ? to.query.redirect[0] : to.query.redirect
    return navigateTo(safeInternalPath(redirect, '/'))
  }
})
