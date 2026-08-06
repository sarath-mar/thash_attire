export const SnackbarType = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
})

export const SnackbarColors = Object.freeze({
  [SnackbarType.SUCCESS]: 'success',
  [SnackbarType.ERROR]: 'error',
  [SnackbarType.WARNING]: 'warning',
  [SnackbarType.INFO]: 'info',
})

export const SnackbarIcons = Object.freeze({
  [SnackbarType.SUCCESS]: 'mdi-check-circle',
  [SnackbarType.ERROR]: 'mdi-alert-circle',
  [SnackbarType.WARNING]: 'mdi-alert',
  [SnackbarType.INFO]: 'mdi-information',
})
