export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { initAuth, isAuthenticated } = useAuth()
  await initAuth()

  if (!isAuthenticated.value) {
    return navigateTo('/admin/login')
  }
})
