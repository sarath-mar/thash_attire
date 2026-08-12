<template>
  <v-card elevation="0" border rounded="lg" class="ta-recent-sales">
    <v-card-title class="ta-recent-sales__header">
      <span>Recent Sales</span>
      <v-btn
        variant="text"
        size="small"
        to="/admin/sales"
        append-icon="mdi-arrow-right"
        class="ta-recent-sales__view-all"
      >
        View All
      </v-btn>
    </v-card-title>

    <v-divider />

    <div v-if="loading" class="ta-recent-sales__loading">
      <v-skeleton-loader
        v-for="n in 5"
        :key="n"
        type="list-item-two-line"
      />
    </div>

    <AppEmptyState
      v-else-if="!sales.length"
      icon="mdi-cart-outline"
      title="No recent sales"
      description="Sales will appear here once recorded."
    />

    <v-list v-else density="compact" class="ta-recent-sales__list">
      <v-list-item
        v-for="sale in sales"
        :key="sale.id"
        class="ta-recent-sales__item"
      >
        <template #prepend>
          <v-avatar size="36" color="accent" class="ta-recent-sales__avatar">
            <span class="ta-recent-sales__avatar-text">
              {{ getInitial(sale.customer?.name) }}
            </span>
          </v-avatar>
        </template>

        <v-list-item-title class="ta-recent-sales__customer">
          {{ sale.customer?.name || 'Unknown Customer' }}
        </v-list-item-title>
        <v-list-item-subtitle class="ta-recent-sales__product">
          {{ sale.product?.name || 'Unknown Product' }}
        </v-list-item-subtitle>

        <template #append>
          <div class="ta-recent-sales__meta">
            <span class="ta-recent-sales__amount">{{ formatCurrency(sale.final_amount) }}</span>
            <AdminStatusChip
              :status="sale.payment_status"
              :color-map="PaymentStatusColors"
              :label-map="PaymentStatusLabels"
            />
          </div>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { PaymentStatusLabels, PaymentStatusColors } from '~/enums/paymentStatus.js'
import { AppConfig } from '~/constants/app.js'

defineProps({
  sales: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?')

const formatCurrency = (amount) =>
  new Intl.NumberFormat(AppConfig.LOCALE, {
    style: 'currency',
    currency: AppConfig.CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount || 0)
</script>

<style scoped lang="scss">
.ta-recent-sales {
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
    padding: var(--spacing-sm);
  }

  &__list {
    padding: var(--spacing-xs) !important;
  }

  &__item {
    border-radius: var(--radius-md);
    margin-bottom: 2px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__avatar {
    &-text {
      font-family: var(--font-body);
      font-size: $font-size-xs;
      font-weight: $font-weight-bold;
      color: var(--color-text-inverse);
    }
  }

  &__customer {
    font-family: var(--font-body) !important;
    font-size: $font-size-sm !important;
    font-weight: $font-weight-medium !important;
    color: var(--color-text-primary) !important;
  }

  &__product {
    font-family: var(--font-body) !important;
    font-size: $font-size-xs !important;
    color: var(--color-text-muted) !important;
    @include text-ellipsis;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  &__amount {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
  }
}
</style>
