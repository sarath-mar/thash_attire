<template>
  <div class="ta-admin-inventory">
    <AdminPageHeader
      title="Inventory"
      subtitle="Track stock levels across products and materials."
    />

    <v-card elevation="0" border rounded="lg" class="ta-admin-inventory__card">
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="start"
        class="ta-admin-inventory__tabs"
      >
        <v-tab value="products">Products</v-tab>
        <v-tab value="materials">Product Materials</v-tab>
        <v-tab value="common">Common Materials</v-tab>
      </v-tabs>

      <v-divider />

      <v-window v-model="activeTab">
        <!-- Products Inventory -->
        <v-window-item value="products">
          <AdminDataTable
            :headers="productHeaders"
            :items="products"
            :loading="loadingProducts"
            search-placeholder="Search products..."
            @search="searchProducts = $event"
          >
            <template #[`item.image`]="{ item }">
              <v-avatar size="36" rounded>
                <v-img :src="getProductImageUrl(item)" cover />
              </v-avatar>
            </template>
            <template #[`item.stock`]="{ item }">
              <strong>{{ item.stock }}</strong>
            </template>
            <template #[`item.status`]="{ item }">
              <AdminStatusChip
                :status="getProductStockStatus(item)"
                :label-map="StockStatusLabels"
                :color-map="StockStatusColors"
              />
            </template>
          </AdminDataTable>
        </v-window-item>

        <!-- Product Materials Inventory -->
        <v-window-item value="materials">
          <AdminDataTable
            :headers="materialHeaders"
            :items="productMaterials"
            :loading="loadingMaterials"
            search-placeholder="Search materials..."
            @search="searchMaterials = $event"
          >
            <template #[`item.current_stock`]="{ item }">
              <strong>{{ item.current_stock }} {{ item.unit }}</strong>
            </template>
            <template #[`item.avg_unit_cost`]="{ item }">
              {{ formatCurrency(item.avg_unit_cost) }}
            </template>
            <template #[`item.total_inventory_value`]="{ item }">
              {{ formatCurrency(item.total_inventory_value) }}
            </template>
            <template #[`item.status`]="{ item }">
              <AdminStatusChip
                :status="getMaterialStockStatus(item)"
                :label-map="StockStatusLabels"
                :color-map="StockStatusColors"
              />
            </template>
          </AdminDataTable>
        </v-window-item>

        <!-- Common Materials Inventory -->
        <v-window-item value="common">
          <AdminDataTable
            :headers="materialHeaders"
            :items="commonMaterials"
            :loading="loadingMaterials"
            search-placeholder="Search common materials..."
            @search="searchCommon = $event"
          >
            <template #[`item.current_stock`]="{ item }">
              <strong>{{ item.current_stock }} {{ item.unit }}</strong>
            </template>
            <template #[`item.avg_unit_cost`]="{ item }">
              {{ formatCurrency(item.avg_unit_cost) }}
            </template>
            <template #[`item.total_inventory_value`]="{ item }">
              {{ formatCurrency(item.total_inventory_value) }}
            </template>
            <template #[`item.status`]="{ item }">
              <AdminStatusChip
                :status="getMaterialStockStatus(item)"
                :label-map="StockStatusLabels"
                :color-map="StockStatusColors"
              />
            </template>
          </AdminDataTable>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { StockStatusLabels, StockStatusColors } from '~/enums/stockStatus.js'
import { formatCurrency } from '~/helpers/currency.js'
import { getProductImageUrl } from '~/helpers/imageUrl.js'
import { ProductService } from '~/services/ProductService.js'
import { MaterialService } from '~/services/MaterialService.js'
import { MaterialType } from '~/enums/materialType.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_INVENTORY })

const activeTab = ref('products')

const allProducts = ref([])
const allMaterials = ref([])
const loadingProducts = ref(true)
const loadingMaterials = ref(true)

const searchProducts = ref('')
const searchMaterials = ref('')
const searchCommon = ref('')

const productHeaders = [
  { title: '', key: 'image', sortable: false, width: 48 },
  { title: 'Product', key: 'name' },
  { title: 'SKU', key: 'sku' },
  { title: 'Stock', key: 'stock' },
  { title: 'Threshold', key: 'low_stock_threshold' },
  { title: 'Status', key: 'status', sortable: false },
]

const materialHeaders = [
  { title: 'Material', key: 'name' },
  { title: 'Stock', key: 'current_stock' },
  { title: 'Threshold', key: 'min_stock_level' },
  { title: 'Avg Cost', key: 'avg_unit_cost' },
  { title: 'Value', key: 'total_inventory_value' },
  { title: 'Status', key: 'status', sortable: false },
]

const getProductStockStatus = (p) => {
  if (p.stock === 0) return 'out_of_stock'
  if (p.stock <= (p.low_stock_threshold || 5)) return 'low_stock'
  return 'in_stock'
}

const getMaterialStockStatus = (m) => {
  if (m.current_stock === 0) return 'out_of_stock'
  if (m.current_stock <= m.min_stock_level) return 'low_stock'
  return 'in_stock'
}

const filterByName = (items, search) => {
  if (!search) return items
  const s = search.toLowerCase()
  return items.filter(i => i.name.toLowerCase().includes(s))
}

const products = computed(() => filterByName(allProducts.value, searchProducts.value))
const productMaterials = computed(() => filterByName(allMaterials.value.filter(m => m.type === MaterialType.PRODUCT), searchMaterials.value))
const commonMaterials = computed(() => filterByName(allMaterials.value.filter(m => m.type === MaterialType.COMMON), searchCommon.value))

onMounted(async () => {
  try {
    const [p, m] = await Promise.all([
      ProductService.getAll(),
      MaterialService.getAll(),
    ])
    allProducts.value = p.data || []
    allMaterials.value = m || []
  } finally {
    loadingProducts.value = false
    loadingMaterials.value = false
  }
})
</script>
