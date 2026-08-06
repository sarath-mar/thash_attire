<template>
  <v-snackbar
    v-model="isVisible"
    :color="snackbarColor"
    :timeout="timeoutValue"
    location="bottom right"
    class="ta-snackbar"
  >
    <div class="ta-snackbar__content">
      <v-icon :icon="snackbarIcon" size="20" class="ta-snackbar__icon" />
      <span>{{ messageValue }}</span>
    </div>

    <template #actions>
      <v-btn variant="text" icon="mdi-close" size="small" @click="hide" />
    </template>
  </v-snackbar>
</template>

<script setup>
import { SnackbarColors, SnackbarIcons } from '~/enums/snackbarType.js'

const { show, message, type, timeout, hide } = useSnackbar()

const isVisible = computed({
  get: () => show.value,
  set: (val) => { if (!val) hide() },
})

const messageValue = computed(() => message.value)
const timeoutValue = computed(() => timeout.value)
const snackbarColor = computed(() => SnackbarColors[type.value] || 'info')
const snackbarIcon = computed(() => SnackbarIcons[type.value] || 'mdi-information')
</script>

<style scoped lang="scss">
.ta-snackbar {
  &__content {
    @include flex(row, flex-start, center, var(--spacing-sm));
  }

  &__icon {
    flex-shrink: 0;
  }
}
</style>
