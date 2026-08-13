<template>
  <v-card elevation="0" border rounded="lg" class="ta-low-mat">
    <div class="ta-low-mat__header">
      <span class="ta-low-mat__title">Low Stock Materials</span>
      <v-chip v-if="!loading && materials.length" color="warning" size="small">
        {{ materials.length }}
      </v-chip>
    </div>

    <v-divider />

    <div v-if="loading" class="ta-low-mat__loading">
      <v-skeleton-loader v-for="n in 3" :key="n" type="list-item" />
    </div>

    <AppEmptyState
      v-else-if="!materials.length"
      icon="mdi-check-circle-outline"
      title="All materials healthy"
      description="No materials are running low."
    />

    <v-list v-else density="compact" class="ta-low-mat__list">
      <v-list-item
        v-for="mat in materials"
        :key="mat.id"
        class="ta-low-mat__item"
      >
        <template #prepend>
          <v-icon
            :color="mat.current_stock === 0 ? 'error' : 'warning'"
            :icon="mat.current_stock === 0 ? 'mdi-alert-circle' : 'mdi-alert'"
            size="18"
          />
        </template>

        <v-list-item-title class="ta-low-mat__name">{{ mat.name }}</v-list-item-title>
        <v-list-item-subtitle class="ta-low-mat__stock">
          Stock: {{ mat.current_stock }} {{ mat.unit }}
        </v-list-item-subtitle>

        <template #append>
          <v-chip
            :color="mat.current_stock === 0 ? 'error' : 'warning'"
            size="x-small"
            label
          >
            {{ mat.current_stock === 0 ? 'Out of Stock' : 'Low' }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="!loading && materials.length" class="ta-low-mat__footer">
      <v-btn variant="text" size="small" to="/admin/materials" append-icon="mdi-arrow-right" class="ta-low-mat__link">
        Manage Materials
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  materials: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>

<style scoped lang="scss">
.ta-low-mat {
  &__header {
    @include flex-center;
    justify-content: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
  }

  &__title {
    font-family: var(--font-body);
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
  }

  &__loading { padding: var(--spacing-xs); }

  &__list { padding: var(--spacing-xs) !important; }

  &__item {
    border-radius: var(--radius-md);
    margin-bottom: 2px;
  }

  &__name {
    font-family: var(--font-body) !important;
    font-size: $font-size-sm !important;
    font-weight: $font-weight-medium !important;
    @include text-ellipsis;
  }

  &__stock {
    font-family: var(--font-body) !important;
    font-size: $font-size-xs !important;
    color: var(--color-text-muted) !important;
  }

  &__footer {
    padding: var(--spacing-xs) var(--spacing-md);
    border-top: 1px solid var(--color-border-light);
  }

  &__link {
    font-size: $font-size-xs;
    color: var(--color-secondary);
    text-transform: none;
  }
}
</style>
