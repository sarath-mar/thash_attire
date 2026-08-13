<template>
  <div class="ta-admin-customer-detail">
    <AppLoading v-if="loading" />

    <template v-else-if="customer">
      <AdminPageHeader
        :title="customer.name"
        :subtitle="customer.phone"
      />

      <div class="ta-admin-customer-detail__layout">
        <!-- Left: Customer Info -->
        <div class="ta-admin-customer-detail__info">
          <v-card elevation="0" border rounded="lg" class="pa-5 mb-4">
            <h3 class="text-subtitle-1 font-weight-semibold mb-3">Customer Information</h3>
            <div class="mb-3">
              <span class="text-caption text-medium-emphasis d-block">Phone Number</span>
              <span>{{ customer.phone }}</span>
            </div>
            <div class="mb-3">
              <span class="text-caption text-medium-emphasis d-block">Address</span>
              <span>{{ customer.address || 'No address provided' }}</span>
            </div>
            <div>
              <span class="text-caption text-medium-emphasis d-block">Notes</span>
              <span>{{ customer.notes || '—' }}</span>
            </div>
          </v-card>

          <v-card elevation="0" border rounded="lg" class="pa-5">
            <h3 class="text-subtitle-1 font-weight-semibold mb-3">Statistics</h3>
            <v-row dense>
              <v-col cols="6">
                <span class="text-caption text-medium-emphasis d-block">Total Orders</span>
                <span class="text-h6">{{ customer.total_orders }}</span>
              </v-col>
              <v-col cols="6">
                <span class="text-caption text-medium-emphasis d-block">Total Purchased</span>
                <span class="text-h6 text-success">{{ formatCurrency(customer.total_amount) }}</span>
              </v-col>
            </v-row>
          </v-card>
        </div>

        <!-- Right: Order History -->
        <div class="ta-admin-customer-detail__orders">
          <v-card elevation="0" border rounded="lg">
            <v-card-title class="px-5 pt-5 pb-3 text-subtitle-1 font-weight-semibold">Order History</v-card-title>
            <v-divider />

            <AppEmptyState
              v-if="!orders.length"
              icon="mdi-cart-off"
              title="No orders yet"
              description="This customer hasn't placed any orders."
            />

            <v-table v-else density="comfortable" class="ta-admin-customer-detail__table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id">
                  <td>
                    <NuxtLink :to="Routes.ADMIN_ORDER_DETAIL(order.id)" class="ta-admin-customer-detail__link">
                      {{ order.order_number }}
                    </NuxtLink>
                  </td>
                  <td><div class="text-truncate" style="max-width: 180px">{{ order.product_name }}</div></td>
                  <td><strong>{{ formatCurrency(order.total_amount) }}</strong></td>
                  <td>
                    <AdminStatusChip :status="order.payment_status" :label-map="PaymentStatusLabels" :color-map="PaymentStatusColors" />
                  </td>
                  <td>
                    <AdminStatusChip :status="order.order_status" :label-map="OrderStatusLabels" :color-map="OrderStatusColors" />
                  </td>
                  <td>{{ formatDate(order.order_date) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </div>
      </div>
    </template>

    <AppEmptyState
      v-else
      icon="mdi-account-cancel-outline"
      title="Customer Not Found"
      description="The customer you are looking for does not exist."
      action-label="Back to Customers"
      :action-to="Routes.ADMIN_CUSTOMERS"
    />
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { formatCurrency } from '~/helpers/currency.js'
import { formatDate } from '~/helpers/date.js'
import { PaymentStatusLabels, PaymentStatusColors } from '~/enums/paymentStatus.js'
import { OrderStatusLabels, OrderStatusColors } from '~/enums/orderStatus.js'
import { CustomerService } from '~/services/CustomerService.js'
import { SalesService } from '~/services/SalesService.js' // We'll rename SalesService to OrderService later if needed, but it fetches from MOCK_ORDERS now

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_CUSTOMER_DETAIL })

const route = useRoute()
const loading = ref(true)
const customer = ref(null)
const orders = ref([])

onMounted(async () => {
  try {
    customer.value = await CustomerService.getById(route.params.id)
    if (customer.value) {
      // Fetch orders for this customer. For now using SalesService.
      const allOrders = await SalesService.getAll()
      orders.value = allOrders.filter(o => o.customer_id === customer.value.id)
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.ta-admin-customer-detail {
  &__layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: var(--spacing-lg);
    align-items: start;

    @include respond-below(md) {
      grid-template-columns: 1fr;
    }
  }

  &__table {
    font-size: $font-size-sm;

    th {
      font-size: $font-size-xs !important;
      text-transform: uppercase;
      letter-spacing: $letter-spacing-wider;
    }
  }

  &__link {
    font-weight: $font-weight-semibold;
    color: var(--color-secondary);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}
</style>
