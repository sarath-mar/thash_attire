<template>
  <div class="ta-admin-categories">
    <AdminPageHeader title="Categories" subtitle="Organize your product catalog.">
      <template #actions>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="openDialog()">Add Category</v-btn>
      </template>
    </AdminPageHeader>

    <AdminDataTable
      :headers="headers"
      :items="categories"
      :loading="loading"
      :show-search="true"
      search-placeholder="Search categories..."
      empty-message="No categories yet."
    >
      <template #[`item.image`]="{ item }">
        <v-avatar size="40" rounded="lg"><v-img :src="item.image_url" cover /></v-avatar>
      </template>
      <template #[`item.products`]="{ item }">{{ getProductCount(item.id) }}</template>
      <template #[`item.is_active`]="{ item }">
        <AdminStatusChip :status="item.is_active ? 'active' : 'inactive'" :label-map="{ active: 'Active', inactive: 'Inactive' }" :color-map="{ active: 'success', inactive: 'grey' }" />
      </template>
      <template #[`item.created_at`]="{ item }">{{ formatDate(item.created_at || item.sort_order) }}</template>
      <template #[`item.actions`]="{ item }">
        <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openDialog(item)" />
        <v-btn :icon="item.is_active ? 'mdi-pause' : 'mdi-play'" size="small" variant="text" @click="toggleActive(item)" />
        <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(item)" />
      </template>
    </AdminDataTable>

    <AdminFormDialog v-model="dialogOpen" :title="editing ? 'Edit Category' : 'Add Category'" :loading="saving" @save="saveCategory">
      <v-form ref="formRef">
        <v-text-field v-model="form.name" label="Category Name *" variant="outlined" density="comfortable" class="mb-3" :rules="[v => !!v || 'Required']" />
        <v-textarea v-model="form.description" label="Description" variant="outlined" density="comfortable" rows="2" class="mb-3" />
        <v-text-field v-model="form.image_url" label="Image URL" variant="outlined" density="comfortable" class="mb-3" />
        <v-text-field v-model.number="form.sort_order" label="Sort Order" type="number" variant="outlined" density="comfortable" />
      </v-form>
    </AdminFormDialog>

    <AdminConfirmDialog v-model="deleteDialog" title="Delete Category" :message="`Delete &quot;${categoryToDelete?.name}&quot;?`" :loading="deleting" @confirm="handleDelete" />
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { CategoryService } from '~/services/CategoryService.js'
import { ProductService } from '~/services/ProductService.js'
import { formatDate } from '~/helpers/date.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_CATEGORIES })

const { success, error: showError } = useSnackbar()

const categories = ref([])
const productCounts = ref({})
const loading = ref(true)
const saving = ref(false)
const dialogOpen = ref(false)
const editing = ref(null)
const deleteDialog = ref(false)
const categoryToDelete = ref(null)
const deleting = ref(false)
const form = reactive({ name: '', description: '', image_url: '', sort_order: 1 })

const headers = [
  { title: '', key: 'image', sortable: false, width: 56 },
  { title: 'Category', key: 'name' },
  { title: 'Products', key: 'products', sortable: false },
  { title: 'Status', key: 'is_active' },
  { title: 'Order', key: 'sort_order' },
  { title: '', key: 'actions', sortable: false, width: 120 },
]

const getProductCount = (catId) => productCounts.value[catId] || 0

const load = async () => {
  loading.value = true
  categories.value = await CategoryService.getAll()
  const { data } = await ProductService.getAll({ limit: 100, status: null })
  const counts = {}
  data.forEach(p => { counts[p.category_id] = (counts[p.category_id] || 0) + 1 })
  productCounts.value = counts
  loading.value = false
}

const openDialog = (cat = null) => {
  editing.value = cat
  Object.assign(form, cat || { name: '', description: '', image_url: '', sort_order: categories.value.length + 1 })
  dialogOpen.value = true
}

const saveCategory = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await CategoryService.update(editing.value.id, { ...form, slug: form.name.toLowerCase().replace(/\s+/g, '-') })
      success('Category updated')
    } else {
      await CategoryService.create({ ...form, slug: form.name.toLowerCase().replace(/\s+/g, '-'), is_active: true })
      success('Category created')
    }
    dialogOpen.value = false
    await load()
  } catch (err) {
    showError(err.message)
  } finally {
    saving.value = false
  }
}

const toggleActive = async (cat) => {
  await CategoryService.update(cat.id, { is_active: !cat.is_active })
  success(cat.is_active ? 'Category deactivated' : 'Category activated')
  await load()
}

const confirmDelete = (cat) => { categoryToDelete.value = cat; deleteDialog.value = true }

const handleDelete = async () => {
  deleting.value = true
  await CategoryService.delete(categoryToDelete.value.id)
  deleting.value = false
  deleteDialog.value = false
  success('Category deleted')
  await load()
}

onMounted(load)
</script>
