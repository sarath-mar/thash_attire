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
            <div class="d-flex align-center gap-2 mb-2">
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
                class="flex-grow-1"
                hide-details
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.phone" />
                </template>
              </v-autocomplete>
              <v-btn color="primary" variant="tonal" height="48" @click="customerDialog = true">
                <v-icon icon="mdi-plus" class="mr-1" /> New
              </v-btn>
            </div>

            <v-expand-transition>
              <div v-if="selectedCustomer" class="ta-selected-customer mt-2">
                <v-icon icon="mdi-check-circle" color="success" size="20" class="mr-2" />
                <div>
                  <strong>{{ selectedCustomer.name }}</strong>
                  <span class="text-medium-emphasis ml-2">{{ selectedCustomer.phone }}</span>
                </div>
                <v-btn icon="mdi-close" size="small" variant="text" class="ml-auto" @click="clearCustomer" />
              </div>
            </v-expand-transition>
          </AdminFormSection>

          <!-- Order Type Selection -->
          <AdminFormSection title="2. Order Type">
            <v-btn-toggle v-model="orderType" color="primary" variant="outlined" mandatory class="mb-4">
              <v-btn value="normal">Normal Product</v-btn>
              <v-btn value="combo">Combo Offer</v-btn>
            </v-btn-toggle>

            <!-- Normal Product -->
            <template v-if="orderType === 'normal'">
              <v-autocomplete
                v-model="selectedProduct"
                :items="products"
                item-title="name"
                item-value="id"
                label="Search Product"
                variant="outlined"
                density="comfortable"
                return-object
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
                    <v-list-item-subtitle>{{ formatCurrency(item.raw.selling_price) }} (Stock: {{ item.raw.stock }})</v-list-item-subtitle>
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
                      <td>{{ form.product_name }}</td>
                      <td><v-text-field v-model.number="form.selling_price" type="number" density="compact" hide-details variant="outlined" /></td>
                      <td><v-text-field v-model.number="form.quantity" type="number" min="1" density="compact" hide-details variant="outlined" /></td>
                      <td><strong>{{ formatCurrency(form.selling_price * form.quantity) }}</strong></td>
                    </tr>
                  </tbody>
                </v-table>
              </v-expand-transition>
            </template>

            <!-- Combo Offer -->
            <template v-else>
              <v-autocomplete
                v-model="selectedOffer"
                :items="offers"
                item-title="name"
                item-value="id"
                label="Search Offer / Combo"
                variant="outlined"
                density="comfortable"
                return-object
                @update:model-value="onOfferSelect"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <span class="text-decoration-line-through mr-2">{{ formatCurrency(calcRegularTotal(item.raw.offer_items)) }}</span>
                      <strong class="text-primary">{{ formatCurrency(item.raw.offer_price) }}</strong>
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <v-expand-transition>
                <div v-if="selectedOffer">
                  <v-alert
                    v-if="outOfStockProducts.length > 0"
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="mb-4"
                  >
                    Cannot sell combo. The following products are out of stock: <strong>{{ outOfStockProducts.map(p => p.product?.name).join(', ') }}</strong>
                  </v-alert>

                  <v-table density="comfortable" class="border rounded-lg mb-2">
                    <thead>
                      <tr>
                        <th>Product in Combo</th>
                        <th style="width: 100px">Qty</th>
                        <th style="width: 120px">Allocated Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in selectedOffer.offer_items" :key="item.id">
                        <td>
                          {{ item.product?.name }}
                          <div class="text-caption" :class="item.product?.stock < item.quantity ? 'text-error' : 'text-medium-emphasis'">
                            Stock: {{ item.product?.stock }}
                          </div>
                        </td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ formatCurrency(allocatedComboPrices[index]) }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
              </v-expand-transition>
            </template>
          </AdminFormSection>

          <!-- Delivery -->
          <AdminFormSection title="3. Delivery & Dates" subtitle="Order date, timeline, and notes">
            <v-row dense>
              <v-col cols="12" md="6">
                <CommonAppDatePicker v-model="form.order_date" label="Order Date" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <CommonAppDatePicker v-model="form.expected_delivery" label="Expected Delivery Date" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12">
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

    <!-- New Customer Dialog -->
    <v-dialog v-model="customerDialog" max-width="500">
      <v-card>
        <v-card-title class="pa-4">Create New Customer</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-form ref="customerFormRef" @submit.prevent="saveCustomer">
            <v-text-field v-model="customerForm.name" label="Customer Name *" :rules="[v => !!v || 'Required']" variant="outlined" density="comfortable" class="mb-2" />
            <v-text-field v-model="customerForm.phone" label="Phone Number *" :rules="[v => !!v || 'Required']" variant="outlined" density="comfortable" class="mb-2" />
            <v-textarea v-model="customerForm.address" label="Address *" :rules="[v => !!v || 'Required']" variant="outlined" density="comfortable" rows="2" class="mb-2" />
            <v-text-field v-model="customerForm.pincode" label="Pincode *" :rules="[v => !!v || 'Required']" variant="outlined" density="comfortable" class="mb-2" />
            <CommonAppDatePicker v-model="customerForm.dob" label="Date of Birth (Optional)" variant="outlined" density="comfortable" class="mb-2" />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="customerDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingCustomer" @click="saveCustomer">Create Customer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import { OfferService } from '~/services/OfferService.js'
import { SalesService } from '~/services/SalesService.js'
import { useOffers } from '~/composables/useOffers.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_ORDER_CREATE })

const router = useRouter()
const { success, error: showError } = useSnackbar()
const { calcRegularTotal, allocateComboPrice } = useOffers()

const formRef = ref(null)
const valid = ref(false)
const saving = ref(false)
const orderType = ref('normal')

const customers = ref([])
const products = ref([])
const offers = ref([])

const selectedCustomer = ref(null)
const selectedProduct = ref(null)
const selectedOffer = ref(null)

const form = reactive({
  customer_id: null,
  product_id: null,
  product_name: '',
  quantity: 1,
  selling_price: 0,
  cost_price: 0,
  discount: 0,
  payment_method: PaymentMethod.UPI,
  payment_status: PaymentStatus.PENDING,
  order_status: OrderStatus.ORDER_RECEIVED,
  order_date: new Date().toISOString().split('T')[0],
  expected_delivery: '',
  shipping_address: '',
  notes: '',
})

const customerDialog = ref(false)
const customerFormRef = ref(null)
const savingCustomer = ref(false)
const customerForm = reactive({ name: '', phone: '', address: '', pincode: '', dob: '' })

const saveCustomer = async () => {
  const { valid } = await customerFormRef.value.validate()
  if (!valid) return
  savingCustomer.value = true
  
  try {
    // Basic check for duplicate phone in loaded list
    const existing = customers.value.find(c => c.phone === customerForm.phone)
    if (existing) {
      showError('A customer with this phone number already exists')
      savingCustomer.value = false
      return
    }

    const newCust = await CustomerService.create({
      name: customerForm.name,
      phone: customerForm.phone,
      address: `${customerForm.address} - ${customerForm.pincode}`
    })
    
    customers.value.push(newCust)
    customerDialog.value = false
    
    // Auto-select
    onCustomerSelect(newCust)
    
    // Reset
    customerForm.name = ''
    customerForm.phone = ''
    customerForm.address = ''
    customerForm.pincode = ''
    customerForm.dob = ''
    
    success('Customer created successfully')
  } catch (err) {
    if (err.message?.includes('duplicate key')) {
      showError('Phone number already exists in the system.')
    } else {
      showError(err.message || 'Failed to create customer')
    }
  } finally {
    savingCustomer.value = false
  }
}

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
    form.selling_price = product.selling_price
    form.cost_price = product.cost_price
    form.quantity = 1
  }
}

const onOfferSelect = (offer) => {
  // Clear any existing normal product selection when offer is selected
  form.product_id = null
  selectedProduct.value = null
}

const outOfStockProducts = computed(() => {
  if (!selectedOffer.value) return []
  return selectedOffer.value.offer_items.filter(item => (item.product?.stock || 0) < item.quantity)
})

const allocatedComboPrices = computed(() => {
  if (!selectedOffer.value) return []
  return allocateComboPrice(selectedOffer.value.offer_items, selectedOffer.value.offer_price)
})

const subtotal = computed(() => {
  if (orderType.value === 'normal') {
    return form.selling_price * form.quantity
  } else {
    return selectedOffer.value ? selectedOffer.value.offer_price : 0
  }
})

const totalAmount = computed(() => Math.max(0, subtotal.value - (form.discount || 0)))

const isFormReady = computed(() => {
  if (!form.customer_id) return false
  if (orderType.value === 'normal') {
    return form.product_id && form.quantity > 0
  } else {
    return selectedOffer.value && outOfStockProducts.value.length === 0
  }
})

const handleSubmit = async () => {
  if (!isFormReady.value) return
  saving.value = true
  
  try {
    const salePayload = {
      order_number: `ORD-${Date.now()}`,
      customer_id: form.customer_id,
      customer_name: selectedCustomer.value.name,
      offer_id: orderType.value === 'combo' ? selectedOffer.value.id : null,
      discount: form.discount,
      final_amount: totalAmount.value,
      payment_method: form.payment_method,
      payment_status: form.payment_status,
      status: form.order_status,
      order_date: form.order_date ? new Date(form.order_date).toISOString() : null,
      expected_delivery: form.expected_delivery || null,
      shipping_address: form.shipping_address,
      notes: form.notes
    }

    let itemsPayload = []
    
    if (orderType.value === 'normal') {
      itemsPayload = [{
        offer_id: null,
        product_id: form.product_id,
        product_name: form.product_name,
        quantity: form.quantity,
        selling_price: form.selling_price,
        cost_price: form.cost_price
      }]
    } else {
      itemsPayload = selectedOffer.value.offer_items.map((item, index) => ({
        offer_id: selectedOffer.value.id,
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        selling_price: allocatedComboPrices.value[index], // Allocated price for 1 unit
        cost_price: item.product.cost_price // Snapshot current material/product cost
      }))
    }

    await SalesService.create(salePayload, itemsPayload)
    success('Order created successfully')
    router.push(Routes.ADMIN_ORDERS)
  } catch (err) {
    showError(err.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const custRes = await CustomerService.getAll()
  customers.value = custRes.data || []
  
  const prodRes = await ProductService.getAll()
  products.value = (prodRes.data || []).filter(p => p.status === 'active')
  
  const offRes = await OfferService.getAll({ status: 'active' })
  offers.value = offRes.data || []
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
