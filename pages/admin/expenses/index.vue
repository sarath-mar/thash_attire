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
        <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="handleDelete(item.id)" />
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
import { useExpenses } from '~/composables/useExpenses.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_EXPENSES || 'Expenses' })

const { expenses, loading, saving, fetchExpenses, createExpense, deleteExpense } = useExpenses()
const searchQuery = ref('')
const filterCategory = ref('All')

const dialog = ref(false)
const formRef = ref(null)
const form = reactive({ date: new Date().toISOString().split('T')[0], category: 'Other', amount: 0, description: '', notes: '' })

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Category', key: 'category' },
  { title: 'Description', key: 'description' },
  { title: 'Amount', key: 'amount' },
  { title: '', key: 'actions', sortable: false, width: 80 },
]

const summary = computed(() => {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  let today = 0
  let month = 0
  let total = 0
  
  expenses.value.forEach(e => {
    const amt = Number(e.amount) || 0
    total += amt
    
    const d = new Date(e.date)
    if (d.toISOString().split('T')[0] === todayStr) today += amt
    if (d >= startOfMonth) month += amt
  })
  
  return { today, month, total }
})

const filteredExpenses = computed(() => {
  let result = expenses.value
  if (filterCategory.value !== 'All') result = result.filter(e => e.category === filterCategory.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e => e.description.toLowerCase().includes(q))
  }
  return result
})

const saveExpense = async () => {
  if (form.amount <= 0 || !form.description) return
  
  const payload = {
    ...form,
    date: new Date(form.date).toISOString()
  }
  
  const res = await createExpense(payload)
  if (res) {
    dialog.value = false
    formRef.value?.reset()
    form.date = new Date().toISOString().split('T')[0]
    form.category = 'Other'
  }
}

const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this expense?')) {
    await deleteExpense(id)
  }
}

onMounted(() => {
  fetchExpenses()
})
</script>
