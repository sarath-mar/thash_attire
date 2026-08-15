<template>
  <div class="ta-admin-orders">
    <AdminPageHeader
      title="Orders"
      subtitle="Manage customer orders, payments and delivery workflow."
    >
      <template #actions>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" :to="Routes.ADMIN_ORDER_CREATE">
          Create Order
        </v-btn>
      </template>
    </AdminPageHeader>

    <AdminDataTable
      :headers="headers"
      :items="orders"
      :loading="loading"
      search-placeholder="Search orders..."
      @search="searchQuery = $event"
    >
      <template #[`item.order_number`]="{ item }">
        <NuxtLink :to="Routes.ADMIN_ORDER_DETAIL(item.id)" class="ta-admin-orders__link">
          {{ item.order_number }}
        </NuxtLink>
      </template>

      <template #[`item.product`]="{ item }">
        <div v-if="item.offer_id" class="d-flex align-center">
          <v-chip size="x-small" color="primary" variant="flat" class="mr-2">Combo</v-chip>
          <span class="text-truncate text-caption text-medium-emphasis" style="max-width: 200px">
            {{ item.sale_items?.length }} Items
          </span>
        </div>
        <div v-else class="text-truncate" style="max-width: 250px" :title="item.product_name || item.sale_items?.[0]?.product_name">
          {{ item.product_name || item.sale_items?.[0]?.product_name || 'Multiple Items' }}
        </div>
      </template>

      <template #[`item.total_amount`]="{ item }">
        <strong>{{ formatCurrency(item.total_amount) }}</strong>
      </template>

      <template #[`item.payment_status`]="{ item }">
        <AdminStatusChip
          :status="item.payment_status"
          :label-map="PaymentStatusLabels"
          :color-map="PaymentStatusColors"
        />
      </template>

      <template #[`item.order_status`]="{ item }">
        <AdminStatusChip
          :status="item.order_status"
          :label-map="OrderStatusLabels"
          :color-map="OrderStatusColors"
        />
      </template>

      <template #[`item.order_date`]="{ item }">
        {{ formatDate(item.order_date) }}
      </template>

      <template #[`item.expected_delivery`]="{ item }">
        {{ item.expected_delivery ? formatDate(item.expected_delivery) : '—' }}
      </template>

      <template #[`item.actions`]="{ item }">
        <v-menu location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="menuProps" />
          </template>
          <v-list density="compact">
            <v-list-item :to="Routes.ADMIN_ORDER_DETAIL(item.id)" prepend-icon="mdi-eye-outline" title="View Details" />
            <v-list-item v-if="item.order_status !== OrderStatus.COMPLETED" prepend-icon="mdi-check-all" title="Mark Completed" />
          </v-list>
        </v-menu>
      </template>
    </AdminDataTable>
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { PaymentStatusLabels, PaymentStatusColors } from '~/enums/paymentStatus.js'
import { OrderStatusLabels, OrderStatusColors, OrderStatus } from '~/enums/orderStatus.js'
import { formatCurrency } from '~/helpers/currency.js'
import { formatDate } from '~/helpers/date.js'
import { SalesService } from '~/services/SalesService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_ORDERS })

const loading = ref(true)
const allOrders = ref([])
const searchQuery = ref('')

const headers = [
  { title: 'Order #', key: 'order_number' },
  { title: 'Customer', key: 'customer_name' },
  { title: 'Product', key: 'product' },
  { title: 'Amount', key: 'total_amount' },
  { title: 'Payment', key: 'payment_status' },
  { title: 'Status', key: 'order_status' },
  { title: 'Exp. Delivery', key: 'expected_delivery' },
  { title: 'Date', key: 'order_date' },
  { title: '', key: 'actions', sortable: false, width: 48 },
]

const orders = computed(() => {
  if (!searchQuery.value) return allOrders.value
  const q = searchQuery.value.toLowerCase()
  return allOrders.value.filter(o =>
    o.order_number.toLowerCase().includes(q) ||
    o.customer_name.toLowerCase().includes(q) ||
    o.product_name.toLowerCase().includes(q),
  )
})

onMounted(async () => {
  try {
    const res = await SalesService.getAll()
    allOrders.value = res.data || []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.ta-admin-orders {
  &__link {
    font-weight: $font-weight-semibold;
    color: var(--color-secondary);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}
</style>
