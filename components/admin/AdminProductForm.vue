<template>
  <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
    <!-- Basic Information -->
    <AdminFormSection title="Basic Information" subtitle="Product name, category and status">
      <v-row dense>
        <v-col cols="12" md="8">
          <v-text-field v-model="form.name" label="Product Name *" variant="outlined" density="comfortable" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.sku" label="SKU *" variant="outlined" density="comfortable" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="form.category_id"
            :items="categories"
            item-title="name"
            item-value="id"
            label="Category *"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="form.status"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="form.description" label="Description" variant="outlined" density="comfortable" rows="3" />
        </v-col>
      </v-row>
    </AdminFormSection>

    <!-- Media -->
    <AdminFormSection title="Product Media" subtitle="Images and optional video">
      <v-row dense>
        <v-col cols="12">
          <AdminImageUpload v-model="form.images" label="Product Images" :max-images="8" />
        </v-col>
        <v-col cols="12">
          <AdminVideoUpload v-model="form.video" label="Product Video (optional)" />
        </v-col>
      </v-row>
    </AdminFormSection>

    <!-- Materials -->
    <AdminFormSection title="Materials" subtitle="Raw materials required per product">
      <template #header-actions>
        <v-btn size="small" prepend-icon="mdi-plus" variant="outlined" @click="addMaterialRow">
          Add Material
        </v-btn>
      </template>

      <v-table density="compact" class="ta-product-form__materials-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Qty Required</th>
            <th>Unit</th>
            <th>Unit Cost</th>
            <th>Available</th>
            <th>Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in form.materials" :key="idx">
            <td>
              <v-autocomplete
                v-model="row.material_id"
                :items="productMaterials"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="compact"
                hide-details
                placeholder="Select material"
                @update:model-value="onMaterialSelect(row, $event)"
              />
            </td>
            <td>
              <v-text-field v-model.number="row.quantity" type="number" min="0" step="0.1" variant="outlined" density="compact" hide-details />
            </td>
            <td>{{ row.unit || '—' }}</td>
            <td>{{ formatCurrency(row.unit_cost) }}</td>
            <td>
              <span :class="{ 'text-warning': row.available_stock <= row.quantity }">
                {{ row.available_stock ?? '—' }}
              </span>
            </td>
            <td><strong>{{ formatCurrency(lineCost(row)) }}</strong></td>
            <td>
              <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="form.materials.splice(idx, 1)" />
            </td>
          </tr>
        </tbody>
        <tfoot v-if="form.materials.length">
          <tr>
            <td colspan="5" class="text-right"><strong>Material Cost</strong></td>
            <td colspan="2"><strong>{{ formatCurrency(materialCost) }}</strong></td>
          </tr>
        </tfoot>
      </v-table>
    </AdminFormSection>

    <!-- Production Costs -->
    <AdminFormSection title="Production Costs" subtitle="Stitching, packaging and other costs">
      <v-row dense>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="form.stitching_cost" label="Stitching Cost" type="number" prefix="₹" variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="form.packaging_cost" label="Packaging / Common Cost" type="number" prefix="₹" variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="form.other_cost" label="Other Product Cost" type="number" prefix="₹" variant="outlined" density="comfortable" />
        </v-col>
      </v-row>

      <div class="ta-product-form__cost-breakdown">
        <div v-for="item in costBreakdown" :key="item.label" class="ta-product-form__cost-row">
          <span>{{ item.label }}</span>
          <span>{{ formatCurrency(item.value) }}</span>
        </div>
        <v-divider class="my-2" />
        <div class="ta-product-form__cost-row ta-product-form__cost-row--total">
          <span>Total Product Cost</span>
          <strong>{{ formatCurrency(totalCost) }}</strong>
        </div>
      </div>
    </AdminFormSection>

    <!-- Initial Showcase Sample -->
    <AdminFormSection v-if="!initialData.initial_sample_created" title="Initial Showcase Sample" subtitle="First physical piece production">
      <v-row dense>
        <v-col cols="12">
          <v-checkbox v-model="form.createInitialShowcaseSample" label="Create Initial Showcase Sample" color="primary" hide-details class="mb-2" />
        </v-col>
        <template v-if="form.createInitialShowcaseSample">
          <v-col cols="12" md="6">
            <v-text-field v-model.number="form.showcaseStitchingCost" label="Showcase Stitching Cost" type="number" prefix="₹" variant="outlined" density="comfortable" hint="Stitching cost for the initial showcase piece (materials are the same as regular production)" persistent-hint />
          </v-col>
        </template>
      </v-row>
    </AdminFormSection>
    <AdminFormSection v-else title="Initial Showcase Sample" subtitle="First physical piece production">
      <v-alert type="info" variant="tonal" class="mb-0">
        Initial Showcase Sample has already been created for this product.
      </v-alert>
    </AdminFormSection>

    <!-- Pricing -->
    <AdminFormSection title="Pricing & Profit" subtitle="Selling price and margin analysis">
      <v-row dense>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="form.selling_price" label="Selling Price *" type="number" prefix="₹" variant="outlined" density="comfortable" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="form.target_margin" label="Target Profit Margin (%)" type="number" suffix="%" variant="outlined" density="comfortable" />
        </v-col>
      </v-row>
      <AdminProfitSummary
        :selling-price="form.selling_price"
        :total-cost="totalCost"
        :target-margin="form.target_margin"
      />
    </AdminFormSection>

    <!-- Inventory -->
    <AdminFormSection title="Inventory" subtitle="Stock levels and thresholds">
      <v-row dense>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="form.stock" label="Current Stock" type="number" variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="form.low_stock_threshold" label="Low Stock Threshold" type="number" variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            :model-value="stockStatus"
            :items="[{ title: 'In Stock', value: 'in_stock' }, { title: 'Low Stock', value: 'low_stock' }, { title: 'Out of Stock', value: 'out_of_stock' }]"
            label="Stock Status"
            variant="outlined"
            density="comfortable"
            readonly
          />
        </v-col>
      </v-row>
    </AdminFormSection>

    <!-- Publishing -->
    <AdminFormSection title="Publishing" subtitle="Visibility and availability settings">
      <v-row dense>
        <v-col cols="12" md="4">
          <v-switch v-model="form.is_showcase" label="Showcase Model (Hidden from public)" color="warning" hide-details />
        </v-col>
        <v-col cols="12" md="4">
          <v-switch v-model="form.is_featured" label="Featured Product" color="accent" hide-details />
        </v-col>
        <v-col cols="12" md="4">
          <v-switch v-model="form.is_trending" label="Trending Product" color="accent" hide-details />
        </v-col>
      </v-row>
    </AdminFormSection>

    <!-- Actions -->
    <div class="ta-product-form__actions">
      <v-btn variant="text" :disabled="saving" @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="primary" variant="flat" type="submit" :loading="saving" :disabled="!valid">
        {{ submitLabel }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { ProductStatus, ProductStatusLabels } from '~/enums/productStatus.js'
import { MaterialType } from '~/enums/materialType.js'
import { formatCurrency } from '~/helpers/currency.js'
import { calcMaterialLineCost } from '~/helpers/profit.js'
import { MaterialService } from '~/services/MaterialService.js'
import { CategoryService } from '~/services/CategoryService.js'

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  saving: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Save Product' },
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)
const valid = ref(false)
const categories = ref([])
const productMaterials = ref([])

const defaultForm = () => ({
  name: '',
  sku: '',
  category_id: null,
  description: '',
  status: ProductStatus.ACTIVE,
  images: [],
  video: null,
  materials: [],
  stitching_cost: 0,
  packaging_cost: 35,
  other_cost: 0,
  selling_price: 0,
  target_margin: 40,
  stock: 0,
  low_stock_threshold: 5,
  is_featured: false,
  is_trending: false,
  is_showcase: true,
  initial_sample_created: false,
  createInitialShowcaseSample: true,
  showcaseStitchingCost: 0,
})

const form = reactive({ ...defaultForm(), ...props.initialData })

const rules = { required: v => !!v || 'Required' }

const statusOptions = Object.entries(ProductStatusLabels).map(([value, label]) => ({ value, label }))

const lineCost = (row) => calcMaterialLineCost(row.quantity, row.unit_cost)

const materialCost = computed(() =>
  form.materials.reduce((sum, row) => sum + lineCost(row), 0),
)

const totalCost = computed(() =>
  materialCost.value + (form.stitching_cost || 0) + (form.packaging_cost || 0) + (form.other_cost || 0),
)

const costBreakdown = computed(() => [
  { label: 'Material Cost', value: materialCost.value },
  { label: 'Stitching Cost', value: form.stitching_cost || 0 },
  { label: 'Packaging Cost', value: form.packaging_cost || 0 },
  { label: 'Other Cost', value: form.other_cost || 0 },
])

const stockStatus = computed(() => {
  if (form.stock === 0) return 'out_of_stock'
  if (form.stock <= (form.low_stock_threshold || 5)) return 'low_stock'
  return 'in_stock'
})

function addMaterialRow() {
  form.materials.push({ material_id: null, name: '', quantity: 1, unit: '', unit_cost: 0, available_stock: 0 })
}

function onMaterialSelect(row, materialId) {
  const mat = productMaterials.value.find(m => m.id === materialId)
  if (mat) {
    row.name = mat.name
    row.unit = mat.unit
    row.unit_cost = mat.avg_unit_cost
    row.available_stock = mat.current_stock
  }
}

async function handleSubmit() {
  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return
  emit('submit', {
    ...form,
    cost_price: totalCost.value,
    videos: form.video ? [form.video] : [],
  })
}

onMounted(async () => {
  categories.value = await CategoryService.getAll()
  productMaterials.value = await MaterialService.getAll('', MaterialType.PRODUCT)
  if (!form.materials.length && props.initialData.materials?.length) {
    form.materials = [...props.initialData.materials]
  }
})
</script>

<style scoped lang="scss">
.ta-product-form {
  &__materials-table {
    font-size: $font-size-sm;

    :deep(th) {
      font-size: $font-size-xs !important;
      text-transform: uppercase;
      letter-spacing: $letter-spacing-wider;
    }
  }

  &__cost-breakdown {
    margin-top: var(--spacing-md);
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
  }

  &__cost-row {
    @include flex-between;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    padding: var(--spacing-xs) 0;

    &--total {
      font-size: $font-size-base;
      color: var(--color-text-primary);

      strong {
        color: var(--color-secondary);
        font-size: $font-size-lg;
      }
    }
  }

  &__actions {
    @include flex-between;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) 0;
    position: sticky;
    bottom: 0;
    background: var(--color-bg);
    border-top: 1px solid var(--color-border);
    margin-top: var(--spacing-md);
    z-index: 10;
  }
}
</style>
