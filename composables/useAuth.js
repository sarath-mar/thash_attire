import { AuthService } from '~/services/AuthService.js'
import { ErrorMessages, SuccessMessages } from '~/constants/index.js'

const user = ref(null)
const session = ref(null)
const loading = ref(false)
const isAdmin = ref(false)

let initPromise = null

function clearAuth() {
  session.value = null
  user.value = null
  isAdmin.value = false
}

async function refreshAuth() {
  loading.value = true
  try {
    const nextSession = await AuthService.getSession()
    const nextUser = nextSession?.user || null
    if (!nextUser) {
      clearAuth()
      return
    }

    const allowed = await AuthService.verifyAdmin(nextUser.id)
    if (!allowed) {
      await AuthService.logout()
      clearAuth()
      return
    }

    session.value = nextSession
    user.value = nextUser
    isAdmin.value = true
  } catch {
    clearAuth()
  } finally {
    loading.value = false
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => !!session.value && isAdmin.value)
  const { success, error: showError } = useSnackbar()

  const initAuth = () => {
    if (initPromise) return initPromise
    initPromise = refreshAuth().finally(() => {
      initPromise = null
    })
    return initPromise
  }

  const login = async (email, password) => {
    loading.value = true
    try {
      const data = await AuthService.login(email, password)
      session.value = data.session
      user.value = data.user
      isAdmin.value = true
      success(SuccessMessages.LOGIN)
      return true
    } catch (err) {
      clearAuth()
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
      clearAuth()
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
