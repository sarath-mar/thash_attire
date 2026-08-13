<template>
  <div class="ta-weighted-avg">
    <div class="ta-weighted-avg__row">
      <div class="ta-weighted-avg__col">
        <span class="ta-weighted-avg__label">Previous Stock</span>
        <strong>{{ existingStock }}{{ unitLabel }}</strong>
      </div>
      <div class="ta-weighted-avg__col">
        <span class="ta-weighted-avg__label">Previous Value</span>
        <strong>{{ formatCurrency(existingValue) }}</strong>
      </div>
    </div>
    <div class="ta-weighted-avg__row">
      <div class="ta-weighted-avg__col">
        <span class="ta-weighted-avg__label">New Purchase</span>
        <strong>{{ newQty }}{{ unitLabel }}</strong>
      </div>
      <div class="ta-weighted-avg__col">
        <span class="ta-weighted-avg__label">New Purchase Value</span>
        <strong>{{ formatCurrency(newTotalCost) }}</strong>
      </div>
    </div>

    <v-divider class="my-3" />

    <div class="ta-weighted-avg__result">
      <div class="ta-weighted-avg__result-item">
        <span>New Total Stock</span>
        <strong>{{ result.newStock }}{{ unitLabel }}</strong>
      </div>
      <div class="ta-weighted-avg__result-item">
        <span>New Total Value</span>
        <strong>{{ formatCurrency(result.totalValue) }}</strong>
      </div>
      <div class="ta-weighted-avg__result-item ta-weighted-avg__result-item--highlight">
        <span>Weighted Average Cost</span>
        <strong>{{ formatCurrency(result.newAvgCost) }}/{{ unitShort }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '~/helpers/currency.js'
const calcWeightedAvg = (purchases) => {
  if (!purchases || purchases.length === 0) return 0
  const totalCost = purchases.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0)
  const totalQty = purchases.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)
  return totalQty > 0 ? totalCost / totalQty : 0
}
import { MaterialUnitShort } from '~/enums/materialUnit.js'

const props = defineProps({
  existingStock: { type: Number, default: 0 },
  existingAvg: { type: Number, default: 0 },
  newQty: { type: Number, default: 0 },
  newTotalCost: { type: Number, default: 0 },
  unit: { type: String, default: 'meter' },
})

const result = computed(() =>
  calcWeightedAvg(props.existingStock, props.existingAvg, props.newQty, props.newTotalCost),
)

const unitShort = computed(() => MaterialUnitShort[props.unit] || props.unit)
const unitLabel = computed(() => props.unit ? ` ${unitShort.value}` : '')
</script>

<style scoped lang="scss">
.ta-weighted-avg {
  background: var(--color-bg-alt);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wider;
  }

  &__result {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }
  }

  &__result-item {
    text-align: center;
    padding: var(--spacing-md);
    background: var(--color-surface);
    border-radius: var(--radius-md);

    span {
      display: block;
      font-size: $font-size-xs;
      color: var(--color-text-muted);
      margin-bottom: var(--spacing-xs);
    }

    strong {
      font-size: $font-size-md;
      color: var(--color-text-primary);
    }

    &--highlight {
      background: var(--color-accent-light);
      border: 1px solid var(--color-border-gold);

      strong {
        color: var(--color-secondary);
      }
    }
  }
}
</style>
