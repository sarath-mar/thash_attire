<template>
  <div class="ta-admin-product-create">
    <AdminPageHeader
      title="Edit Product"
      subtitle="Update product details, pricing and inventory."
    />

    <AppLoading v-if="loadingProduct" />

    <AdminProductForm
      v-else-if="product"
      :initial-data="formData"
      :saving="saving"
      submit-label="Update Product"
      @submit="handleSubmit"
      @cancel="goBack"
    />
  </div>
</template>

<script setup>
import { Routes } from '~/constants/routes.js'
import { PageTitles } from '~/constants/pageTitles.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_PRODUCT_EDIT })

const route = useRoute()
const router = useRouter()
const productId = route.params.id

const { product, loading: loadingProduct, fetchProduct, updateProduct, saving } = useProducts()

const formData = computed(() => {
  if (!product.value) return {}
  return {
    ...product.value,
    video: product.value.video || product.value.videos?.[0] || null,
    images: product.value.images || [],
    materials: product.value.materials || [],
  }
})

const handleSubmit = async (data) => {
  const result = await updateProduct(productId, data)
  if (result) router.push(Routes.ADMIN_PRODUCT_DETAIL(productId))
}

const goBack = () => router.push(Routes.ADMIN_PRODUCT_DETAIL(productId))

onMounted(() => fetchProduct(productId))
</script>
