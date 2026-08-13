<template>
  <v-card elevation="0" border rounded="lg" class="ta-recent-orders">
    <div class="ta-recent-orders__header">
      <span class="ta-recent-orders__title">Recent Orders</span>
      <v-btn
        variant="text"
        size="small"
        to="/admin/orders"
        append-icon="mdi-arrow-right"
        class="ta-recent-orders__view-all"
      >
        View All
      </v-btn>
    </div>

    <v-divider />

    <div v-if="loading" class="ta-recent-orders__loading">
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item-two-line" />
    </div>

    <AppEmptyState
      v-else-if="!orders.length"
      icon="mdi-clipboard-list-outline"
      title="No recent orders"
      description="Orders will appear here once recorded."
    />

    <v-table v-else density="compact" class="ta-recent-orders__table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Product</th>
          <th>Amount</th>
          <th>Payment</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id" class="ta-recent-orders__row">
          <td class="ta-recent-orders__order-num">{{ order.order_number }}</td>
          <td>{{ order.customer_name }}</td>
          <td class="ta-recent-orders__product">{{ order.product_name }}</td>
          <td class="ta-recent-orders__amount">{{ formatCurrency(order.total_amount) }}</td>
          <td>
            <v-chip
              :color="PaymentStatusColors[order.payment_status]"
              size="x-small"
              label
            >
              {{ PaymentStatusLabels[order.payment_status] || order.payment_status }}
            </v-chip>
          </td>
          <td>
            <v-chip
              :color="OrderStatusColors[order.order_status]"
              size="x-small"
              label
            >
              {{ OrderStatusLabels[order.order_status] || order.order_status }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup>
import { PaymentStatusLabels, PaymentStatusColors } from '~/enums/paymentStatus.js'
import { OrderStatusLabels, OrderStatusColors } from '~/enums/orderStatus.js'
import { AppConfig } from '~/constants/app.js'

defineProps({
  orders: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const formatCurrency = (amount) =>
  new Intl.NumberFormat(AppConfig.LOCALE, { style: 'currency', currency: AppConfig.CURRENCY, maximumFractionDigits: 0 }).format(amount || 0)
</script>

<style scoped lang="scss">
.ta-recent-orders {
  overflow: hidden;

  &__header {
    @include flex-between;
    padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-lg);
  }

  &__title {
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

  &__table {
    font-family: var(--font-body) !important;

    :deep(th) {
      font-size: $font-size-xs !important;
      font-weight: $font-weight-semibold !important;
      text-transform: uppercase;
      letter-spacing: $letter-spacing-wider;
      color: var(--color-text-muted) !important;
    }

    :deep(td) {
      font-size: $font-size-sm !important;
      color: var(--color-text-primary);
    }
  }

  &__order-num {
    font-weight: $font-weight-semibold !important;
    color: var(--color-secondary) !important;
    font-size: $font-size-xs !important;
  }

  &__product {
    max-width: 200px;
    @include text-ellipsis;
  }

  &__amount {
    font-weight: $font-weight-semibold !important;
    white-space: nowrap;
  }

  &__row:hover {
    background: var(--color-bg-alt);
  }
}
</style>
