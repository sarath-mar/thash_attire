import { CustomerAuthService, consumeCustomerRedirect, stashPendingProfile } from '~/services/CustomerAuthService.js'
import { safeInternalPath } from '~/helpers/redirect.js'

const user = ref(null)
const session = ref(null)
const profile = ref(null)
const loading = ref(false)
const initialized = ref(false)
const authError = ref('')

let initPromise = null

export function useCustomerAuth() {
  const isAuthenticated = computed(() => !!session.value?.user)
  const { success, error: showError } = useSnackbar()

  async function refreshProfile(extra = {}) {
    if (!user.value) {
      profile.value = null
      return null
    }

    profile.value = await CustomerAuthService.syncProfile(user.value, extra)
    authError.value = ''
    return profile.value
  }

  async function initCustomerAuth() {
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        const nextSession = await CustomerAuthService.getSession()
        if (nextSession) {
          session.value = nextSession
          user.value = nextSession.user || null
        }
        if (user.value && !profile.value) await refreshProfile()
      } catch (err) {
        authError.value = err.message || 'We could not restore your session'
      } finally {
        initialized.value = true
      }
    })()

    return initPromise
  }

  function adoptSession(nextSession) {
    session.value = nextSession
    user.value = nextSession?.user || null
    initialized.value = true
    initPromise = Promise.resolve()
  }

  async function sendEmailCode(email, profileDetails = {}) {
    loading.value = true
    try {
      await CustomerAuthService.sendEmailCode(email, profileDetails)
      success('We sent a sign-in code to your email')
      return true
    } catch (err) {
      showError(err.message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function verifyEmailCode(email, token) {
    loading.value = true
    try {
      const data = await CustomerAuthService.verifyEmailCode(email, token)
      adoptSession(data.session)
      await refreshProfile()
      success('Welcome to Thash Attire')
      return true
    } catch (err) {
      showError(err.message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function signInWithGoogle(profileDetails = {}) {
    loading.value = true
    try {
      if (profileDetails.name || profileDetails.phone) stashPendingProfile(profileDetails)
      await CustomerAuthService.signInWithGoogle()
      return true
    } catch (err) {
      showError(err.message)
      loading.value = false
      return false
    }
  }

  async function finishRedirectLogin() {
    loading.value = true
    try {
      const nextSession = await CustomerAuthService.completeRedirectLogin()
      adoptSession(nextSession)
      await refreshProfile()
      authError.value = ''
      return true
    } catch (err) {
      authError.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function saveProfile(details) {
    loading.value = true
    try {
      await refreshProfile(details)
      success('Profile saved')
      return true
    } catch (err) {
      showError(err.message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await CustomerAuthService.logout()
      session.value = null
      user.value = null
      profile.value = null
      success('Logged out successfully')
      await navigateTo('/')
    } catch (err) {
      showError(err.message)
    } finally {
      loading.value = false
    }
  }

  function nextPath(fallback = '/') {
    return safeInternalPath(consumeCustomerRedirect(fallback), fallback)
  }

  return {
    user: readonly(user),
    session: readonly(session),
    profile: readonly(profile),
    loading: readonly(loading),
    initialized: readonly(initialized),
    authError: readonly(authError),
    isAuthenticated,
    initCustomerAuth,
    refreshProfile,
    sendEmailCode,
    verifyEmailCode,
    signInWithGoogle,
    finishRedirectLogin,
    saveProfile,
    logout,
    nextPath,
  }
}
