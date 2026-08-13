<template>
  <v-card elevation="0" border rounded="lg" class="ta-order-status-chart">
    <div class="ta-order-status-chart__header">
      <h3 class="ta-order-status-chart__title">Order Status Distribution</h3>
      <p class="ta-order-status-chart__subtitle">Current orders by workflow stage</p>
    </div>

    <v-divider />

    <div v-if="loading" class="ta-order-status-chart__loading">
      <v-skeleton-loader type="list-item-two-line" :count="6" />
    </div>

    <div v-else class="ta-order-status-chart__body">
      <div
        v-for="item in statusItems"
        :key="item.status"
        class="ta-order-status-chart__row"
      >
        <div class="ta-order-status-chart__info">
          <v-icon :icon="item.icon" size="18" :color="item.color" />
          <span class="ta-order-status-chart__label">{{ item.label }}</span>
          <span class="ta-order-status-chart__count">{{ item.count }}</span>
        </div>
        <div class="ta-order-status-chart__track">
          <div
            class="ta-order-status-chart__fill"
            :style="{ width: `${item.percentage}%`, background: item.barColor }"
          />
        </div>
        <span class="ta-order-status-chart__pct">{{ item.percentage }}%</span>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { OrderStatus, OrderStatusLabels, OrderStatusIcons } from '~/enums/orderStatus.js'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const STATUS_CONFIG = [
  { key: 'orders_new', status: OrderStatus.ORDER_RECEIVED, color: '#3b82f6', barColor: '#3b82f6' },
  { key: 'orders_payment_pending', status: OrderStatus.PAYMENT_PENDING, color: '#f59e0b', barColor: '#f59e0b' },
  { key: 'orders_in_stitching', status: OrderStatus.SENT_TO_STITCHING, color: '#8b5cf6', barColor: '#8b5cf6' },
  { key: 'orders_ready_to_ship', status: OrderStatus.PACKED, color: '#0ea5e9', barColor: '#0ea5e9' },
  { key: 'orders_shipped', status: OrderStatus.HANDED_TO_COURIER, color: '#7e674b', barColor: '#7e674b' },
  { key: 'orders_delivered', status: OrderStatus.DELIVERED, color: '#2d6a4f', barColor: '#2d6a4f' },
]

const statusItems = computed(() => {
  const total = STATUS_CONFIG.reduce((sum, cfg) => sum + (props.stats[cfg.key] || 0), 0) || 1

  return STATUS_CONFIG.map((cfg) => {
    const count = props.stats[cfg.key] || 0
    return {
      status: cfg.status,
      label: OrderStatusLabels[cfg.status],
      icon: OrderStatusIcons[cfg.status],
      color: cfg.color,
      barColor: cfg.barColor,
      count,
      percentage: Math.round((count / total) * 100),
    }
  })
})
</script>

<style scoped lang="scss">
.ta-order-status-chart {
  overflow: hidden;

  &__header {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  &__title {
    font-family: var(--font-body);
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    margin: 0;
  }

  &__subtitle {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    margin: 2px 0 0;
  }

  &__loading {
    padding: var(--spacing-md);
  }

  &__body {
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr minmax(80px, 140px) 36px;
    align-items: center;
    gap: var(--spacing-sm);
  }

  &__info {
    @include flex(row, flex-start, center, var(--spacing-sm));
    min-width: 0;
  }

  &__label {
    font-size: $font-size-sm;
    @include text-ellipsis;
  }

  &__count {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: var(--color-text-muted);
    margin-left: auto;
    padding-right: var(--spacing-sm);
  }

  &__track {
    height: 8px;
    background: var(--color-border-light);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width var(--transition-base);
    min-width: 4px;
  }

  &__pct {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    text-align: right;
  }
}
</style>
