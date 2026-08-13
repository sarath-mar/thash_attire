<template>
  <div class="ta-admin-product-detail">
    <AppLoading v-if="loading" />

    <template v-else-if="product">
      <AdminPageHeader :title="product.name" :subtitle="product.sku">
        <template #actions>
          <v-btn variant="outlined" prepend-icon="mdi-content-copy" @click="duplicate">Duplicate</v-btn>
          <v-btn variant="outlined" color="warning" prepend-icon="mdi-pause-circle-outline" @click="toggleStatus">
            {{ product.status === ProductStatus.ACTIVE ? 'Deactivate' : 'Activate' }}
          </v-btn>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-pencil-outline" :to="Routes.ADMIN_PRODUCT_EDIT(product.id)">
            Edit Product
          </v-btn>
        </template>
      </AdminPageHeader>

      <div class="ta-admin-product-detail__layout">
        <!-- Left: Images -->
        <div class="ta-admin-product-detail__gallery">
          <v-card elevation="0" border rounded="lg" class="ta-admin-product-detail__main-image">
            <v-img :src="activeImage" aspect-ratio="3/4" cover />
          </v-card>
          <div v-if="product.images?.length > 1" class="ta-admin-product-detail__thumbs">
            <button
              v-for="(img, idx) in product.images"
              :key="idx"
              class="ta-admin-product-detail__thumb"
              :class="{ 'ta-admin-product-detail__thumb--active': activeImage === img }"
              @click="activeImage = img"
            >
              <img :src="img" :alt="`Image ${idx + 1}`" />
            </button>
          </div>
          <AdminVideoUpload v-if="product.videos?.length" :model-value="product.videos[0]" label="Product Video" />
        </div>

        <!-- Right: Info -->
        <div class="ta-admin-product-detail__info">
          <v-card elevation="0" border rounded="lg" class="pa-4 mb-4">
            <div class="d-flex align-center gap-2 mb-3">
              <AdminStatusChip :status="product.status" :label-map="ProductStatusLabels" :color-map="ProductStatusColors" />
              <v-chip v-if="product.is_featured" size="small" color="accent" label>Featured</v-chip>
            </div>
            <p class="text-caption text-medium-emphasis mb-1">Category</p>
            <p class="mb-3">{{ product.categories?.name || '—' }}</p>

            <v-row dense>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Selling Price</p>
                <p class="text-h6">{{ formatCurrency(product.selling_price) }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Cost</p>
                <p class="text-h6">{{ formatCurrency(product.cost_price) }}</p>
              </v-col>
            </v-row>

            <AdminProfitSummary
              :selling-price="product.selling_price"
              :total-cost="product.cost_price"
              :target-margin="details.target_margin"
              class="mt-4"
            />
          </v-card>

          <v-card elevation="0" border rounded="lg" class="pa-4 mb-4">
            <h3 class="text-subtitle-1 font-weight-semibold mb-2">Inventory</h3>
            <v-row dense>
              <v-col cols="4"><p class="text-caption">Stock</p><strong>{{ product.stock }}</strong></v-col>
              <v-col cols="4"><p class="text-caption">Low Stock At</p><strong>{{ details.low_stock_threshold }}</strong></v-col>
              <v-col cols="4"><p class="text-caption">Status</p><AdminStatusChip :status="stockStatus" :label-map="StockStatusLabels" :color-map="StockStatusColors" /></v-col>
            </v-row>
          </v-card>
        </div>
      </div>

      <!-- Description -->
      <AdminFormSection title="Description" class="mt-4">
        <p class="ta-admin-product-detail__description">{{ product.description }}</p>
      </AdminFormSection>

      <!-- Materials -->
      <AdminFormSection title="Materials" subtitle="Materials required per unit">
        <v-table density="compact">
          <thead><tr><th>Material</th><th>Quantity</th><th>Unit</th><th>Unit Cost</th><th>Total</th></tr></thead>
          <tbody>
            <tr v-for="mat in details.materials" :key="mat.material_id">
              <td>{{ mat.name }}</td>
              <td>{{ mat.quantity }}</td>
              <td>{{ mat.unit }}</td>
              <td>{{ formatCurrency(mat.unit_cost) }}</td>
              <td><strong>{{ formatCurrency(calcMaterialLineCost(mat.quantity, mat.unit_cost)) }}</strong></td>
            </tr>
          </tbody>
        </v-table>
      </AdminFormSection>

      <!-- Cost Breakdown -->
      <AdminFormSection title="Cost Breakdown">
        <div class="ta-admin-product-detail__costs">
          <div v-for="item in costItems" :key="item.label" class="ta-admin-product-detail__cost-row">
            <span>{{ item.label }}</span><span>{{ formatCurrency(item.value) }}</span>
          </div>
          <v-divider class="my-2" />
          <div class="ta-admin-product-detail__cost-row ta-admin-product-detail__cost-row--total">
            <span>Total Product Cost</span><strong>{{ formatCurrency(product.cost_price) }}</strong>
          </div>
        </div>
      </AdminFormSection>
    </template>
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { ProductStatus, ProductStatusLabels, ProductStatusColors } from '~/enums/productStatus.js'
import { StockStatusLabels, StockStatusColors } from '~/enums/stockStatus.js'
import { formatCurrency } from '~/helpers/currency.js'
import { calcMaterialLineCost } from '~/helpers/profit.js'
const getProductDetails = (id) => ({
  target_margin: 40,
  low_stock_threshold: 5,
  materials: [],
  stitching_cost: 1500,
  packaging_cost: 200,
  other_cost: 0,
})
import { getProductImageUrl } from '~/helpers/imageUrl.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const productId = route.params.id

useHead({ title: PageTitles.ADMIN_PRODUCT_DETAIL })

const { product, loading, fetchProduct, updateProduct } = useProducts()

const activeImage = ref('')
const details = computed(() => getProductDetails(product.value?.id))

const stockStatus = computed(() => {
  if (!product.value) return 'in_stock'
  if (product.value.stock === 0) return 'out_of_stock'
  if (product.value.stock <= (details.value.low_stock_threshold || 5)) return 'low_stock'
  return 'in_stock'
})

const costItems = computed(() => {
  const d = details.value
  const matCost = (d.materials || []).reduce((s, m) => s + calcMaterialLineCost(m.quantity, m.unit_cost), 0)
  return [
    { label: 'Material Cost', value: matCost },
    { label: 'Stitching Cost', value: d.stitching_cost || 0 },
    { label: 'Packaging Cost', value: d.packaging_cost || 0 },
    { label: 'Other Cost', value: d.other_cost || 0 },
  ]
})

const duplicate = () => router.push({ path: Routes.ADMIN_PRODUCT_CREATE, query: { duplicate: productId } })

const toggleStatus = async () => {
  const newStatus = product.value.status === ProductStatus.ACTIVE ? ProductStatus.INACTIVE : ProductStatus.ACTIVE
  await updateProduct(productId, { status: newStatus })
}

watch(product, (p) => {
  if (p) activeImage.value = getProductImageUrl(p)
}, { immediate: true })

onMounted(() => fetchProduct(productId))
</script>

<style scoped lang="scss">
.ta-admin-product-detail {
  &__layout {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: var(--spacing-lg);
    align-items: start;

    @include respond-below(lg) { grid-template-columns: 1fr; }
  }

  &__main-image { overflow: hidden; }

  &__thumbs {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
    flex-wrap: wrap;
  }

  &__thumb {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 2px solid transparent;
    padding: 0;
    cursor: pointer;

    &--active { border-color: var(--color-accent); }

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  &__description {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    line-height: $line-height-relaxed;
    margin: 0;
  }

  &__costs {
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
  }

  &__cost-row {
    @include flex-between;
    font-size: $font-size-sm;
    padding: var(--spacing-xs) 0;

    &--total strong { color: var(--color-secondary); font-size: $font-size-lg; }
  }
}
</style>
