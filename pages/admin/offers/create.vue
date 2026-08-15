<template>
  <div class="ta-admin-offer-create">
    <AdminPageHeader
      title="Create Offer"
      subtitle="Configure a new combo offer"
    />

    <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
      <div class="ta-admin-offer-create__layout">
        <div class="ta-admin-offer-create__main">
          
          <AdminFormSection title="Offer Details">
            <v-text-field
              v-model="form.name"
              label="Offer Name"
              variant="outlined"
              :rules="[requiredRule()]"
              placeholder="e.g. Two Dress Combo"
              class="mb-4"
            />
            <v-textarea
              v-model="form.description"
              label="Description (Optional)"
              variant="outlined"
              rows="3"
            />
          </AdminFormSection>

          <AdminFormSection title="Included Products" subtitle="Select products for this combo">
            <v-autocomplete
              :items="availableProducts"
              item-title="name"
              item-value="id"
              label="Add Product to Combo"
              variant="outlined"
              return-object
              clearable
              @update:model-value="addProduct"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ formatCurrency(item.raw.selling_price) }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>

            <v-table density="comfortable" class="border rounded-lg mb-4">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="width: 150px">Unit Price</th>
                  <th style="width: 120px">Qty</th>
                  <th style="width: 150px">Total</th>
                  <th style="width: 60px"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in items" :key="index">
                  <td>{{ item.product.name }}</td>
                  <td>{{ formatCurrency(item.product.selling_price) }}</td>
                  <td>
                    <v-text-field
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      density="compact"
                      hide-details
                      variant="outlined"
                    />
                  </td>
                  <td><strong>{{ formatCurrency(item.product.selling_price * item.quantity) }}</strong></td>
                  <td>
                    <v-btn icon="mdi-delete" color="error" variant="text" size="small" @click="removeItem(index)" />
                  </td>
                </tr>
                <tr v-if="items.length === 0">
                  <td colspan="5" class="text-center text-medium-emphasis py-4">No products added yet</td>
                </tr>
              </tbody>
            </v-table>
          </AdminFormSection>
        </div>

        <div class="ta-admin-offer-create__sidebar">
          <v-card elevation="0" border rounded="lg" class="pa-4 mb-4">
            <h3 class="text-subtitle-1 font-weight-semibold mb-3">Pricing</h3>
            
            <div class="d-flex justify-space-between mb-2">
              <span class="text-medium-emphasis">Regular Total</span>
              <span class="text-decoration-line-through">{{ formatCurrency(regularTotal) }}</span>
            </div>
            
            <v-text-field
              v-model.number="form.offer_price"
              label="Offer Price"
              type="number"
              variant="outlined"
              :rules="[requiredRule(), v => v > 0 || 'Must be greater than 0', v => v < regularTotal || 'Usually lower than regular total']"
              prefix="₹"
              class="mt-4"
            />

            <v-alert
              v-if="savings > 0"
              type="success"
              variant="tonal"
              density="compact"
              class="mt-2 text-body-2"
            >
              You Save: <strong>{{ formatCurrency(savings) }}</strong> ({{ savingsPercentage }}%)
            </v-alert>
          </v-card>

          <v-card elevation="0" border rounded="lg" class="pa-4 mb-4">
            <h3 class="text-subtitle-1 font-weight-semibold mb-3">Schedule</h3>
            <v-text-field
              v-model="form.start_date"
              type="date"
              label="Start Date (Optional)"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="form.end_date"
              type="date"
              label="End Date (Optional)"
              variant="outlined"
              density="comfortable"
              :min="form.start_date"
            />
          </v-card>

          <v-card elevation="0" border rounded="lg" class="pa-4 ta-sticky-sidebar">
            <v-switch
              v-model="form.status"
              true-value="active"
              false-value="inactive"
              :label="`Status: ${form.status === 'active' ? 'Active' : 'Inactive'}`"
              color="success"
              hide-details
              class="mb-4"
            />
            
            <v-btn color="primary" block size="large" type="submit" :loading="saving" :disabled="!isValid">
              Save Offer
            </v-btn>
          </v-card>
        </div>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { requiredRule } from '~/utils/validation.js'
import { formatCurrency } from '~/helpers/currency.js'
import { ProductService } from '~/services/ProductService.js'
import { useOffers } from '~/composables/useOffers.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const router = useRouter()
const { createOffer, calcRegularTotal, calcSavings, calcSavingsPercentage } = useOffers()

const formRef = ref(null)
const valid = ref(false)
const saving = ref(false)

const availableProducts = ref([])

const form = reactive({
  name: '',
  description: '',
  offer_price: 0,
  start_date: '',
  end_date: '',
  status: 'active'
})

const items = ref([])

const addProduct = (product) => {
  if (!product) return
  const exists = items.value.find(i => i.product_id === product.id)
  if (!exists) {
    items.value.push({ product_id: product.id, product, quantity: 1 })
  }
}

const removeItem = (index) => {
  items.value.splice(index, 1)
}

const regularTotal = computed(() => calcRegularTotal(items.value))
const savings = computed(() => calcSavings(regularTotal.value, form.offer_price))
const savingsPercentage = computed(() => calcSavingsPercentage(regularTotal.value, form.offer_price))

const isValid = computed(() => items.value.length >= 2 && form.offer_price > 0 && form.name)

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid || !isValid.value) return

  saving.value = true
  const offerData = {
    name: form.name,
    description: form.description,
    offer_type: 'COMBO',
    offer_price: form.offer_price,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    status: form.status
  }

  const itemsData = items.value.map(i => ({ product_id: i.product_id, quantity: i.quantity }))

  const res = await createOffer(offerData, itemsData)
  if (res) {
    router.push(Routes.ADMIN_OFFERS)
  }
  saving.value = false
}

onMounted(async () => {
  const prodRes = await ProductService.getAll({ limit: 1000 })
  availableProducts.value = (prodRes.data || []).filter(p => p.status === 'active')
})
</script>

<style scoped lang="scss">
.ta-admin-offer-create {
  &__layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: var(--spacing-lg);
    align-items: start;

    @include respond-below(lg) {
      grid-template-columns: 1fr;
    }
  }
}
.ta-sticky-sidebar {
  position: sticky;
  top: 80px;
}
</style>
