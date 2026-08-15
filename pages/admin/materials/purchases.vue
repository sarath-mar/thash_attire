<template>
  <div class="ta-admin-purchases">
    <AdminPageHeader title="Material Purchases" subtitle="Record bulk material purchases and update weighted average costs.">
      <template #actions>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="dialogOpen = true">Record Purchase</v-btn>
      </template>
    </AdminPageHeader>

    <AdminDataTable
      :headers="headers"
      :items="purchases"
      :loading="loading"
      search-placeholder="Search by material or supplier..."
      empty-message="No purchases recorded yet."
      @search="onSearch"
    >
      <template #[`item.purchase_date`]="{ item }">{{ formatDate(item.purchase_date) }}</template>
      <template #[`item.total_amount`]="{ item }">{{ formatCurrency(item.total_amount) }}</template>
      <template #[`item.unit_cost`]="{ item }">{{ formatCurrency(item.unit_cost) }}/{{ item.unit }}</template>
      <template #[`item.actions`]="{ item }">
        <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(item)" />
      </template>
    </AdminDataTable>

    <AdminFormDialog v-model="dialogOpen" title="Record Purchase" icon="mdi-cart-plus" :loading="saving" max-width="640" save-text="Record Purchase" @save="savePurchase">
      <v-autocomplete
        v-model="form.material_id"
        :items="allMaterials"
        item-title="name"
        item-value="id"
        label="Material *"
        variant="outlined"
        density="comfortable"
        class="mb-3"
        @update:model-value="onMaterialSelect"
      />
      <v-row dense>
        <v-col cols="6">
          <CommonAppDatePicker v-model="form.purchase_date" label="Purchase Date *" variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="form.supplier" label="Supplier" variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model.number="form.quantity" label="Quantity *" type="number" variant="outlined" density="comfortable" :suffix="selectedMaterial?.unit" />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model.number="form.total_amount" label="Total Purchase Amount *" type="number" prefix="₹" variant="outlined" density="comfortable" hint="Total amount paid for entire quantity" persistent-hint />
        </v-col>
      </v-row>

      <v-alert v-if="form.quantity && form.total_amount" type="info" variant="tonal" density="compact" class="mt-4 mb-4">
        Unit Purchase Cost: <strong>{{ formatCurrency(form.total_amount / form.quantity) }}</strong> per {{ selectedMaterial?.unit }}
      </v-alert>

      <AdminWeightedAvgSummary
        v-if="selectedMaterial && form.quantity && form.total_amount"
        :existing-stock="selectedMaterial.current_stock"
        :existing-avg="selectedMaterial.avg_unit_cost"
        :new-qty="form.quantity"
        :new-total-cost="form.total_amount"
        :unit="selectedMaterial.unit"
      />

      <v-textarea v-model="form.notes" label="Notes" variant="outlined" density="comfortable" rows="2" class="mt-4" />
    </AdminFormDialog>

    <AdminConfirmDialog v-model="deleteDialog" title="Delete Purchase" message="Delete this purchase record?" :loading="deleting" @confirm="handleDelete" />
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { formatCurrency } from '~/helpers/currency.js'
import { formatDate, formatDateApi } from '~/helpers/date.js'
import { MaterialService } from '~/services/MaterialService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_MATERIAL_PURCHASES })

const { purchases, loading, fetchPurchases, createPurchase, deletePurchase, saving } = useMaterialPurchases()

const allMaterials = ref([])
const dialogOpen = ref(false)
const deleteDialog = ref(false)
const purchaseToDelete = ref(null)
const deleting = ref(false)
const selectedMaterial = ref(null)

const form = reactive({
  material_id: null,
  purchase_date: formatDateApi(new Date()),
  quantity: null,
  total_amount: null,
  supplier: '',
  notes: '',
})

const headers = [
  { title: 'Date', key: 'purchase_date' },
  { title: 'Material', key: 'material_name' },
  { title: 'Qty', key: 'quantity' },
  { title: 'Total Amount', key: 'total_amount' },
  { title: 'Unit Cost', key: 'unit_cost' },
  { title: 'Supplier', key: 'supplier' },
  { title: '', key: 'actions', sortable: false, width: 56 },
]

const onMaterialSelect = (id) => {
  selectedMaterial.value = allMaterials.value.find(m => m.id === id) || null
  if (selectedMaterial.value) form.supplier = selectedMaterial.value.supplier || ''
}

const onSearch = (q) => fetchPurchases(null, q)

const savePurchase = async () => {
  const result = await createPurchase({
    ...form,
    unit: selectedMaterial.value?.unit,
  })
  if (result) {
    dialogOpen.value = false
    Object.assign(form, { material_id: null, quantity: null, total_amount: null, supplier: '', notes: '' })
    selectedMaterial.value = null
    allMaterials.value = await MaterialService.getAll()
  }
}

const confirmDelete = (p) => { purchaseToDelete.value = p; deleteDialog.value = true }
const handleDelete = async () => {
  deleting.value = true
  await deletePurchase(purchaseToDelete.value.id)
  deleting.value = false
  deleteDialog.value = false
}

onMounted(async () => {
  fetchPurchases()
  allMaterials.value = await MaterialService.getAll()
})
</script>
