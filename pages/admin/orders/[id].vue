<template>
  <div class="ta-admin-order-detail">
    <AppLoading v-if="loading" />

    <template v-else-if="order">
      <AdminPageHeader
        :title="`Order ${order.order_number}`"
        :subtitle="`Placed on ${formatDate(order.order_date, { hour: 'numeric', minute: '2-digit' })}`"
      >
        <template #actions>
          <v-btn variant="outlined" prepend-icon="mdi-printer" class="mr-2">Print Invoice</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="order.order_status === OrderStatus.COMPLETED || order.order_status === OrderStatus.CANCELLED"
            @click="advanceStatus"
          >
            {{ nextActionLabel }}
          </v-btn>
        </template>
      </AdminPageHeader>

      <div class="ta-admin-order-detail__layout">
        <!-- Main Content -->
        <div class="ta-admin-order-detail__main">
          <!-- Order Workflow Timeline -->
          <v-card elevation="0" border rounded="lg" class="pa-5 mb-4 ta-admin-order-detail__timeline-card">
            <h3 class="text-subtitle-1 font-weight-semibold mb-4">Order Progress</h3>
            <div class="ta-timeline">
              <div
                v-for="(step, idx) in OrderWorkflowSteps"
                :key="step"
                class="ta-timeline__step"
                :class="{
                  'ta-timeline__step--active': currentStepIndex === idx,
                  'ta-timeline__step--completed': currentStepIndex > idx,
                }"
              >
                <div class="ta-timeline__icon-wrap">
                  <v-icon
                    :icon="currentStepIndex > idx ? 'mdi-check' : OrderStatusIcons[step]"
                    size="16"
                  />
                </div>
                <div class="ta-timeline__content">
                  <div class="ta-timeline__label">{{ OrderStatusLabels[step] }}</div>
                  <div v-if="getStepDate(step)" class="ta-timeline__date">
                    {{ formatDate(getStepDate(step), { hour: 'numeric', minute: '2-digit' }) }}
                  </div>
                </div>
                <div v-if="idx < OrderWorkflowSteps.length - 1" class="ta-timeline__line"></div>
              </div>
            </div>
          </v-card>

          <!-- Product Details -->
          <v-card elevation="0" border rounded="lg" class="mb-4">
            <v-card-title class="px-5 pt-5 pb-3 text-subtitle-1 font-weight-semibold">Product Details</v-card-title>
            <v-divider />
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <NuxtLink :to="Routes.ADMIN_PRODUCT_DETAIL(order.product_id)" class="ta-link">
                      {{ order.product_name }}
                    </NuxtLink>
                  </td>
                  <td><span class="text-caption text-medium-emphasis">{{ order.product_sku }}</span></td>
                  <td class="text-right">{{ formatCurrency(order.selling_price) }}</td>
                  <td class="text-right">{{ order.quantity }}</td>
                  <td class="text-right"><strong>{{ formatCurrency(order.selling_price * order.quantity) }}</strong></td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <!-- Cost & Profit (Admin Only) -->
          <v-card elevation="0" border rounded="lg" class="mb-4 ta-admin-order-detail__cost-card">
            <v-card-title class="px-5 pt-5 pb-3 text-subtitle-1 font-weight-semibold">Cost &amp; Profit Analysis (Internal)</v-card-title>
            <v-divider />
            <div class="pa-5">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="ta-cost-row"><span>Selling Amount</span><span>{{ formatCurrency(order.total_amount) }}</span></div>
                  <div class="ta-cost-row text-medium-emphasis"><span>Product Cost</span><span>{{ formatCurrency(order.product_cost) }}</span></div>
                  <div class="ta-cost-row text-medium-emphasis"><span>Packaging Cost</span><span>{{ formatCurrency(order.packaging_cost) }}</span></div>
                  <div class="ta-cost-row text-medium-emphasis"><span>Other Costs</span><span>{{ formatCurrency(order.other_cost) }}</span></div>
                  <v-divider class="my-2" />
                  <div class="ta-cost-row font-weight-medium"><span>Total Cost</span><span>{{ formatCurrency(order.total_cost) }}</span></div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="ta-profit-box">
                    <div class="ta-profit-box__item">
                      <span class="text-caption">Profit</span>
                      <strong class="text-success text-h6">{{ formatCurrency(order.profit) }}</strong>
                    </div>
                    <div class="ta-profit-box__item">
                      <span class="text-caption">Profit Margin</span>
                      <strong class="text-success text-h6">{{ order.profit_margin }}%</strong>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </div>

        <!-- Sidebar Info -->
        <div class="ta-admin-order-detail__sidebar">
          <!-- Customer -->
          <v-card elevation="0" border rounded="lg" class="pa-5 mb-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-subtitle-1 font-weight-semibold">Customer</h3>
              <v-btn icon="mdi-open-in-new" size="x-small" variant="text" :to="Routes.ADMIN_CUSTOMER_DETAIL(order.customer_id)" />
            </div>
            <div class="font-weight-medium mb-1">{{ order.customer_name }}</div>
            <div class="text-body-2 text-medium-emphasis mb-2"><v-icon icon="mdi-phone" size="14" class="mr-1" />{{ order.customer_phone }}</div>
          </v-card>

          <!-- Payment -->
          <v-card elevation="0" border rounded="lg" class="pa-5 mb-4">
            <h3 class="text-subtitle-1 font-weight-semibold mb-3">Payment</h3>
            <div class="mb-3">
              <AdminStatusChip :status="order.payment_status" :label-map="PaymentStatusLabels" :color-map="PaymentStatusColors" />
            </div>
            <div class="ta-sidebar-info">
              <span class="ta-sidebar-info__label">Method</span>
              <span class="ta-sidebar-info__value">{{ PaymentMethodLabels[order.payment_method] || order.payment_method }}</span>
            </div>
            <div class="ta-sidebar-info">
              <span class="ta-sidebar-info__label">Total Amount</span>
              <span class="ta-sidebar-info__value font-weight-semibold">{{ formatCurrency(order.total_amount) }}</span>
            </div>
            <div v-if="order.payment_date" class="ta-sidebar-info mt-2">
              <span class="ta-sidebar-info__label">Received On</span>
              <span class="ta-sidebar-info__value">{{ formatDate(order.payment_date) }}</span>
            </div>
          </v-card>

          <!-- Delivery -->
          <v-card elevation="0" border rounded="lg" class="pa-5">
            <h3 class="text-subtitle-1 font-weight-semibold mb-3">Delivery</h3>
            <div class="ta-sidebar-info">
              <span class="ta-sidebar-info__label">Expected</span>
              <span class="ta-sidebar-info__value">{{ order.expected_delivery ? formatDate(order.expected_delivery) : '—' }}</span>
            </div>
            <div class="ta-sidebar-info">
              <span class="ta-sidebar-info__label">Actual</span>
              <span class="ta-sidebar-info__value">{{ order.actual_delivery ? formatDate(order.actual_delivery) : '—' }}</span>
            </div>
            <div v-if="order.notes" class="mt-4">
              <span class="text-caption text-medium-emphasis d-block mb-1">Notes</span>
              <p class="text-body-2 mb-0">{{ order.notes }}</p>
            </div>
          </v-card>
        </div>
      </div>
    </template>

    <AppEmptyState
      v-else
      icon="mdi-clipboard-text-off-outline"
      title="Order Not Found"
      description="The order you are looking for does not exist."
      action-label="Back to Orders"
      :action-to="Routes.ADMIN_ORDERS"
    />
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { formatCurrency } from '~/helpers/currency.js'
import { formatDate } from '~/helpers/date.js'
import { PaymentStatusLabels, PaymentStatusColors, PaymentMethodLabels } from '~/enums/paymentStatus.js'
import { OrderStatusLabels, OrderStatusColors, OrderStatusIcons, OrderWorkflowSteps, OrderStatus } from '~/enums/orderStatus.js'
import { SalesService } from '~/services/SalesService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_ORDER_DETAIL })

const route = useRoute()
const loading = ref(true)
const order = ref(null)

const currentStepIndex = computed(() => {
  if (!order.value) return 0
  return OrderWorkflowSteps.indexOf(order.value.order_status)
})

const getStepDate = (step) => {
  if (!order.value || !order.value.status_history) return null
  const h = order.value.status_history.find(h => h.status === step)
  return h ? h.date : null
}

const nextActionLabel = computed(() => {
  if (currentStepIndex.value === -1) return 'Order Cancelled'
  if (currentStepIndex.value >= OrderWorkflowSteps.length - 1) return 'Completed'
  
  const nextStep = OrderWorkflowSteps[currentStepIndex.value + 1]
  switch (nextStep) {
    case OrderStatus.PAYMENT_RECEIVED: return 'Mark Payment Received'
    case OrderStatus.SENT_TO_STITCHING: return 'Send to Stitching'
    case OrderStatus.STITCHING_COMPLETED: return 'Mark Stitching Completed'
    case OrderStatus.PACKED: return 'Mark as Packed'
    case OrderStatus.HANDED_TO_COURIER: return 'Hand to Courier'
    case OrderStatus.DELIVERED: return 'Mark Delivered'
    case OrderStatus.COMPLETED: return 'Complete Order'
    default: return 'Next Step'
  }
})

const advanceStatus = async () => {
  if (currentStepIndex.value < OrderWorkflowSteps.length - 1) {
    const nextStep = OrderWorkflowSteps[currentStepIndex.value + 1]
    // Optimistic update for UI demo
    order.value.order_status = nextStep
    if (!order.value.status_history) order.value.status_history = []
    order.value.status_history.push({ status: nextStep, date: new Date().toISOString() })
  }
}

onMounted(async () => {
  try {
    const res = await SalesService.getAll()
    const orders = res.data || []
    order.value = orders.find(o => o.id === route.params.id)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.ta-admin-order-detail {
  &__layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: var(--spacing-lg);
    align-items: start;

    @include respond-below(lg) {
      grid-template-columns: 1fr;
    }
  }

  &__timeline-card {
    overflow-x: auto;
    @include custom-scrollbar;
  }

  &__cost-card {
    background: rgba(197, 160, 89, 0.05) !important;
    border-color: rgba(197, 160, 89, 0.2) !important;
  }
}

.ta-timeline {
  display: flex;
  align-items: flex-start;
  min-width: 800px;
  padding: var(--spacing-sm) 0;

  &__step {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 var(--spacing-xs);

    &--completed {
      .ta-timeline__icon-wrap {
        background: var(--color-success);
        color: white;
        border-color: var(--color-success);
      }
      .ta-timeline__line { background: var(--color-success); }
    }

    &--active {
      .ta-timeline__icon-wrap {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.2);
      }
      .ta-timeline__label { font-weight: $font-weight-bold; color: var(--color-text-primary); }
    }
  }

  &__icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    color: var(--color-text-muted);
    @include flex-center;
    position: relative;
    z-index: 2;
    transition: all var(--transition-base);
  }

  &__line {
    position: absolute;
    top: 15px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: var(--color-border);
    z-index: 1;
  }

  &__content {
    margin-top: var(--spacing-sm);
  }

  &__label {
    font-size: 11px;
    font-weight: $font-weight-medium;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wide;
  }

  &__date {
    font-size: 10px;
    color: var(--color-text-muted);
    margin-top: 2px;
  }
}

.ta-cost-row {
  @include flex-between;
  font-size: $font-size-sm;
  padding: 4px 0;
}

.ta-profit-box {
  background: white;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-md);

  &__item {
    @include flex-between;
  }
}

.ta-link {
  font-weight: $font-weight-semibold;
  color: var(--color-secondary);
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

.ta-sidebar-info {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-sm);

  &__label {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wider;
  }

  &__value {
    font-size: $font-size-sm;
    color: var(--color-text-primary);
  }
}
</style>
