<template>
  <div class="ta-admin-products">
    <AdminPageHeader
      title="Products"
      subtitle="Manage products, pricing, materials and availability."
    >
      <template #actions>
        <v-btn-toggle v-model="viewMode" mandatory density="compact" variant="outlined" divided class="mr-2">
          <v-btn value="table" icon="mdi-view-list" size="small" />
          <v-btn value="grid" icon="mdi-view-grid" size="small" />
        </v-btn-toggle>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" :to="Routes.ADMIN_PRODUCT_CREATE">
          Add Product
        </v-btn>
      </template>
    </AdminPageHeader>

    <AdminDataTable
      v-if="viewMode === 'table'"
      :headers="headers"
      :items="products"
      :loading="loading"
      :total="total"
      :total-pages="totalPages"
      :page="page"
      search-placeholder="Search products..."
      empty-message="No products yet. Add your first product to get started."
      @search="onSearch"
      @page-change="onPageChange"
    >
      <template #filters>
        <v-select v-model="filters.categoryId" :items="categoryOptions" item-title="name" item-value="id" label="Category" variant="outlined" density="compact" hide-details clearable class="filter-select" @update:model-value="loadProducts" />
        <v-select v-model="filters.status" :items="statusOptions" item-title="label" item-value="value" label="Status" variant="outlined" density="compact" hide-details clearable class="filter-select" @update:model-value="loadProducts" />
        <v-select v-model="filters.featured" :items="featuredOptions" item-title="label" item-value="value" label="Featured" variant="outlined" density="compact" hide-details clearable class="filter-select" @update:model-value="loadProducts" />
      </template>

      <template #[`item.image`]="{ item }">
        <v-avatar size="48" rounded="lg">
          <v-img :src="getProductImageUrl(item)" cover />
        </v-avatar>
      </template>

      <template #[`item.name`]="{ item }">
        <NuxtLink :to="Routes.ADMIN_PRODUCT_DETAIL(item.id)" class="ta-admin-products__link">
          {{ item.name }}
        </NuxtLink>
      </template>

      <template #[`item.cost_price`]="{ item }">{{ formatCurrency(item.cost_price) }}</template>
      <template #[`item.selling_price`]="{ item }">{{ formatCurrency(item.selling_price) }}</template>
      <template #[`item.profit`]="{ item }">{{ formatCurrency(calcProfit(item.selling_price, item.cost_price)) }}</template>
      <template #[`item.margin`]="{ item }">{{ calcProfitMargin(item.selling_price, item.cost_price) }}%</template>
      <template #[`item.stock`]="{ item }">
        <span :class="stockClass(item)">{{ item.stock }}</span>
      </template>
      <template #[`item.status`]="{ item }">
        <AdminStatusChip :status="item.status" :label-map="ProductStatusLabels" :color-map="ProductStatusColors" />
      </template>
      <template #[`item.actions`]="{ item }">
        <v-menu location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="menuProps" />
          </template>
          <v-list density="compact">
            <v-list-item :to="Routes.ADMIN_PRODUCT_DETAIL(item.id)" prepend-icon="mdi-eye-outline" title="View" />
            <v-list-item :to="Routes.ADMIN_PRODUCT_EDIT(item.id)" prepend-icon="mdi-pencil-outline" title="Edit" />
            <v-list-item prepend-icon="mdi-content-copy" title="Duplicate" @click="duplicateProduct(item)" />
            <v-list-item prepend-icon="mdi-delete-outline" title="Delete" class="text-error" @click="confirmDelete(item)" />
          </v-list>
        </v-menu>
      </template>
    </AdminDataTable>

    <!-- Grid View -->
    <div v-else>
      <v-card elevation="0" border rounded="lg" class="pa-4 mb-4">
        <div class="d-flex flex-wrap gap-3">
          <v-text-field v-model="searchQuery" placeholder="Search products..." prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details clearable class="flex-grow-1" style="max-width: 320px" @update:model-value="onSearch" />
        </div>
      </v-card>

      <div v-if="loading" class="text-center pa-8"><v-progress-circular indeterminate color="accent" /></div>
      <AppEmptyState v-else-if="!products.length" icon="mdi-hanger" title="No products yet" description="Start building your collection." action-label="Add Product" :action-to="Routes.ADMIN_PRODUCT_CREATE" />
      <div v-else class="ta-admin-products__grid">
        <AdminProductCard v-for="product in products" :key="product.id" :product="product" :to="Routes.ADMIN_PRODUCT_DETAIL(product.id)" />
      </div>
    </div>

    <AdminConfirmDialog
      v-model="deleteDialog"
      title="Delete Product"
      :message="`Are you sure you want to delete &quot;${productToDelete?.name}&quot;? This action cannot be undone.`"
      confirm-text="Delete"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { ProductStatusLabels, ProductStatusColors, ProductStatus } from '~/enums/productStatus.js'
import { formatCurrency } from '~/helpers/currency.js'
import { calcProfit, calcProfitMargin } from '~/helpers/profit.js'
import { getProductImageUrl } from '~/helpers/imageUrl.js'
import { CategoryService } from '~/services/CategoryService.js'
import { PaginationDefaults } from '~/constants/app.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_PRODUCTS })

const { products, total, loading, totalPages, fetchProducts, deleteProduct } = useProducts()

const viewMode = ref('table')
const page = ref(1)
const searchQuery = ref('')
const categories = ref([])
const deleteDialog = ref(false)
const productToDelete = ref(null)
const deleting = ref(false)

const filters = reactive({
  categoryId: null,
  status: null,
  featured: null,
})

const headers = [
  { title: '', key: 'image', sortable: false, width: 64 },
  { title: 'Product', key: 'name' },
  { title: 'SKU', key: 'sku' },
  { title: 'Category', key: 'categories.name' },
  { title: 'Cost', key: 'cost_price' },
  { title: 'Price', key: 'selling_price' },
  { title: 'Profit', key: 'profit', sortable: false },
  { title: 'Margin', key: 'margin', sortable: false },
  { title: 'Stock', key: 'stock' },
  { title: 'Status', key: 'status' },
  { title: '', key: 'actions', sortable: false, width: 48 },
]

const categoryOptions = computed(() => [{ id: null, name: 'All Categories' }, ...categories.value])
const statusOptions = [{ value: null, label: 'All Status' }, ...Object.entries(ProductStatusLabels).map(([value, label]) => ({ value, label }))]
const featuredOptions = [{ value: null, label: 'All' }, { value: true, label: 'Featured' }, { value: false, label: 'Not Featured' }]

const loadProducts = () => {
  fetchProducts({
    page: page.value,
    limit: PaginationDefaults.ADMIN_LIMIT,
    search: searchQuery.value,
    categoryId: filters.categoryId,
    status: filters.status || undefined,
    featured: filters.featured,
  })
}

const onSearch = (val) => { searchQuery.value = val; page.value = 1; loadProducts() }
const onPageChange = (p) => { page.value = p; loadProducts() }

const stockClass = (item) => ({
  'text-error': item.stock === 0,
  'text-warning': item.stock > 0 && item.stock <= 5,
})

const confirmDelete = (item) => { productToDelete.value = item; deleteDialog.value = true }

const handleDelete = async () => {
  deleting.value = true
  await deleteProduct(productToDelete.value.id)
  deleting.value = false
  deleteDialog.value = false
  loadProducts()
}

const duplicateProduct = (item) => {
  navigateTo({ path: Routes.ADMIN_PRODUCT_CREATE, query: { duplicate: item.id } })
}

onMounted(async () => {
  categories.value = await CategoryService.getAll()
  loadProducts()
})
</script>

<style scoped lang="scss">
.ta-admin-products {
  &__link {
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
    text-decoration: none;
    &:hover { color: var(--color-secondary); }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--spacing-md);
  }
}

.filter-select {
  max-width: 160px;
  min-width: 140px;
}
</style>
