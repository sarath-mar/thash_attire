<template>
  <v-dialog v-model="open" max-width="460">
    <v-card rounded="lg">
      <v-card-title class="pa-4 text-subtitle-1 font-weight-semibold">Update order status</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <p class="text-body-2 text-medium-emphasis mb-4">
          The highlighted step is where this order has reached.
        </p>
        <div class="ta-status-picker">
          <button
            v-for="step in steps"
            :key="step"
            type="button"
            class="ta-status-picker__step"
            :class="stepClass(step)"
            @click="pickStep(step)"
          >
            <span class="ta-status-picker__icon">
              <v-icon :icon="iconFor(step)" size="16" />
            </span>
            <span class="ta-status-picker__label">{{ OrderStatusLabels[step] }}</span>
            <span v-if="step === current" class="ta-status-picker__tag">Reached</span>
          </button>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="open = false">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="saving" :disabled="!picked || picked === current" @click="save">
          Save status
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { OrderStatus, OrderStatusIcons, OrderStatusLabels, OrderWorkflowSteps } from '~/enums/orderStatus.js'
import { historyWithStatus, orderStatusOf, progressStep, statusMoveBlockMessage } from '~/helpers/orderWorkflow.js'
import { PaymentStatus } from '~/enums/paymentStatus.js'
import { SalesService } from '~/services/SalesService.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  order: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved', 'needs-payment'])
const { success, error: showError } = useSnackbar()

const saving = ref(false)
const picked = ref('')
const steps = [...OrderWorkflowSteps, OrderStatus.CANCELLED]

const open = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const current = computed(() => progressStep(orderStatusOf(props.order)))

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) picked.value = current.value
})

function isLocked(step) {
  return Boolean(statusMoveBlockMessage(current.value, step))
}

function pickStep(step) {
  const message = statusMoveBlockMessage(current.value, step)
  if (message) {
    showError(message)
    return
  }
  picked.value = step
}

function stepClass(step) {
  const index = OrderWorkflowSteps.indexOf(step)
  const currentIndex = OrderWorkflowSteps.indexOf(current.value)
  return {
    'ta-status-picker__step--current': step === current.value,
    'ta-status-picker__step--done': index > -1 && currentIndex > index,
    'ta-status-picker__step--selected': step === picked.value,
    'ta-status-picker__step--locked': isLocked(step),
  }
}

function iconFor(step) {
  const index = OrderWorkflowSteps.indexOf(step)
  const currentIndex = OrderWorkflowSteps.indexOf(current.value)
  if (index > -1 && currentIndex > index) return 'mdi-check'
  return OrderStatusIcons[step]
}

async function save() {
  if (!props.order || !picked.value || picked.value === current.value || isLocked(picked.value)) return
  if (picked.value === OrderStatus.PAYMENT_RECEIVED && props.order.payment_status !== PaymentStatus.PAID) {
    open.value = false
    emit('needs-payment')
    return
  }

  saving.value = true
  try {
    const updated = await SalesService.updateOrderStatus(
      props.order.id,
      picked.value,
      historyWithStatus(props.order.status_history, picked.value),
    )
    success('Order status updated')
    emit('saved', updated)
    open.value = false
  } catch (err) {
    showError(err.message || 'Could not update this order')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.ta-status-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__step {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-primary);
    cursor: pointer;

    &--done {
      .ta-status-picker__icon {
        background: var(--color-success);
        border-color: var(--color-success);
        color: white;
      }
    }

    &--current {
      border-color: var(--color-accent);
      .ta-status-picker__icon {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: white;
      }
      .ta-status-picker__label { font-weight: $font-weight-semibold; }
    }

    &--selected {
      box-shadow: inset 0 0 0 1px var(--color-accent);
    }

    &--locked {
      cursor: not-allowed;
      opacity: 0.55;
    }
  }

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
    font-size: $font-size-sm;
  }

  &__tag {
    font-size: $font-size-xs;
    letter-spacing: $letter-spacing-wide;
    text-transform: uppercase;
    color: var(--color-accent);
    font-weight: $font-weight-semibold;
  }
}
</style>
