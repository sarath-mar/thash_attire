export default defineNuxtRouteMiddleware(async () => {
  const { initAuth, isAuthenticated } = useAuth()

  await initAuth()

  if (isAuthenticated.value) {
    return navigateTo('/admin')
  }
})
