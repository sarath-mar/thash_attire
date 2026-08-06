<template>
  <v-btn
    :class="buttonClasses"
    :color="color"
    :variant="variant"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :icon="iconOnly"
    :to="to"
    :href="href"
    :type="type"
    @click="handleClick"
  >
    <v-icon v-if="prependIcon && !iconOnly" :icon="prependIcon" start />
    <slot />
    <v-icon v-if="appendIcon && !iconOnly" :icon="appendIcon" end />
  </v-btn>
</template>

<script setup>
const props = defineProps({
  variant: { type: String, default: 'flat' },
  color: { type: String, default: 'primary' },
  size: { type: String, default: 'default' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  iconOnly: { type: Boolean, default: false },
  prependIcon: { type: String, default: '' },
  appendIcon: { type: String, default: '' },
  to: { type: [String, Object], default: undefined },
  href: { type: String, default: undefined },
  type: { type: String, default: 'button' },
  premium: { type: Boolean, default: false },
  outline: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => ({
  'ta-btn': true,
  'ta-btn--premium': props.premium,
  'ta-btn--outline': props.outline,
}))

const handleClick = (event) => {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.ta-btn {
  text-transform: none;
  letter-spacing: $letter-spacing-wide;
  font-weight: $font-weight-medium;
  border-radius: var(--radius-sm);

  &--premium {
    background: var(--color-primary) !important;
    color: var(--color-text-inverse) !important;
    padding-inline: var(--spacing-xl);
    height: 48px;

    &:hover {
      background: var(--color-secondary) !important;
    }
  }

  &--outline {
    border: 1px solid var(--color-primary) !important;
    background: transparent !important;
    color: var(--color-primary) !important;

    &:hover {
      background: var(--color-primary) !important;
      color: var(--color-text-inverse) !important;
    }
  }
}
</style>
