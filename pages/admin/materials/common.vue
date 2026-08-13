<template>
  <div class="ta-admin-common-materials">
    <AdminPageHeader title="Common Materials" subtitle="Packaging and branding materials used per order.">
      <template #actions>
        <v-btn variant="outlined" prepend-icon="mdi-cart-plus" :to="Routes.ADMIN_MATERIAL_PURCHASES">Record Purchase</v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="openDialog()">Add Material</v-btn>
      </template>
    </AdminPageHeader>

    <AdminDataTable
      :headers="headers"
      :items="materials"
      :loading="loading"
      search-placeholder="Search common materials..."
      empty-message="No common materials yet."
      @search="onSearch"
    >
      <template #[`item.avg_unit_cost`]="{ item }">{{ formatCurrency(item.avg_unit_cost) }}</template>
      <template #[`item.total_inventory_value`]="{ item }">{{ formatCurrency(item.total_inventory_value) }}</template>
      <template #[`item.status`]="{ item }">
        <AdminStatusChip :status="getStockStatus(item)" :label-map="StockStatusLabels" :color-map="StockStatusColors" />
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openDialog(item)" />
      </template>
    </AdminDataTable>

    <AdminFormDialog v-model="dialogOpen" :title="editing ? 'Edit Common Material' : 'Add Common Material'" :loading="saving" @save="saveMaterial">
      <v-text-field v-model="form.name" label="Material Name *" variant="outlined" density="comfortable" class="mb-3" />
      <v-select v-model="form.unit" :items="unitOptions" item-title="label" item-value="value" label="Unit" variant="outlined" density="comfortable" class="mb-3" />
      <v-text-field v-model="form.supplier" label="Supplier" variant="outlined" density="comfortable" class="mb-3" />
      <v-text-field v-model.number="form.min_stock_level" label="Minimum Stock" type="number" variant="outlined" density="comfortable" />
    </AdminFormDialog>
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { MaterialType } from '~/enums/materialType.js'
import { MaterialUnit, MaterialUnitLabels } from '~/enums/materialUnit.js'
import { StockStatusLabels, StockStatusColors } from '~/enums/stockStatus.js'
import { formatCurrency } from '~/helpers/currency.js'
import { getStockStatus } from '~/mock/materials.js'
import { MaterialService } from '~/services/MaterialService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_COMMON_MATERIALS })

const { createMaterial, updateMaterial, saving } = useMaterials()

const materials = ref([])
const loading = ref(true)
const dialogOpen = ref(false)
const editing = ref(null)
const form = reactive({ name: '', unit: MaterialUnit.PIECE, supplier: '', min_stock_level: 20, type: MaterialType.COMMON })

const headers = [
  { title: 'Material', key: 'name' },
  { title: 'Stock', key: 'current_stock' },
  { title: 'Avg Cost', key: 'avg_unit_cost' },
  { title: 'Inventory Value', key: 'total_inventory_value' },
  { title: 'Status', key: 'status', sortable: false },
  { title: '', key: 'actions', sortable: false, width: 56 },
]

const unitOptions = Object.entries(MaterialUnitLabels).map(([value, label]) => ({ value, label }))

const load = async () => {
  loading.value = true
  materials.value = await MaterialService.getAll('', MaterialType.COMMON)
  loading.value = false
}

const onSearch = async (q) => {
  materials.value = await MaterialService.getAll(q, MaterialType.COMMON)
}

const openDialog = (mat = null) => {
  editing.value = mat
  Object.assign(form, mat || { name: '', unit: MaterialUnit.PIECE, supplier: '', min_stock_level: 20, type: MaterialType.COMMON })
  dialogOpen.value = true
}

const saveMaterial = async () => {
  if (editing.value) await updateMaterial(editing.value.id, form)
  else await createMaterial(form)
  dialogOpen.value = false
  await load()
}

onMounted(load)
</script>
