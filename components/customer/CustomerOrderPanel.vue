<template>
  <div class="ed-orders">
    <template v-if="!authenticated">
      <p>Sign in to see current and past orders.</p>
      <NuxtLink class="ed-orders__signin" :to="{ path: '/login', query: { redirect: '/?panel=orders' } }">Sign in</NuxtLink>
    </template>
    <template v-else-if="loading">
      <p class="ed-orders__note">Loading your orders…</p>
    </template>
    <template v-else-if="selected">
      <button type="button" class="ed-orders__back" @click="selected = null">All orders</button>
      <p class="ed-orders__number">{{ selected.order_number }}</p>
      <p class="ed-orders__status">{{ orderStatusLabel(selected.status) }}</p>

      <dl class="ed-orders__facts">
        <dt>Placed</dt>
        <dd>{{ placedLabel(selected) }}</dd>
        <dt>Payment</dt>
        <dd>{{ paymentLabel(selected) }}</dd>
        <dt v-if="selected.expected_delivery">Expected</dt>
        <dd v-if="selected.expected_delivery">{{ formatDate(selected.expected_delivery) }}</dd>
      </dl>

      <h3>Pieces</h3>
      <ul>
        <li v-for="item in pieces(selected)" :key="item.id || item.product_name">
          <span>{{ item.product_name }}</span>
          <span>Qty {{ item.quantity }}</span>
          <strong>{{ formatCurrency((Number(item.selling_price) || 0) * (Number(item.quantity) || 1)) }}</strong>
        </li>
      </ul>

      <p v-if="Number(selected.discount) > 0" class="ed-orders__line">
        <span>Discount</span>
        <strong>{{ formatCurrency(selected.discount) }}</strong>
      </p>
      <p class="ed-orders__total">
        <span>Total</span>
        <strong>{{ formatCurrency(selected.final_amount) }}</strong>
      </p>

      <h3 v-if="selected.shipping_address">Delivery</h3>
      <p v-if="selected.shipping_address" class="ed-orders__copy">{{ selected.shipping_address }}</p>
      <p v-if="selected.customer_name || selected.customer_phone" class="ed-orders__copy">
        {{ selected.customer_name }}<template v-if="selected.customer_phone"> · {{ selected.customer_phone }}</template>
      </p>
      <p v-if="selected.notes" class="ed-orders__copy">{{ selected.notes }}</p>

      <button v-if="isPaid(selected)" type="button" class="ed-orders__download" @click="download(selected)">Download PDF</button>
      <p v-else class="ed-orders__note">You can download the PDF only after payment.</p>
    </template>
    <template v-else>
      <p v-if="error" class="ed-orders__note">{{ error }}</p>
      <h3>Current</h3>
      <p v-if="!currentOrders.length" class="ed-orders__note">No orders in progress.</p>
      <ul v-else>
        <li v-for="order in currentOrders" :key="order.id">
          <button type="button" @click="selected = order">
            <span>{{ order.order_number }}</span>
            <span>{{ orderLabel(order) }}</span>
            <b>{{ orderStatusLabel(order.status) }}</b>
            <strong>{{ formatCurrency(order.final_amount) }}</strong>
          </button>
        </li>
      </ul>
      <h3>Past</h3>
      <p v-if="!pastOrders.length" class="ed-orders__note">No past orders yet.</p>
      <ul v-else>
        <li v-for="order in pastOrders" :key="order.id">
          <button type="button" @click="selected = order">
            <span>{{ order.order_number }}</span>
            <span>{{ orderLabel(order) }}</span>
            <b>{{ orderStatusLabel(order.status) }}</b>
            <strong>{{ formatCurrency(order.final_amount) }}</strong>
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { formatCurrency } from '~/helpers/currency.js'
import { formatDate } from '~/helpers/date.js'
import { downloadOrderPdf } from '~/helpers/orderPdf.js'
import { OrderStatusLabels } from '~/enums/orderStatus.js'
import { PaymentAppLabels, PaymentMethodLabels, PaymentStatus, PaymentStatusLabels } from '~/enums/paymentStatus.js'

const props = defineProps({
  orders: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  authenticated: { type: Boolean, default: false },
})

const selected = ref(null)
const pastStatuses = new Set(['delivered', 'completed', 'cancelled'])

const currentOrders = computed(() => props.orders.filter(order => !pastStatuses.has(order.status)))
const pastOrders = computed(() => props.orders.filter(order => pastStatuses.has(order.status)))

function orderLabel(order) {
  return order.product_name || order.sale_items?.[0]?.product_name || 'Custom order'
}

function orderStatusLabel(status) {
  return OrderStatusLabels[status] || 'In progress'
}

function placedLabel(order) {
  return formatDate(order.order_date || order.sale_date, { hour: 'numeric', minute: '2-digit' }) || '—'
}

function paymentLabel(order) {
  const status = PaymentStatusLabels[order.payment_status] || 'Pending'
  const method = PaymentMethodLabels[order.payment_method]
  return method ? `${status} · ${method}` : status
}

function pieces(order) {
  if (Array.isArray(order.sale_items) && order.sale_items.length) return order.sale_items
  return [{
    id: order.id,
    product_name: order.product_name || 'Custom order',
    quantity: order.quantity || 1,
    selling_price: order.selling_price || order.final_amount || 0,
  }]
}

function isPaid(order) {
  return order?.payment_status === PaymentStatus.PAID
}

function download(order) {
  if (!isPaid(order)) return
  const config = useRuntimeConfig()
  downloadOrderPdf(order, {
    placed: formatDate(order.order_date || order.sale_date) || '—',
    expected: order.expected_delivery ? formatDate(order.expected_delivery) : '—',
    method: PaymentMethodLabels[order.payment_method] || 'Paid',
    app: PaymentAppLabels[order.payment_app] || '',
    paidOn: order.payment_date ? formatDate(order.payment_date) : '',
    transaction: order.transaction_id || '',
    companyPhone: config.public.whatsappNumber || '',
  })
}
</script>

<style scoped lang="scss">
.ed-orders {
  h3 {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 28px;
    font-weight: 500;
    margin: 8px 0 10px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 18px;
  }

  li {
    border-bottom: 1px solid #f0d2d4;
  }

  li button {
    display: grid;
    gap: 2px;
    width: 100%;
    padding: 12px 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
    font: inherit;
  }

  b {
    color: var(--ed-rose, #a24b62);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.ed-orders__note,
.ed-orders__copy {
  color: var(--ed-mute, #7a6468);
}

.ed-orders__signin,
.ed-orders__download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  margin-top: 16px;
  padding: 0 18px;
  border-radius: 99px;
  border: 1.5px solid var(--ed-ink, #231a1d);
  background: var(--ed-rose, #a24b62);
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.ed-orders__back {
  width: auto;
  margin-bottom: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ed-rose, #a24b62);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.ed-orders__number {
  margin: 0;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 36px;
  line-height: 1;
}

.ed-orders__status {
  margin: 8px 0 16px;
  color: var(--ed-rose, #a24b62);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ed-orders__facts {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 8px 12px;
  margin: 0 0 18px;

  dt {
    color: var(--ed-mute, #7a6468);
  }

  dd {
    margin: 0;
  }
}

.ed-orders__line,
.ed-orders__total {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}

.ed-orders__total {
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 28px;
}
</style>
