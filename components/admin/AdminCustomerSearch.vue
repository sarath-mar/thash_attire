<template>
  <div class="ta-customer-search">
    <v-text-field
      v-model="phone"
      label="Customer Phone"
      placeholder="Enter 10-digit phone number"
      prepend-inner-icon="mdi-phone-outline"
      variant="outlined"
      density="comfortable"
      :rules="phoneRules"
      maxlength="10"
      @update:model-value="onPhoneChange"
    />

    <v-progress-linear v-if="searching" indeterminate color="accent" class="mb-3" />

    <v-alert
      v-if="foundCustomer"
      type="success"
      variant="tonal"
      density="compact"
      class="ta-customer-search__found"
    >
      <div class="ta-customer-search__found-header">
        <strong>Customer Found</strong>
        <v-btn size="small" color="primary" variant="flat" @click="useCustomer">
          Use Customer
        </v-btn>
      </div>
      <p class="mb-1">{{ foundCustomer.name }}</p>
      <p class="mb-1 text-caption">{{ foundCustomer.phone }}</p>
      <p v-if="foundCustomer.total_orders" class="text-caption mb-0">
        {{ foundCustomer.total_orders }} previous order(s) · {{ formatCurrency(foundCustomer.total_amount) }} total
      </p>
    </v-alert>

    <v-alert
      v-else-if="phone.length === 10 && !searching && searched"
      type="info"
      variant="tonal"
      density="compact"
    >
      <div class="ta-customer-search__not-found">
        <span>No customer found with this number</span>
        <v-btn size="small" variant="outlined" @click="$emit('create-new', phone)">
          Create New Customer
        </v-btn>
      </div>
    </v-alert>
  </div>
</template>

<script setup>
import { CustomerService } from '~/services/CustomerService.js'
import { formatCurrency } from '~/helpers/currency.js'
import { debounceRef } from '~/helpers/debounce.js'

const emit = defineEmits(['select', 'create-new'])

const phone = ref('')
const foundCustomer = ref(null)
const searching = ref(false)
const searched = ref(false)

const phoneRules = [(v) => !v || /^\d{10}$/.test(v) || 'Enter a valid 10-digit phone number']

const searchCustomer = async (value) => {
  searched.value = false
  foundCustomer.value = null
  if (!value || value.length !== 10) return

  searching.value = true
  try {
    const result = await CustomerService.getAll({ search: value, limit: 5 })
    foundCustomer.value = result.data.find(c => c.phone === value) || null
  } finally {
    searching.value = false
    searched.value = true
  }
}

const onPhoneChange = debounceRef(searchCustomer, 400)

const useCustomer = () => {
  if (foundCustomer.value) emit('select', foundCustomer.value)
}
</script>

<style scoped lang="scss">
.ta-customer-search {
  &__found-header,
  &__not-found {
    @include flex-between;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    margin-bottom: var(--spacing-xs);
  }
}
</style>
