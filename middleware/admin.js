export default defineNuxtRouteMiddleware(async (to) => {
  const { initAuth, isAuthenticated } = useAuth()

  await initAuth()

  if (!isAuthenticated.value) {
    return navigateTo('/admin/login')
  }
})
