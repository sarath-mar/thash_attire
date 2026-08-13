<template>
  <div class="ta-admin-expenses">
    <AdminPageHeader
      title="Expenses"
      subtitle="Track your business expenses and operational costs."
    >
      <template #actions>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="dialog = true">
          Add Expense
        </v-btn>
      </template>
    </AdminPageHeader>

    <div class="ta-admin-expenses__summary mb-4">
      <v-row dense>
        <v-col cols="12" md="4">
          <v-card elevation="0" border rounded="lg" class="pa-4 text-center">
            <span class="text-caption text-medium-emphasis text-uppercase d-block mb-1">Today's Expenses</span>
            <strong class="text-h6 text-error">{{ formatCurrency(summary.today) }}</strong>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="0" border rounded="lg" class="pa-4 text-center">
            <span class="text-caption text-medium-emphasis text-uppercase d-block mb-1">This Month</span>
            <strong class="text-h6 text-error">{{ formatCurrency(summary.month) }}</strong>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="0" border rounded="lg" class="pa-4 text-center">
            <span class="text-caption text-medium-emphasis text-uppercase d-block mb-1">Total Expenses</span>
            <strong class="text-h6 text-error">{{ formatCurrency(summary.total) }}</strong>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <AdminDataTable
      :headers="headers"
      :items="filteredExpenses"
      :loading="loading"
      search-placeholder="Search description..."
      @search="searchQuery = $event"
    >
      <template #filters>
        <v-select
          v-model="filterCategory"
          :items="['All', 'Material Purchase', 'Courier', 'Packaging', 'Marketing', 'Other']"
          variant="outlined"
          density="compact"
          hide-details
          class="mr-2"
          style="max-width: 200px"
        />
      </template>

      <template #[`item.date`]="{ item }">
        {{ formatDate(item.date) }}
      </template>

      <template #[`item.amount`]="{ item }">
        <strong>{{ formatCurrency(item.amount) }}</strong>
      </template>

      <template #[`item.category`]="{ item }">
        <v-chip size="x-small" label>{{ item.category }}</v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-btn icon="mdi-pencil-outline" size="small" variant="text" />
        <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" />
      </template>
    </AdminDataTable>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="pa-4">Add Expense</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-form ref="formRef" @submit.prevent="saveExpense">
            <v-text-field v-model="form.date" type="date" label="Date" variant="outlined" density="comfortable" class="mb-2" />
            <v-select v-model="form.category" :items="['Material Purchase', 'Courier', 'Packaging', 'Marketing', 'Other']" label="Category" variant="outlined" density="comfortable" class="mb-2" />
            <v-text-field v-model.number="form.amount" type="number" label="Amount" prefix="₹" variant="outlined" density="comfortable" class="mb-2" />
            <v-textarea v-model="form.description" label="Description" variant="outlined" density="comfortable" rows="2" class="mb-2" />
            <v-textarea v-model="form.notes" label="Notes (optional)" variant="outlined" density="comfortable" rows="2" />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveExpense">Save Expense</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { formatCurrency } from '~/helpers/currency.js'
import { formatDate } from '~/helpers/date.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_EXPENSES || 'Expenses' })

const loading = ref(true)
const expenses = ref([])
const searchQuery = ref('')
const filterCategory = ref('All')

const dialog = ref(false)
const form = reactive({ date: new Date().toISOString().split('T')[0], category: 'Other', amount: 0, description: '', notes: '' })

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Category', key: 'category' },
  { title: 'Description', key: 'description' },
  { title: 'Amount', key: 'amount' },
  { title: '', key: 'actions', sortable: false, width: 80 },
]

const summary = reactive({ today: 0, month: 0, total: 0 })

const filteredExpenses = computed(() => {
  let result = expenses.value
  if (filterCategory.value !== 'All') result = result.filter(e => e.category === filterCategory.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e => e.description.toLowerCase().includes(q))
  }
  return result
})

const saveExpense = () => {
  if (form.amount <= 0 || !form.description) return
  const newExpense = {
    id: `exp-${Date.now()}`,
    ...form,
  }
  expenses.value.unshift(newExpense)
  summary.total += form.amount
  dialog.value = false
}

onMounted(() => {
  // Mock data for expenses
  expenses.value = [
    { id: '1', date: new Date().toISOString(), category: 'Courier', description: 'Delhivery Shipping', amount: 450 },
    { id: '2', date: new Date().toISOString(), category: 'Material Purchase', description: 'Lace and Buttons', amount: 1200 },
    { id: '3', date: new Date(Date.now() - 86400000).toISOString(), category: 'Marketing', description: 'Instagram Ads', amount: 2000 },
  ]
  summary.today = 1650
  summary.month = 3650
  summary.total = 12500
  loading.value = false
})
</script>
