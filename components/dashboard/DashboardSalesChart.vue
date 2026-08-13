<template>
  <v-card elevation="0" border rounded="lg" class="ta-sales-chart">
    <div class="ta-sales-chart__header">
      <div>
        <h3 class="ta-sales-chart__title">Sales Overview</h3>
        <p class="ta-sales-chart__subtitle">Revenue, product cost &amp; profit</p>
      </div>
      <v-btn-toggle
        v-model="selectedPeriod"
        mandatory
        density="compact"
        variant="outlined"
        divided
        class="ta-sales-chart__filters"
      >
        <v-btn
          v-for="period in periods"
          :key="period.value"
          :value="period.value"
          size="small"
        >
          {{ period.label }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <v-divider />

    <div v-if="loading" class="ta-sales-chart__loading">
      <v-skeleton-loader type="image" height="220" />
    </div>

    <div v-else class="ta-sales-chart__body">
      <div class="ta-sales-chart__legend">
        <span class="ta-sales-chart__legend-item">
          <i class="ta-sales-chart__dot ta-sales-chart__dot--revenue" />
          Revenue
        </span>
        <span class="ta-sales-chart__legend-item">
          <i class="ta-sales-chart__dot ta-sales-chart__dot--cost" />
          Product Cost
        </span>
        <span class="ta-sales-chart__legend-item">
          <i class="ta-sales-chart__dot ta-sales-chart__dot--profit" />
          Profit
        </span>
      </div>

      <div class="ta-sales-chart__bars">
        <div
          v-for="point in chartPoints"
          :key="point.label"
          class="ta-sales-chart__column"
        >
          <div class="ta-sales-chart__bar-group">
            <div
              class="ta-sales-chart__bar ta-sales-chart__bar--revenue"
              :style="{ height: barHeight(point.revenue) }"
              :title="`Revenue: ${formatCurrency(point.revenue)}`"
            />
            <div
              class="ta-sales-chart__bar ta-sales-chart__bar--cost"
              :style="{ height: barHeight(point.cost) }"
              :title="`Cost: ${formatCurrency(point.cost)}`"
            />
            <div
              class="ta-sales-chart__bar ta-sales-chart__bar--profit"
              :style="{ height: barHeight(point.profit) }"
              :title="`Profit: ${formatCurrency(point.profit)}`"
            />
          </div>
          <span class="ta-sales-chart__label">{{ point.label }}</span>
        </div>
      </div>

      <div class="ta-sales-chart__summary">
        <div class="ta-sales-chart__summary-item">
          <span class="ta-sales-chart__summary-label">Total Revenue</span>
          <strong>{{ formatCurrency(totals.revenue) }}</strong>
        </div>
        <div class="ta-sales-chart__summary-item">
          <span class="ta-sales-chart__summary-label">Total Cost</span>
          <strong>{{ formatCurrency(totals.cost) }}</strong>
        </div>
        <div class="ta-sales-chart__summary-item">
          <span class="ta-sales-chart__summary-label">Gross Profit</span>
          <strong class="ta-sales-chart__summary-profit">{{ formatCurrency(totals.profit) }}</strong>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { formatCurrency } from '~/helpers/currency.js'
import { formatDate } from '~/helpers/date.js'

const props = defineProps({
  chartData: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const selectedPeriod = ref('7d')

const periods = [
  { value: '7d', label: '7 Days', days: 7 },
  { value: '30d', label: '30 Days', days: 30 },
  { value: '3m', label: '3 Months', days: 90 },
  { value: '1y', label: '1 Year', days: 365 },
]

const activePeriod = computed(() =>
  periods.find(p => p.value === selectedPeriod.value) || periods[0],
)

const chartPoints = computed(() => {
  const days = activePeriod.value.days
  const source = props.chartData.length
    ? props.chartData
    : generateFallbackData(days)

  const sliced = source.slice(-Math.min(days, source.length))

  return sliced.map((point) => ({
    label: formatDate(point.date, { day: '2-digit', month: 'short' }),
    revenue: point.revenue || 0,
    cost: point.cost || 0,
    profit: Math.max(0, (point.revenue || 0) - (point.cost || 0)),
  }))
})

const totals = computed(() =>
  chartPoints.value.reduce(
    (acc, point) => ({
      revenue: acc.revenue + point.revenue,
      cost: acc.cost + point.cost,
      profit: acc.profit + point.profit,
    }),
    { revenue: 0, cost: 0, profit: 0 },
  ),
)

const maxValue = computed(() => {
  const values = chartPoints.value.flatMap(p => [p.revenue, p.cost, p.profit])
  return Math.max(...values, 1)
})

const barHeight = (value) => `${Math.max(4, (value / maxValue.value) * 100)}%`

function generateFallbackData(days) {
  const result = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const revenue = Math.round(8000 + Math.random() * 35000)
    const cost = Math.round(revenue * (0.45 + Math.random() * 0.1))
    result.push({
      date: date.toISOString().split('T')[0],
      revenue,
      cost,
    })
  }
  return result
}
</script>

<style scoped lang="scss">
.ta-sales-chart {
  overflow: hidden;

  &__header {
    @include flex-between;
    flex-wrap: wrap;
    gap: var(--spacing-md);
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

  &__filters {
    :deep(.v-btn) {
      font-size: $font-size-xs;
      text-transform: none;
      letter-spacing: 0;
    }
  }

  &__loading {
    padding: var(--spacing-lg);
  }

  &__body {
    padding: var(--spacing-lg);
  }

  &__legend {
    @include flex(row, center, center, var(--spacing-lg));
    flex-wrap: wrap;
    margin-bottom: var(--spacing-lg);
  }

  &__legend-item {
    @include flex(row, flex-start, center, var(--spacing-xs));
    font-size: $font-size-xs;
    color: var(--color-text-secondary);
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: var(--radius-full);
    display: inline-block;

    &--revenue { background: #2d6a4f; }
    &--cost { background: #c0392b; }
    &--profit { background: var(--color-accent); }
  }

  &__bars {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-sm);
    height: 220px;
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    overflow-x: auto;
    @include custom-scrollbar;
  }

  &__column {
    flex: 1;
    min-width: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  &__bar-group {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 3px;
    padding-top: var(--spacing-sm);
  }

  &__bar {
    width: 12px;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    min-height: 4px;
    transition: height var(--transition-base);

    &--revenue { background: #2d6a4f; }
    &--cost { background: rgba(192, 57, 43, 0.75); }
    &--profit { background: var(--color-accent); }
  }

  &__label {
    font-size: 10px;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
    white-space: nowrap;
  }

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }
  }

  &__summary-item {
    text-align: center;
    padding: var(--spacing-md);
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);

    strong {
      display: block;
      font-size: $font-size-lg;
      margin-top: var(--spacing-xs);
    }
  }

  &__summary-label {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wider;
  }

  &__summary-profit {
    color: #2d6a4f;
  }
}
</style>
