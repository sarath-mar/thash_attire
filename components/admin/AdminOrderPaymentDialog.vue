<template>
  <v-dialog v-model="open" max-width="460" persistent>
    <v-card rounded="lg">
      <v-card-title class="pa-4 text-subtitle-1 font-weight-semibold">Record payment</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <p class="text-body-2 text-medium-emphasis mb-4">
          The order stays unpaid until you record the money received.
        </p>
        <v-form ref="formRef" @submit.prevent="save">
          <v-select
            v-model="form.method"
            label="Paid via"
            :items="methodOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            :rules="[value => !!value || 'Choose how the customer paid']"
          />
          <v-select
            v-if="form.method === PaymentMethod.UPI"
            v-model="form.app"
            label="UPI app"
            :items="appOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hint="Where the payment showed up"
            persistent-hint
            class="mb-2"
            :rules="[value => !!value || 'Choose the UPI app']"
          />
          <v-text-field
            v-if="form.method === PaymentMethod.UPI"
            v-model="form.transactionId"
            label="Transaction ID"
            variant="outlined"
            density="comfortable"
            hint="UPI reference from Google Pay, PhonePe, or the bank SMS"
            persistent-hint
            class="mb-2"
            :rules="[value => !!String(value || '').trim() || 'Enter the transaction ID']"
          />
          <CommonAppDatePicker
            v-model="form.date"
            label="Payment date"
            variant="outlined"
            density="comfortable"
            :rules="[value => !!value || 'Choose the payment date']"
          />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="open = false">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="saving" @click="save">Mark as paid</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { PaymentMethod, PaymentMethodLabels, PaymentApp, PaymentAppLabels } from '~/enums/paymentStatus.js'
import { OrderStatus } from '~/enums/orderStatus.js'
import { historyWithStatus, orderStatusOf, statusAfterPayment } from '~/helpers/orderWorkflow.js'
import { SalesService } from '~/services/SalesService.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  order: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const { success, error: showError } = useSnackbar()

const formRef = ref(null)
const saving = ref(false)
const form = reactive({
  method: PaymentMethod.UPI,
  app: PaymentApp.GOOGLE_PAY,
  transactionId: '',
  date: '',
})

const methodOptions = [PaymentMethod.UPI, PaymentMethod.CASH].map(value => ({
  value,
  label: PaymentMethodLabels[value],
}))

const appOptions = Object.entries(PaymentAppLabels).map(([value, label]) => ({ value, label }))

const open = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

function todayInput() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

watch(() => props.modelValue, (isOpen) => {
  if (!isOpen || !props.order) return
  form.method = props.order.payment_method === PaymentMethod.CASH ? PaymentMethod.CASH : PaymentMethod.UPI
  form.app = props.order.payment_app || PaymentApp.GOOGLE_PAY
  form.transactionId = props.order.transaction_id || ''
  form.date = props.order.payment_date
    ? new Date(props.order.payment_date).toISOString().slice(0, 10)
    : todayInput()
})

async function save() {
  const result = await formRef.value?.validate()
  if (!result?.valid || !props.order) return

  const paidAt = new Date(`${form.date}T12:00:00`).toISOString()
  const nextStatus = statusAfterPayment(orderStatusOf(props.order))
  const payment = {
    method: form.method,
    app: form.method === PaymentMethod.UPI ? form.app : null,
    transactionId: form.method === PaymentMethod.UPI ? form.transactionId.trim() : null,
    date: paidAt,
  }
  const statusHistory = historyWithStatus(props.order.status_history, OrderStatus.PAYMENT_RECEIVED, {
    date: paidAt,
    payment: {
      method: payment.method,
      app: payment.app,
      transaction_id: payment.transactionId,
      date: paidAt,
    },
  })

  saving.value = true
  try {
    const updated = await SalesService.recordPayment(props.order.id, {
      ...payment,
      paymentApp: payment.app,
      status: nextStatus,
      statusHistory,
    })
    success('Payment recorded')
    emit('saved', updated)
    open.value = false
  } catch (err) {
    showError(err.message || 'Could not record this payment')
  } finally {
    saving.value = false
  }
}
</script>
