<template>
  <div class="ta-admin-customers">
    <AdminPageHeader
      title="Customers"
      subtitle="Manage your customers and view their order history."
    />

    <AdminDataTable
      :headers="headers"
      :items="customers"
      :loading="loading"
      search-placeholder="Search customers by name or phone..."
      @search="searchQuery = $event"
    >
      <template #[`item.name`]="{ item }">
        <NuxtLink :to="Routes.ADMIN_CUSTOMER_DETAIL(item.id)" class="ta-admin-customers__link">
          {{ item.name }}
        </NuxtLink>
      </template>

      <template #[`item.total_amount`]="{ item }">
        <strong>{{ formatCurrency(item.total_amount) }}</strong>
      </template>

      <template #[`item.last_order_date`]="{ item }">
        {{ item.last_order_date ? formatDate(item.last_order_date) : 'Never' }}
      </template>

      <template #[`item.actions`]="{ item }">
        <v-btn
          icon="mdi-eye-outline"
          size="small"
          variant="text"
          :to="Routes.ADMIN_CUSTOMER_DETAIL(item.id)"
        />
      </template>
    </AdminDataTable>
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { formatCurrency } from '~/helpers/currency.js'
import { formatDate } from '~/helpers/date.js'
import { CustomerService } from '~/services/CustomerService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_CUSTOMERS })

const loading = ref(true)
const allCustomers = ref([])
const searchQuery = ref('')

const headers = [
  { title: 'Customer', key: 'name' },
  { title: 'Phone', key: 'phone' },
  { title: 'Orders', key: 'total_orders' },
  { title: 'Total Purchased', key: 'total_amount' },
  { title: 'Last Order', key: 'last_order_date' },
  { title: '', key: 'actions', sortable: false, width: 48 },
]

const customers = computed(() => {
  if (!searchQuery.value) return allCustomers.value
  const q = searchQuery.value.toLowerCase()
  return allCustomers.value.filter(c =>
    c.name.toLowerCase().includes(q) || c.phone.includes(q),
  )
})

onMounted(async () => {
  try {
    const res = await CustomerService.getAll()
    allCustomers.value = res.data || []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.ta-admin-customers {
  &__link {
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
    text-decoration: none;
    &:hover { color: var(--color-secondary); }
  }
}
</style>
