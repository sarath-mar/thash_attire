<template>
  <div class="ta-order-timeline">
    <div
      v-for="(step, idx) in steps"
      :key="step"
      class="ta-order-timeline__step"
      :class="stepClass(step, idx)"
    >
      <div class="ta-order-timeline__indicator">
        <div class="ta-order-timeline__dot">
          <v-icon v-if="isCompleted(step)" icon="mdi-check" size="14" color="white" />
          <v-icon v-else-if="isCurrent(step)" :icon="OrderStatusIcons[step]" size="14" />
        </div>
        <div v-if="idx < steps.length - 1" class="ta-order-timeline__line" />
      </div>

      <div class="ta-order-timeline__content">
        <span class="ta-order-timeline__label">{{ OrderStatusLabels[step] }}</span>
        <span v-if="getStepDate(step)" class="ta-order-timeline__date">
          {{ formatDate(getStepDate(step), { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
        </span>
        <span v-else-if="isFuture(step)" class="ta-order-timeline__pending">Pending</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { OrderWorkflowSteps, OrderStatusLabels, OrderStatusIcons } from '~/enums/orderStatus.js'
import { formatDate } from '~/helpers/date.js'

const props = defineProps({
  currentStatus: { type: String, required: true },
  statusHistory: { type: Array, default: () => [] },
})

const steps = OrderWorkflowSteps

const currentIdx = computed(() => steps.indexOf(props.currentStatus))

const historyMap = computed(() => {
  const map = {}
  props.statusHistory.forEach(h => { map[h.status] = h.date })
  return map
})

const isCompleted = (step) => steps.indexOf(step) < currentIdx.value
const isCurrent = (step) => step === props.currentStatus
const isFuture = (step) => steps.indexOf(step) > currentIdx.value

const getStepDate = (step) => historyMap.value[step] || null

const stepClass = (step, idx) => ({
  'ta-order-timeline__step--completed': isCompleted(step),
  'ta-order-timeline__step--current': isCurrent(step),
  'ta-order-timeline__step--future': isFuture(step),
})
</script>

<style scoped lang="scss">
.ta-order-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;

  &__step {
    display: flex;
    gap: var(--spacing-md);
    min-height: 56px;

    &--completed .ta-order-timeline__dot {
      background: var(--color-success);
      border-color: var(--color-success);
    }

    &--current .ta-order-timeline__dot {
      background: var(--color-accent);
      border-color: var(--color-accent);
      box-shadow: 0 0 0 4px rgba(197, 160, 89, 0.25);
    }

    &--future .ta-order-timeline__dot {
      background: var(--color-surface);
      border-color: var(--color-border);
    }

    &--future .ta-order-timeline__label {
      color: var(--color-text-muted);
    }
  }

  &__indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 28px;
    flex-shrink: 0;
  }

  &__dot {
    @include flex-center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    border: 2px solid var(--color-border);
    flex-shrink: 0;
    z-index: 1;
  }

  &__line {
    flex: 1;
    width: 2px;
    background: var(--color-border);
    min-height: 28px;

    .ta-order-timeline__step--completed & {
      background: var(--color-success);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    padding-bottom: var(--spacing-md);
    gap: 2px;
  }

  &__label {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
  }

  &__date {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
  }

  &__pending {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    font-style: italic;
  }
}
</style>
