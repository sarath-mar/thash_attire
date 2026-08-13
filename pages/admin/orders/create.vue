<template>
  <div class="ta-admin-order-create">
    <AdminPageHeader
      title="Create Order"
      subtitle="Record a new customer order."
    />

    <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
      <div class="ta-admin-order-create__layout">
        <div class="ta-admin-order-create__main">
          <!-- Customer Selection -->
          <AdminFormSection title="1. Customer" subtitle="Search by phone number or create new">
            <v-autocomplete
              v-model="form.customer_id"
              :items="customers"
              item-title="name"
              item-value="id"
              label="Search Customer (Phone or Name)"
              variant="outlined"
              density="comfortable"
              :custom-filter="customerFilter"
              return-object
              @update:model-value="onCustomerSelect"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.phone" />
              </template>
              <template #append-inner>
                <v-btn size="small" variant="text" color="primary" @click.stop="newCustomerDialog = true">
                  + New
                </v-btn>
              </template>
            </v-autocomplete>

            <v-expand-transition>
              <div v-if="selectedCustomer" class="ta-selected-customer mt-2">
                <v-icon icon="mdi-check-circle" color="success" size="20" class="mr-2" />
                <div>
                  <strong>{{ selectedCustomer.name }}</strong>
                  <span class="text-medium-emphasis ml-2">{{ selectedCustomer.phone }}</span>
                  <div v-if="selectedCustomer.total_orders" class="text-caption text-medium-emphasis">
                    Previous Orders: {{ selectedCustomer.total_orders }}
                  </div>
                </div>
                <v-btn icon="mdi-close" size="small" variant="text" class="ml-auto" @click="clearCustomer" />
              </div>
            </v-expand-transition>
          </AdminFormSection>

          <!-- Product Selection -->
          <AdminFormSection title="2. Products" subtitle="Select product and quantity">
            <v-autocomplete
              v-model="selectedProduct"
              :items="products"
              item-title="name"
              item-value="id"
              label="Search Product"
              variant="outlined"
              density="comfortable"
              return-object
              class="mb-4"
              @update:model-value="onProductSelect"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-avatar size="32" rounded class="mr-3">
                      <v-img :src="getProductImageUrl(item.raw)" cover />
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.sku }} — {{ formatCurrency(item.raw.selling_price) }} (Stock: {{ item.raw.stock }})</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>

            <v-expand-transition>
              <v-table v-if="form.product_id" density="comfortable" class="border rounded-lg mb-2">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="width: 120px">Price</th>
                    <th style="width: 100px">Qty</th>
                    <th style="width: 120px">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="d-flex align-center">
                        <v-avatar size="40" rounded class="mr-3"><v-img :src="selectedProductImageUrl" cover /></v-avatar>
                        <div>
                          <div class="font-weight-medium">{{ form.product_name }}</div>
                          <div class="text-caption text-medium-emphasis">{{ form.product_sku }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <v-text-field v-model.number="form.selling_price" type="number" density="compact" hide-details variant="outlined" />
                    </td>
                    <td>
                      <v-text-field v-model.number="form.quantity" type="number" min="1" density="compact" hide-details variant="outlined" />
                    </td>
                    <td><strong>{{ formatCurrency(form.selling_price * form.quantity) }}</strong></td>
                  </tr>
                </tbody>
              </v-table>
            </v-expand-transition>
          </AdminFormSection>

          <!-- Delivery -->
          <AdminFormSection title="3. Delivery" subtitle="Delivery timeline and notes">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.expected_delivery" type="date" label="Expected Delivery Date" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.shipping_address" label="Shipping Address (if different)" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.notes" label="Order Notes (e.g., custom measurements)" rows="2" variant="outlined" density="comfortable" />
              </v-col>
            </v-row>
          </AdminFormSection>
        </div>

        <div class="ta-admin-order-create__sidebar">
          <!-- Payment Selection -->
          <v-card elevation="0" border rounded="lg" class="pa-4 mb-4">
            <h3 class="text-subtitle-1 font-weight-semibold mb-3">4. Payment</h3>
            <v-select
              v-model="form.payment_method"
              :items="paymentMethodOptions"
              item-title="label"
              item-value="value"
              label="Payment Method"
              variant="outlined"
              density="comfortable"
            />
            <v-select
              v-model="form.payment_status"
              :items="paymentStatusOptions"
              item-title="label"
              item-value="value"
              label="Payment Status"
              variant="outlined"
              density="comfortable"
            />
          </v-card>

          <!-- Order Summary -->
          <v-card elevation="0" border rounded="lg" class="pa-4 ta-order-summary-sticky">
            <h3 class="text-subtitle-1 font-weight-semibold mb-4">Order Summary</h3>
            <div class="d-flex justify-space-between mb-2 text-body-2">
              <span class="text-medium-emphasis">Subtotal</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2 text-body-2">
              <span class="text-medium-emphasis">Discount</span>
              <v-text-field v-model.number="form.discount" type="number" density="compact" hide-details variant="underlined" style="max-width: 80px" class="pt-0 mt-0" />
            </div>
            <v-divider class="my-3" />
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="font-weight-semibold">Total</span>
              <span class="text-h6 text-primary">{{ formatCurrency(totalAmount) }}</span>
            </div>

            <v-btn color="primary" block size="large" type="submit" :loading="saving" :disabled="!isFormReady">
              Create Order
            </v-btn>
            <v-btn variant="text" block class="mt-2" @click="router.push(Routes.ADMIN_ORDERS)">
              Cancel
            </v-btn>
          </v-card>
        </div>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { formatCurrency } from '~/helpers/currency.js'
import { getProductImageUrl } from '~/helpers/imageUrl.js'
import { PaymentStatus, PaymentStatusLabels, PaymentMethod, PaymentMethodLabels } from '~/enums/paymentStatus.js'
import { OrderStatus } from '~/enums/orderStatus.js'
import { CustomerService } from '~/services/CustomerService.js'
import { ProductService } from '~/services/ProductService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_ORDER_CREATE })

const router = useRouter()

const formRef = ref(null)
const valid = ref(false)
const saving = ref(false)

const customers = ref([])
const products = ref([])
const selectedCustomer = ref(null)
const selectedProduct = ref(null)

const newCustomerDialog = ref(false)

const form = reactive({
  customer_id: null,
  product_id: null,
  product_name: '',
  product_sku: '',
  quantity: 1,
  selling_price: 0,
  discount: 0,
  payment_method: PaymentMethod.UPI,
  payment_status: PaymentStatus.PENDING,
  order_status: OrderStatus.ORDER_RECEIVED,
  expected_delivery: '',
  shipping_address: '',
  notes: '',
})

const paymentMethodOptions = Object.entries(PaymentMethodLabels).map(([value, label]) => ({ value, label }))
const paymentStatusOptions = Object.entries(PaymentStatusLabels).map(([value, label]) => ({ value, label }))

const customerFilter = (item, queryText) => {
  const q = queryText.toLowerCase()
  return item.raw.name.toLowerCase().includes(q) || item.raw.phone.includes(q)
}

const onCustomerSelect = (customer) => {
  if (customer) {
    selectedCustomer.value = customer
    form.customer_id = customer.id
    if (!form.shipping_address) form.shipping_address = customer.address
  }
}

const clearCustomer = () => {
  selectedCustomer.value = null
  form.customer_id = null
  form.shipping_address = ''
}

const onProductSelect = (product) => {
  if (product) {
    form.product_id = product.id
    form.product_name = product.name
    form.product_sku = product.sku
    form.selling_price = product.selling_price
    form.quantity = 1
  }
}

const selectedProductImageUrl = computed(() => selectedProduct.value ? getProductImageUrl(selectedProduct.value) : '')
const subtotal = computed(() => form.selling_price * form.quantity)
const totalAmount = computed(() => Math.max(0, subtotal.value - (form.discount || 0)))

const isFormReady = computed(() => form.customer_id && form.product_id && form.quantity > 0)

const handleSubmit = async () => {
  if (!isFormReady.value) return
  saving.value = true
  
  // In a real app, this goes to an OrderService to create the order.
  // For mock, we'll just redirect to the orders list.
  setTimeout(() => {
    saving.value = false
    router.push(Routes.ADMIN_ORDERS)
  }, 600)
}

onMounted(async () => {
  const custRes = await CustomerService.getAll()
  customers.value = custRes.data || []
  const prodRes = await ProductService.getAll()
  products.value = (prodRes.data || []).filter(p => p.status === 'active')
})
</script>

<style scoped lang="scss">
.ta-admin-order-create {
  &__layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: var(--spacing-lg);
    align-items: start;

    @include respond-below(lg) {
      grid-template-columns: 1fr;
    }
  }

  &__sidebar {
    position: relative;
  }
}

.ta-selected-customer {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.ta-order-summary-sticky {
  position: sticky;
  top: 80px;
}
</style>
