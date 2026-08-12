<template>
  <v-card elevation="0" border rounded="lg" class="ta-low-stock">
    <v-card-title class="ta-low-stock__header">
      <span>Low Stock Alert</span>
      <v-chip
        v-if="!loading && products.length"
        color="warning"
        size="small"
        class="ta-low-stock__badge"
      >
        {{ products.length }}
      </v-chip>
    </v-card-title>

    <v-divider />

    <div v-if="loading" class="ta-low-stock__loading">
      <v-skeleton-loader
        v-for="n in 3"
        :key="n"
        type="list-item"
      />
    </div>

    <AppEmptyState
      v-else-if="!products.length"
      icon="mdi-check-circle-outline"
      title="All stock healthy"
      description="No products are running low on stock."
    />

    <v-list v-else density="compact" class="ta-low-stock__list">
      <v-list-item
        v-for="product in products"
        :key="product.id"
        class="ta-low-stock__item"
      >
        <template #prepend>
          <v-icon
            :color="product.stock === 0 ? 'error' : 'warning'"
            :icon="product.stock === 0 ? 'mdi-alert-circle' : 'mdi-alert'"
            size="18"
          />
        </template>

        <v-list-item-title class="ta-low-stock__name">
          {{ product.name }}
        </v-list-item-title>
        <v-list-item-subtitle class="ta-low-stock__sku">
          SKU: {{ product.sku }}
        </v-list-item-subtitle>

        <template #append>
          <v-chip
            :color="product.stock === 0 ? 'error' : 'warning'"
            size="x-small"
            label
          >
            {{ product.stock === 0 ? 'Out of Stock' : `${product.stock} left` }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="!loading && products.length" class="ta-low-stock__footer">
      <v-btn
        variant="text"
        size="small"
        to="/admin/inventory"
        append-icon="mdi-arrow-right"
        class="ta-low-stock__link"
      >
        Manage Inventory
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped lang="scss">
.ta-low-stock {
  &__header {
    @include flex-center;
    justify-content: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    font-family: var(--font-body);
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
  }

  &__badge {
    font-family: var(--font-body);
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
  }

  &__loading {
    padding: var(--spacing-xs);
  }

  &__list {
    padding: var(--spacing-xs) !important;
  }

  &__item {
    border-radius: var(--radius-md);
    margin-bottom: 2px;
  }

  &__name {
    font-family: var(--font-body) !important;
    font-size: $font-size-sm !important;
    font-weight: $font-weight-medium !important;
    color: var(--color-text-primary) !important;
    @include text-ellipsis;
  }

  &__sku {
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
