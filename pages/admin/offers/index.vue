<template>
  <div class="ta-admin-offers">
    <AdminPageHeader
      title="Offers & Combos"
      subtitle="Manage combo pricing and special offers."
    >
      <template #actions>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" :to="Routes.ADMIN_OFFER_CREATE">
          Create Offer
        </v-btn>
      </template>
    </AdminPageHeader>

    <AdminDataTable
      :headers="headers"
      :items="offers"
      :loading="loading"
      search-placeholder="Search offers..."
      @search="searchQuery = $event"
    >
      <template #[`item.name`]="{ item }">
        <NuxtLink :to="Routes.ADMIN_OFFER_EDIT(item.id)" class="font-weight-semibold text-secondary text-decoration-none">
          {{ item.name }}
        </NuxtLink>
        <div class="text-caption text-medium-emphasis">{{ item.offer_type }}</div>
      </template>

      <template #[`item.products`]="{ item }">
        <div v-for="offerItem in item.offer_items" :key="offerItem.id" class="text-caption">
          {{ offerItem.product?.name }} &times; {{ offerItem.quantity }}
        </div>
      </template>

      <template #[`item.regular_total`]="{ item }">
        <span class="text-decoration-line-through text-medium-emphasis">
          {{ formatCurrency(calcRegularTotal(item.offer_items)) }}
        </span>
      </template>

      <template #[`item.offer_price`]="{ item }">
        <strong>{{ formatCurrency(item.offer_price) }}</strong>
      </template>

      <template #[`item.savings`]="{ item }">
        <v-chip size="small" color="success" variant="flat">
          Save {{ formatCurrency(calcSavings(calcRegularTotal(item.offer_items), item.offer_price)) }}
        </v-chip>
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip
          size="small"
          :color="item.status === 'active' ? 'success' : 'error'"
          variant="tonal"
        >
          {{ item.status.toUpperCase() }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-menu location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="menuProps" />
          </template>
          <v-list density="compact">
            <v-list-item :to="Routes.ADMIN_OFFER_EDIT(item.id)" prepend-icon="mdi-pencil-outline" title="Edit Offer" />
            <v-list-item prepend-icon="mdi-delete-outline" title="Delete" class="text-error" @click="confirmDelete(item)" />
          </v-list>
        </v-menu>
      </template>
    </AdminDataTable>

    <AdminConfirmDialog
      v-model="deleteDialog"
      title="Delete Offer"
      :text="`Are you sure you want to delete '${itemToDelete?.name}'? This will not delete the underlying products.`"
      confirm-text="Delete"
      confirm-color="error"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { formatCurrency } from '~/helpers/currency.js'
import { useOffers } from '~/composables/useOffers.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: `Offers & Combos - ${PageTitles.ADMIN_DASHBOARD}` })

const { offers: allOffers, loading, fetchOffers, deleteOffer, calcRegularTotal, calcSavings } = useOffers()
const searchQuery = ref('')

const deleteDialog = ref(false)
const itemToDelete = ref(null)

const headers = [
  { title: 'Offer Name', key: 'name' },
  { title: 'Included Products', key: 'products', sortable: false },
  { title: 'Regular Total', key: 'regular_total' },
  { title: 'Offer Price', key: 'offer_price' },
  { title: 'Savings', key: 'savings', sortable: false },
  { title: 'Status', key: 'status' },
  { title: '', key: 'actions', sortable: false, width: 48 },
]

const offers = computed(() => {
  if (!searchQuery.value) return allOffers.value
  const q = searchQuery.value.toLowerCase()
  return allOffers.value.filter(o => o.name.toLowerCase().includes(q))
})

const confirmDelete = (item) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const handleDelete = async () => {
  if (!itemToDelete.value) return
  await deleteOffer(itemToDelete.value.id)
  itemToDelete.value = null
}

onMounted(() => {
  fetchOffers()
})
</script>
