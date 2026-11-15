export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { initCustomerAuth, isAuthenticated } = useCustomerAuth()
  await initCustomerAuth()

  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
