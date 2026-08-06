<template>
  <div class="ta-products-page">
    <section class="ta-products-page__header">
      <div class="container">
        <h1 class="ta-products-page__title">Shop Collection</h1>
        <p class="ta-products-page__subtitle">
          Explore our curated selection of premium women's fashion
        </p>
      </div>
    </section>

    <section class="ta-products-page__filters section">
      <div class="container">
        <div class="ta-products-page__toolbar">
          <AppSearchBar
            placeholder="Search products..."
            @search="handleSearch"
          />

          <v-select
            v-model="selectedCategory"
            :items="categoryOptions"
            label="Category"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            class="ta-products-page__category-select"
            @update:model-value="handleCategoryChange"
          />
        </div>

        <AppLoading v-if="loading" />

        <div v-else-if="products.length" class="ta-products-page__grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <AppEmptyState
          v-else
          icon="mdi-hanger"
          title="No products found"
          :description="searchQuery ? 'Try adjusting your search or filters.' : 'Our collection is being curated.'"
        />

        <AppPagination
          v-if="totalPages > 1"
          :page="currentPage"
          :total-pages="totalPages"
          @update:page="handlePageChange"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { PaginationDefaults } from '~/constants/app.js'

useHead({ title: PageTitles.PRODUCTS })

const { products, total, loading, totalPages, fetchProducts } = useProducts()
const { categories, fetchCategories } = useCategories()

const currentPage = ref(PaginationDefaults.PAGE)
const searchQuery = ref('')
const selectedCategory = ref(null)

const categoryOptions = computed(() =>
  categories.value.map((cat) => ({ title: cat.name, value: cat.id })),
)

const computedTotalPages = computed(() =>
  Math.ceil(total.value / PaginationDefaults.LIMIT),
)

watch(computedTotalPages, (val) => {
  // totalPages from composable may differ; use computed
})

const loadProducts = async () => {
  await fetchProducts({
    page: currentPage.value,
    limit: PaginationDefaults.LIMIT,
    search: searchQuery.value || undefined,
    categoryId: selectedCategory.value || undefined,
  })
}

const handleSearch = (query) => {
  searchQuery.value = query
  currentPage.value = 1
  loadProducts()
}

const handleCategoryChange = () => {
  currentPage.value = 1
  loadProducts()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    loadProducts(),
  ])
})
</script>

<style scoped lang="scss">
.ta-products-page {
  &__header {
    padding: var(--spacing-3xl) 0 var(--spacing-xl);
    text-align: center;
    background: var(--color-bg-alt);
  }

  &__title {
    @include heading($font-size-4xl);
    margin-bottom: var(--spacing-sm);
  }

  &__subtitle {
    @include body-text($font-size-base, var(--color-text-secondary));
  }

  &__toolbar {
    @include flex(row, space-between, center, var(--spacing-md));
    margin-bottom: var(--spacing-2xl);

    @include respond-below(md) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__category-select {
    max-width: 240px;

    @include respond-below(md) {
      max-width: 100%;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);

    @include respond-below(xl) {
      grid-template-columns: repeat(3, 1fr);
    }

    @include respond-below(md) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
