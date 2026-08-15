<template>
  <div class="ta-admin-product-create">
    <AdminPageHeader
      title="Add Product"
      subtitle="Create a new Thash Attire product."
    />

    <AppLoading v-if="loadingInitial" />

    <AdminProductForm
      v-else
      :initial-data="initialData"
      :saving="saving"
      submit-label="Create Product"
      @submit="handleSubmit"
      @cancel="goBack"
    />
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { ProductService } from '~/services/ProductService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_PRODUCT_CREATE })

const route = useRoute()
const router = useRouter()
const { createProduct, saving } = useProducts()

const loadingInitial = ref(false)
const initialData = ref({})

const handleSubmit = async (data) => {
  const result = await createProduct(data)
  if (result) router.push(Routes.ADMIN_PRODUCT_DETAIL(result.id))
}

const goBack = () => router.push(Routes.ADMIN_PRODUCTS)

onMounted(async () => {
  if (route.query.duplicate) {
    loadingInitial.value = true
    try {
      const source = await ProductService.getById(route.query.duplicate)
      initialData.value = {
        ...source,
        id: undefined,
        sku: `${source.sku}-COPY`,
        name: `${source.name} (Copy)`,
        video: source.video || source.videos?.[0] || null,
        images: source.images || [],
        materials: source.materials || [],
        initial_sample_created: false,
        createInitialShowcaseSample: true,
        stock: 0,
      }
    } finally {
      loadingInitial.value = false
    }
  }
})
</script>
