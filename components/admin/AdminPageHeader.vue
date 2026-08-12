<template>
  <div class="ta-admin-page-header">
    <div class="ta-admin-page-header__text">
      <h1 class="ta-admin-page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="ta-admin-page-header__subtitle">{{ subtitle }}</p>
    </div>

    <div v-if="$slots.actions" class="ta-admin-page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<style scoped lang="scss">
.ta-admin-page-header {
  @include flex-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;

  &__text {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  &__title {
    font-family: var(--font-body);
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
    line-height: $line-height-tight;
  }

  &__subtitle {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    margin: 0;
  }

  &__actions {
    @include flex-center;
    gap: var(--spacing-sm);
    flex-shrink: 0;
  }
}
</style>
