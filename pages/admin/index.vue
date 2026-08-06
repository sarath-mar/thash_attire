<template>
  <div class="ta-admin-dashboard">
    <h1 class="ta-admin-dashboard__title">Dashboard</h1>
    <p class="ta-admin-dashboard__subtitle">Welcome to Thash Attire Admin Panel</p>

    <div class="ta-admin-dashboard__placeholder">
      <v-icon icon="mdi-view-dashboard" size="64" color="grey-lighten-1" />
      <p>Dashboard module will be built in the next phase.</p>
    </div>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'

definePageMeta({
  layout: 'blank',
  middleware: 'admin',
})

useHead({ title: PageTitles.ADMIN_DASHBOARD })
</script>

<style scoped lang="scss">
.ta-admin-dashboard {
  padding: var(--spacing-2xl);

  &__title {
    @include heading($font-size-2xl);
    margin-bottom: var(--spacing-xs);
  }

  &__subtitle {
    @include body-text($font-size-sm, var(--color-text-muted));
    margin-bottom: var(--spacing-2xl);
  }

  &__placeholder {
    @include flex-center;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-4xl);
    background: var(--color-bg-alt);
    border-radius: var(--radius-lg);
    color: var(--color-text-muted);
  }
}
</style>
