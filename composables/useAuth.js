import { AuthService } from '~/services/AuthService.js'
import { ErrorMessages, SuccessMessages } from '~/constants/index.js'

export function useAuth() {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const isAuthenticated = computed(() => !!session.value)
  const { success, error: showError } = useSnackbar()

  const initAuth = async () => {
    loading.value = true
    try {
      session.value = await AuthService.getSession()
      user.value = session.value?.user || null
    } catch {
      session.value = null
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const login = async (email, password) => {
    loading.value = true
    try {
      const data = await AuthService.login(email, password)
      session.value = data.session
      user.value = data.user
      success(SuccessMessages.LOGIN)
      return true
    } catch (err) {
      showError(err.message || ErrorMessages.LOGIN_FAILED)
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await AuthService.logout()
      session.value = null
      user.value = null
      success(SuccessMessages.LOGOUT)
      await navigateTo('/admin/login')
    } catch (err) {
      showError(err.message || ErrorMessages.GENERIC)
    } finally {
      loading.value = false
    }
  }

  return {
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    isAuthenticated,
    initAuth,
    login,
    logout,
  }
}
