<template>
  <v-card elevation="0" border rounded="lg" class="ta-form-section">
    <div class="ta-form-section__header">
      <div>
        <h3 class="ta-form-section__title">{{ title }}</h3>
        <p v-if="subtitle" class="ta-form-section__subtitle">{{ subtitle }}</p>
      </div>
      <slot name="header-actions" />
    </div>
    <v-divider />
    <v-card-text class="ta-form-section__body">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<style scoped lang="scss">
.ta-form-section {
  margin-bottom: var(--spacing-md);

  &__header {
    @include flex-between;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    flex-wrap: wrap;
  }

  &__title {
    font-family: var(--font-body);
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__subtitle {
    font-family: var(--font-body);
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    margin: 2px 0 0;
  }

  &__body {
    padding: var(--spacing-lg) !important;
  }
}
</style>
