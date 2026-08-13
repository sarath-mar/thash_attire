<template>
  <div class="ta-profit-summary" :class="{ 'ta-profit-summary--compact': compact }">
    <div class="ta-profit-summary__grid">
      <div class="ta-profit-summary__item">
        <span class="ta-profit-summary__label">Cost</span>
        <strong>{{ formatCurrency(totalCost) }}</strong>
      </div>
      <div class="ta-profit-summary__item">
        <span class="ta-profit-summary__label">Selling Price</span>
        <strong>{{ formatCurrency(sellingPrice) }}</strong>
      </div>
      <div class="ta-profit-summary__item ta-profit-summary__item--highlight">
        <span class="ta-profit-summary__label">Profit</span>
        <strong class="ta-profit-summary__profit">{{ formatCurrency(profit) }}</strong>
      </div>
      <div class="ta-profit-summary__item">
        <span class="ta-profit-summary__label">Margin</span>
        <strong :class="marginClass">{{ profitMargin }}%</strong>
      </div>
    </div>

    <template v-if="showTarget">
      <v-divider class="my-3" />
      <div class="ta-profit-summary__target">
        <div class="ta-profit-summary__target-row">
          <span>Target Margin</span>
          <strong>{{ targetMargin }}%</strong>
        </div>
        <div class="ta-profit-summary__target-row">
          <span>Recommended Price</span>
          <strong>{{ formatCurrency(recommendedPrice) }}</strong>
        </div>
        <v-chip
          :color="meetsTarget ? 'success' : 'warning'"
          size="small"
          label
          class="mt-2"
        >
          <v-icon :icon="meetsTarget ? 'mdi-check-circle' : 'mdi-alert-circle-outline'" start size="14" />
          {{ meetsTarget ? 'Meets target margin' : 'Below target margin' }}
        </v-chip>
      </div>
    </template>
  </div>
</template>

<script setup>
import { formatCurrency } from '~/helpers/currency.js'
import { calcProfit, calcProfitMargin, calcRecommendedPrice, meetsTargetMargin } from '~/helpers/profit.js'

const props = defineProps({
  sellingPrice: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  targetMargin: { type: Number, default: 40 },
  showTarget: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
})

const profit = computed(() => calcProfit(props.sellingPrice, props.totalCost))
const profitMargin = computed(() => calcProfitMargin(props.sellingPrice, props.totalCost))
const recommendedPrice = computed(() => calcRecommendedPrice(props.totalCost, props.targetMargin))
const meetsTarget = computed(() => meetsTargetMargin(props.sellingPrice, props.totalCost, props.targetMargin))

const marginClass = computed(() => ({
  'ta-profit-summary__margin--good': profitMargin.value >= props.targetMargin,
  'ta-profit-summary__margin--low': profitMargin.value < props.targetMargin,
}))
</script>

<style scoped lang="scss">
.ta-profit-summary {
  background: var(--color-bg-alt);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);

  &--compact {
    padding: var(--spacing-md);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-md);

    @include respond-below(md) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);

    strong {
      font-size: $font-size-lg;
      color: var(--color-text-primary);
    }

    &--highlight strong {
      color: var(--color-success);
    }
  }

  &__label {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wider;
  }

  &__profit {
    color: var(--color-success) !important;
  }

  &__margin--good {
    color: var(--color-success);
  }

  &__margin--low {
    color: var(--color-warning);
  }

  &__target-row {
    @include flex-between;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xs);
  }
}
</style>
