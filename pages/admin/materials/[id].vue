<template>
  <div class="ta-admin-material-detail">
    <AppLoading v-if="loading" />

    <template v-else-if="material">
      <AdminPageHeader :title="material.name" :subtitle="MaterialTypeLabels[material.type] || material.type">
        <template #actions>
          <v-btn variant="outlined" prepend-icon="mdi-cart-plus" :to="Routes.ADMIN_MATERIAL_PURCHASES">
            Record Purchase
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" :to="backRoute">Back</v-btn>
        </template>
      </AdminPageHeader>

      <v-row dense>
        <v-col cols="12" md="4">
          <v-card elevation="0" border rounded="lg" class="pa-4 mb-4">
            <h3 class="text-subtitle-1 font-weight-semibold mb-3">Stock Overview</h3>
            <v-row dense>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Current Stock</p>
                <p class="text-h6">{{ material.current_stock }} {{ material.unit }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Min Level</p>
                <p class="text-h6">{{ material.min_stock_level }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Avg Unit Cost</p>
                <p class="text-h6">{{ formatCurrency(material.avg_unit_cost) }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Inventory Value</p>
                <p class="text-h6">{{ formatCurrency(material.total_inventory_value) }}</p>
              </v-col>
            </v-row>
            <AdminStatusChip
              class="mt-3"
              :status="stockStatus"
              :label-map="StockStatusLabels"
              :color-map="StockStatusColors"
            />
          </v-card>

          <v-card elevation="0" border rounded="lg" class="pa-4">
            <h3 class="text-subtitle-1 font-weight-semibold mb-3">Details</h3>
            <p class="text-caption text-medium-emphasis mb-1">Supplier</p>
            <p class="mb-3">{{ material.supplier || '—' }}</p>
            <p class="text-caption text-medium-emphasis mb-1">Unit</p>
            <p class="mb-3">{{ material.unit }}</p>
            <p class="text-caption text-medium-emphasis mb-1">Notes</p>
            <p class="mb-0">{{ material.notes || '—' }}</p>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <AdminFormSection title="Purchase History" subtitle="Purchases that update stock and weighted average cost.">
            <AdminDataTable
              :headers="purchaseHeaders"
              :items="purchases"
              :loading="loadingPurchases"
              :show-search="false"
              empty-message="No purchases recorded for this material."
            >
              <template #[`item.purchase_date`]="{ item }">{{ formatDate(item.purchase_date) }}</template>
              <template #[`item.total_amount`]="{ item }">{{ formatCurrency(item.total_amount) }}</template>
              <template #[`item.unit_cost`]="{ item }">{{ formatCurrency(item.unit_cost) }}/{{ item.unit || material.unit }}</template>
            </AdminDataTable>
          </AdminFormSection>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { MaterialType, MaterialTypeLabels } from '~/enums/materialType.js'
import { StockStatusLabels, StockStatusColors } from '~/enums/stockStatus.js'
import { formatCurrency } from '~/helpers/currency.js'
import { formatDate } from '~/helpers/date.js'
import { MaterialPurchaseService } from '~/services/MaterialPurchaseService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const materialId = route.params.id

const { material, loading, fetchMaterial } = useMaterials()
const purchases = ref([])
const loadingPurchases = ref(false)

useHead({ title: computed(() => material.value?.name || PageTitles.ADMIN_MATERIALS) })

const backRoute = computed(() =>
  material.value?.type === MaterialType.COMMON
    ? Routes.ADMIN_COMMON_MATERIALS
    : Routes.ADMIN_MATERIALS,
)

const stockStatus = computed(() => {
  const m = material.value
  if (!m) return 'in_stock'
  if (m.current_stock === 0 || m.stock === 0) return 'out_of_stock'
  if ((m.current_stock ?? m.stock) <= m.min_stock_level) return 'low_stock'
  return 'in_stock'
})

const purchaseHeaders = [
  { title: 'Date', key: 'purchase_date' },
  { title: 'Qty', key: 'quantity' },
  { title: 'Total Amount', key: 'total_amount' },
  { title: 'Unit Cost', key: 'unit_cost' },
  { title: 'Supplier', key: 'supplier' },
]

onMounted(async () => {
  await fetchMaterial(materialId)
  loadingPurchases.value = true
  try {
    purchases.value = await MaterialPurchaseService.getAll(materialId)
  } finally {
    loadingPurchases.value = false
  }
})
</script>
