<template>
  <div class="ta-admin-materials">
    <AdminPageHeader title="Materials" subtitle="Manage raw materials for product manufacturing.">
      <template #actions>
        <v-btn variant="outlined" prepend-icon="mdi-cart-plus" :to="Routes.ADMIN_MATERIAL_PURCHASES">Record Purchase</v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="openDialog()">Add Material</v-btn>
      </template>
    </AdminPageHeader>

    <AdminDataTable
      :headers="headers"
      :items="filteredMaterials"
      :loading="loading"
      search-placeholder="Search materials..."
      empty-message="No materials added yet."
      @search="search = $event"
    >
      <template #filters>
        <v-select v-model="typeFilter" :items="typeOptions" item-title="label" item-value="value" label="Type" variant="outlined" density="compact" hide-details clearable class="filter-select" />
        <v-select v-model="stockFilter" :items="stockOptions" item-title="label" item-value="value" label="Stock Status" variant="outlined" density="compact" hide-details clearable class="filter-select" />
      </template>

      <template #[`item.name`]="{ item }">
        <NuxtLink :to="Routes.ADMIN_MATERIAL_DETAIL(item.id)" class="material-link">{{ item.name }}</NuxtLink>
      </template>
      <template #[`item.type`]="{ item }">
        <AdminStatusChip :status="item.type" :label-map="MaterialTypeLabels" :color-map="MaterialTypeColors" />
      </template>
      <template #[`item.avg_unit_cost`]="{ item }">{{ formatCurrency(item.avg_unit_cost) }}</template>
      <template #[`item.total_inventory_value`]="{ item }">{{ formatCurrency(item.total_inventory_value) }}</template>
      <template #[`item.status`]="{ item }">
        <AdminStatusChip :status="getMatStockStatus(item)" :label-map="StockStatusLabels" :color-map="StockStatusColors" />
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn icon="mdi-eye-outline" size="small" variant="text" :to="Routes.ADMIN_MATERIAL_DETAIL(item.id)" />
        <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openDialog(item)" />
        <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(item)" />
      </template>
    </AdminDataTable>

    <AdminFormDialog v-model="dialogOpen" :title="editing ? 'Edit Material' : 'Add Material'" :loading="saving" max-width="560" @save="saveMaterial">
      <v-text-field v-model="form.name" label="Material Name *" variant="outlined" density="comfortable" class="mb-3" />
      <v-select v-model="form.unit" :items="unitOptions" item-title="label" item-value="value" label="Unit *" variant="outlined" density="comfortable" class="mb-3" />
      <v-text-field v-model="form.supplier" label="Supplier" variant="outlined" density="comfortable" class="mb-3" />
      <v-text-field v-model.number="form.min_stock_level" label="Minimum Stock Level" type="number" variant="outlined" density="comfortable" class="mb-3" />
      <v-textarea v-model="form.notes" label="Notes" variant="outlined" density="comfortable" rows="2" />
    </AdminFormDialog>

    <AdminConfirmDialog v-model="deleteDialog" title="Delete Material" :message="`Delete &quot;${materialToDelete?.name}&quot;?`" :loading="deleting" @confirm="handleDelete" />
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { MaterialType, MaterialTypeLabels, MaterialTypeColors } from '~/enums/materialType.js'
import { MaterialUnit, MaterialUnitLabels } from '~/enums/materialUnit.js'
import { StockStatusLabels, StockStatusColors } from '~/enums/stockStatus.js'
import { formatCurrency } from '~/helpers/currency.js'
const getStockStatus = (material) => {
  const stock = Number(material.current_stock ?? material.stock) || 0
  if (stock === 0) return 'out_of_stock'
  if (stock <= (Number(material.min_stock_level) || 0)) return 'low_stock'
  return 'in_stock'
}

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_MATERIALS })

const { materials, loading, fetchMaterials, createMaterial, updateMaterial, deleteMaterial, saving } = useMaterials()

const search = ref('')
const typeFilter = ref(MaterialType.PRODUCT)
const stockFilter = ref(null)
const dialogOpen = ref(false)
const editing = ref(null)
const deleteDialog = ref(false)
const materialToDelete = ref(null)
const deleting = ref(false)
const form = reactive({ name: '', unit: MaterialUnit.METER, supplier: '', min_stock_level: 10, notes: '', type: MaterialType.PRODUCT })

const headers = [
  { title: 'Material', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Stock', key: 'current_stock' },
  { title: 'Unit', key: 'unit' },
  { title: 'Avg Cost', key: 'avg_unit_cost' },
  { title: 'Inventory Value', key: 'total_inventory_value' },
  { title: 'Status', key: 'status', sortable: false },
  { title: '', key: 'actions', sortable: false, width: 120 },
]

const typeOptions = [{ value: null, label: 'All Types' }, ...Object.entries(MaterialTypeLabels).map(([value, label]) => ({ value, label }))]
const stockOptions = [{ value: null, label: 'All' }, ...Object.entries(StockStatusLabels).map(([value, label]) => ({ value, label }))]
const unitOptions = Object.entries(MaterialUnitLabels).map(([value, label]) => ({ value, label }))

const getMatStockStatus = (item) => getStockStatus(item)

const filteredMaterials = computed(() => {
  let result = materials.value
  if (typeFilter.value) result = result.filter(m => m.type === typeFilter.value)
  if (stockFilter.value) result = result.filter(m => getStockStatus(m) === stockFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(m => m.name.toLowerCase().includes(q))
  }
  return result
})

const blankForm = () => ({
  name: '',
  unit: MaterialUnit.METER,
  supplier: '',
  min_stock_level: 10,
  notes: '',
  type: MaterialType.PRODUCT,
})

const openDialog = (mat = null) => {
  editing.value = mat
  Object.assign(
    form,
    mat
      ? {
          name: mat.name || '',
          unit: mat.unit || MaterialUnit.METER,
          supplier: mat.supplier || '',
          min_stock_level: mat.min_stock_level ?? 10,
          notes: mat.notes || '',
          type: mat.type || MaterialType.PRODUCT,
        }
      : blankForm(),
  )
  dialogOpen.value = true
}

const saveMaterial = async () => {
  if (editing.value) await updateMaterial(editing.value.id, form)
  else await createMaterial(form)
  dialogOpen.value = false
  fetchMaterials()
}

const confirmDelete = (mat) => { materialToDelete.value = mat; deleteDialog.value = true }
const handleDelete = async () => {
  deleting.value = true
  await deleteMaterial(materialToDelete.value.id)
  deleting.value = false
  deleteDialog.value = false
}

onMounted(() => fetchMaterials())
</script>

<style scoped>
.material-link { font-weight: 600; color: inherit; text-decoration: none; &:hover { color: var(--color-secondary); } }
.filter-select { max-width: 160px; min-width: 140px; }
</style>
