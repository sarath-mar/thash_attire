<template>
  <v-dialog
    v-model="dialogOpen"
    :max-width="maxWidth"
    :persistent="persistent"
    scrollable
  >
    <v-card class="ta-form-dialog" rounded="lg">
      <!-- Title -->
      <v-card-title class="ta-form-dialog__title">
        <v-icon v-if="icon" :icon="icon" :color="iconColor" size="20" class="ta-form-dialog__icon" />
        {{ title }}
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" :disabled="loading" @click="handleClose" />
      </v-card-title>

      <v-divider />

      <!-- Content -->
      <v-card-text class="ta-form-dialog__body">
        <slot />
      </v-card-text>

      <v-divider />

      <!-- Actions -->
      <v-card-actions class="ta-form-dialog__actions">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="loading"
          class="ta-form-dialog__cancel"
          @click="handleClose"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          :disabled="disabled"
          class="ta-form-dialog__save"
          @click="$emit('save')"
        >
          {{ saveText }}
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
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  iconColor: {
    type: String,
    default: 'primary',
  },
  saveText: {
    type: String,
    default: 'Save',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  persistent: {
    type: Boolean,
    default: true,
  },
  maxWidth: {
    type: [String, Number],
    default: '560',
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const handleClose = () => {
  if (!props.loading) {
    emit('close')
    dialogOpen.value = false
  }
}
</script>

<style scoped lang="scss">
.ta-form-dialog {
  &__title {
    @include flex-center;
    justify-content: flex-start;
    gap: var(--spacing-sm);
    font-family: var(--font-body) !important;
    font-size: $font-size-md !important;
    font-weight: $font-weight-semibold !important;
    color: var(--color-text-primary) !important;
    padding: var(--spacing-md) var(--spacing-lg) !important;
    min-height: 64px;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__body {
    padding: var(--spacing-lg) !important;
    max-height: 70vh;
  }

  &__actions {
    padding: var(--spacing-md) var(--spacing-lg) !important;
    gap: var(--spacing-xs);
  }

  &__save {
    font-family: var(--font-body);
    font-weight: $font-weight-medium;
    letter-spacing: $letter-spacing-wide;
    text-transform: none;
  }

  &__cancel {
    font-family: var(--font-body);
    font-weight: $font-weight-medium;
    text-transform: none;
  }
}
</style>
