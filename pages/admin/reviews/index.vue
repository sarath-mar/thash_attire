<template>
  <div class="ta-admin-reviews">
    <AdminPageHeader title="Reviews" subtitle="Quotes shown on the homepage. The section stays hidden when none are active.">
      <template #actions>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="openDialog()">Add Review</v-btn>
      </template>
    </AdminPageHeader>

    <v-alert v-if="loadError" type="warning" variant="tonal" class="mb-4">
      {{ loadError }} Run supabase/storefront_content.sql in the Supabase SQL Editor, then refresh.
    </v-alert>

    <AdminDataTable
      :headers="headers"
      :items="reviews"
      :loading="loading"
      search-placeholder="Search reviews..."
      empty-message="No reviews yet."
    >
      <template #[`item.quote`]="{ item }">
        <span class="ta-admin-reviews__quote">{{ item.quote }}</span>
      </template>
      <template #[`item.customer`]="{ item }">
        {{ item.customer_name }}<span v-if="item.city">, {{ item.city }}</span>
      </template>
      <template #[`item.is_active`]="{ item }">
        <AdminStatusChip
          :status="item.is_active ? 'active' : 'inactive'"
          :label-map="{ active: 'Active', inactive: 'Hidden' }"
          :color-map="{ active: 'success', inactive: 'grey' }"
        />
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openDialog(item)" />
        <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(item)" />
      </template>
    </AdminDataTable>

    <AdminFormDialog v-model="dialogOpen" :title="editing ? 'Edit Review' : 'Add Review'" :loading="saving" @save="saveReview">
      <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mb-4">{{ formError }}</v-alert>
      <v-form ref="formRef">
        <v-textarea v-model="form.quote" label="Quote *" variant="outlined" density="comfortable" rows="3" class="mb-3" :rules="[v => !!(v && String(v).trim()) || 'Enter the review quote']" />
        <v-text-field v-model="form.customer_name" label="Customer name *" variant="outlined" density="comfortable" class="mb-3" :rules="[v => !!(v && String(v).trim()) || 'Enter the customer name']" />
        <v-text-field v-model="form.city" label="City" variant="outlined" density="comfortable" class="mb-3" :rules="[v => !v || String(v).trim().length <= 80 || 'City must be 80 characters or less']" />
        <v-text-field v-model.number="form.sort_order" label="Sort order" type="number" variant="outlined" density="comfortable" class="mb-3" :rules="[v => v === '' || v == null || (Number.isFinite(Number(v)) && Number(v) >= 0) || 'Sort order must be 0 or more']" />
        <v-switch v-model="form.is_active" label="Show on the homepage" color="primary" hide-details />
      </v-form>
    </AdminFormDialog>

    <AdminConfirmDialog v-model="deleteDialog" title="Delete Review" :message="`Delete the review from ${reviewToDelete?.customer_name || 'this customer'}?`" :loading="deleting" @confirm="handleDelete" />
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { ReviewService } from '~/services/ReviewService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_REVIEWS })

const { success, error: showError } = useSnackbar()

const reviews = ref([])
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const dialogOpen = ref(false)
const editing = ref(null)
const deleteDialog = ref(false)
const reviewToDelete = ref(null)
const deleting = ref(false)
const form = reactive({ quote: '', customer_name: '', city: '', sort_order: 1, is_active: true })
const formRef = ref(null)
const formError = ref('')

const headers = [
  { title: 'Quote', key: 'quote' },
  { title: 'Customer', key: 'customer' },
  { title: 'Order', key: 'sort_order' },
  { title: 'Status', key: 'is_active' },
  { title: '', key: 'actions', sortable: false, width: 100 },
]

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    reviews.value = await ReviewService.getAll()
  } catch (err) {
    reviews.value = []
    loadError.value = err.message
  } finally {
    loading.value = false
  }
}

const openDialog = (review = null) => {
  formError.value = ''
  editing.value = review
  Object.assign(form, review || {
    quote: '',
    customer_name: '',
    city: '',
    sort_order: reviews.value.length + 1,
    is_active: true,
  })
  dialogOpen.value = true
}

const saveReview = async () => {
  formError.value = ''
  const { valid } = await formRef.value.validate()
  if (!valid) {
    formError.value = 'Fix the highlighted fields before saving.'
    return
  }
  saving.value = true
  try {
    const payload = {
      quote: form.quote.trim(),
      customer_name: form.customer_name.trim(),
      city: form.city.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: !!form.is_active,
    }
    if (editing.value) await ReviewService.update(editing.value.id, payload)
    else await ReviewService.create(payload)
    success(editing.value ? 'Review updated' : 'Review added')
    dialogOpen.value = false
    await load()
  } catch (err) {
    formError.value = err.message || 'Could not save this review.'
    showError(formError.value)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (review) => {
  reviewToDelete.value = review
  deleteDialog.value = true
}

const handleDelete = async () => {
  deleting.value = true
  try {
    await ReviewService.delete(reviewToDelete.value.id)
    success('Review deleted')
    deleteDialog.value = false
    await load()
  } catch (err) {
    showError(err.message)
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.ta-admin-reviews__quote {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
