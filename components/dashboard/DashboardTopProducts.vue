<template>
  <v-card elevation="0" border rounded="lg" class="ta-top-products">
    <v-card-title class="ta-top-products__header">
      <span>Top Selling Products</span>
      <v-btn
        variant="text"
        size="small"
        to="/admin/products"
        append-icon="mdi-arrow-right"
        class="ta-top-products__view-all"
      >
        View All
      </v-btn>
    </v-card-title>

    <v-divider />

    <div v-if="loading" class="ta-top-products__loading">
      <v-skeleton-loader
        v-for="n in 5"
        :key="n"
        type="list-item-two-line"
      />
    </div>

    <AppEmptyState
      v-else-if="!products.length"
      icon="mdi-star-outline"
      title="No sales data yet"
      description="Top products will appear here once sales are recorded."
    />

    <v-list v-else density="compact" class="ta-top-products__list">
      <v-list-item
        v-for="(product, index) in products"
        :key="product.id"
        class="ta-top-products__item"
      >
        <template #prepend>
          <div class="ta-top-products__rank" :class="`ta-top-products__rank--${index + 1}`">
            {{ index + 1 }}
          </div>
        </template>

        <v-list-item-title class="ta-top-products__name">
          {{ product.name }}
        </v-list-item-title>
        <v-list-item-subtitle class="ta-top-products__sku">
          {{ product.total_sold }} sold
        </v-list-item-subtitle>

        <template #append>
          <span class="ta-top-products__revenue">
            {{ formatCurrency(product.revenue) }}
          </span>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { AppConfig } from '~/constants/app.js'

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

const formatCurrency = (amount) =>
  new Intl.NumberFormat(AppConfig.LOCALE, {
    style: 'currency',
    currency: AppConfig.CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount || 0)
</script>

<style scoped lang="scss">
.ta-top-products {
  &__header {
    @include flex-between;
    padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-lg);
    font-family: var(--font-body);
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
  }

  &__view-all {
    font-size: $font-size-xs;
    color: var(--color-secondary);
    text-transform: none;
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

  &__rank {
    @include flex-center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    background: var(--color-bg-alt);
    color: var(--color-text-muted);
    flex-shrink: 0;

    &--1 {
      background: rgba(197, 160, 89, 0.2);
      color: #b8870a;
    }

    &--2 {
      background: rgba(156, 163, 175, 0.2);
      color: #6b7280;
    }

    &--3 {
      background: rgba(180, 120, 60, 0.2);
      color: #b47840;
    }
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

  &__revenue {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: var(--color-success);
  }
}
</style>
