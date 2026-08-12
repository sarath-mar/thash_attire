<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="440"
    persistent
  >
    <v-card class="ta-confirm-dialog" rounded="lg">
      <v-card-title class="ta-confirm-dialog__title">
        <v-icon
          :icon="icon"
          :color="iconColor"
          size="22"
          class="ta-confirm-dialog__icon"
        />
        {{ title }}
      </v-card-title>

      <v-card-text class="ta-confirm-dialog__body">
        {{ message }}
      </v-card-text>

      <v-card-actions class="ta-confirm-dialog__actions">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          variant="flat"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  confirmColor: {
    type: String,
    default: 'error',
  },
  icon: {
    type: String,
    default: 'mdi-alert-circle-outline',
  },
  iconColor: {
    type: String,
    default: 'error',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  dialogOpen.value = false
}
</script>

<style scoped lang="scss">
.ta-confirm-dialog {
  &__title {
    @include flex-center;
    justify-content: flex-start;
    gap: var(--spacing-sm);
    font-family: var(--font-body);
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-sm);
  }

  &__icon {
    flex-shrink: 0;
  }

  &__body {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-md);
  }

  &__actions {
    padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
    gap: var(--spacing-xs);
  }
}
</style>
