<template>
  <div class="ta-empty">
    <v-icon :icon="icon" size="64" class="ta-empty__icon" />
    <h3 class="ta-empty__title">{{ title }}</h3>
    <p v-if="description" class="ta-empty__description">{{ description }}</p>
    <div v-if="$slots.action" class="ta-empty__action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'mdi-package-variant' },
  title: { type: String, default: 'No items found' },
  description: { type: String, default: '' },
})
</script>

<style scoped lang="scss">
.ta-empty {
  @include flex-center;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;

  &__icon {
    color: var(--color-text-muted);
    opacity: $opacity-subtle;
  }

  &__title {
    @include heading($font-size-lg);
  }

  &__description {
    @include body-text($font-size-sm, var(--color-text-muted));
    max-width: 360px;
  }

  &__action {
    margin-top: var(--spacing-md);
  }
}
</style>
