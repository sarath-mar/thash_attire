import { SnackbarType } from '~/enums/snackbarType.js'

const snackbarState = {
  show: ref(false),
  message: ref(''),
  type: ref(SnackbarType.INFO),
  timeout: ref(4000),
}

export function useSnackbar() {
  const show = (message, type = SnackbarType.INFO, timeout = 4000) => {
    snackbarState.message.value = message
    snackbarState.type.value = type
    snackbarState.timeout.value = timeout
    snackbarState.show.value = true
  }

  const success = (message) => show(message, SnackbarType.SUCCESS)
  const error = (message) => show(message, SnackbarType.ERROR, 6000)
  const warning = (message) => show(message, SnackbarType.WARNING)
  const info = (message) => show(message, SnackbarType.INFO)
  const hide = () => { snackbarState.show.value = false }

  return {
    show: readonly(snackbarState.show),
    message: readonly(snackbarState.message),
    type: readonly(snackbarState.type),
    timeout: readonly(snackbarState.timeout),
    notify: show,
    success,
    error,
    warning,
    info,
    hide,
  }
}
