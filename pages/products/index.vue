<template>
  <div class="ta-products-page">
    <!-- Header Banner -->
    <section class="ta-products-page__header">
      <div class="container position-relative">
        <button class="ta-page-nav-btn" @click="goBack" aria-label="Return to previous page">
          <v-icon icon="mdi-arrow-left" size="16" class="me-1" />
          <span>Return</span>
        </button>
        <div class="text-center">
          <span class="eyebrow text-gold mb-2">HAUTE COUTURE CATALOG</span>
          <h1 class="ta-products-page__title">Our Curated Collections</h1>
          <div class="divider" />
          <p class="ta-products-page__subtitle">
            Explore artisanal silk sarees, bespoke Indo-Western gowns, and bridal couture
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content & Filters -->
    <section class="ta-products-page__main section">
      <div class="container">
        <!-- Category Filter Pills -->
        <div class="ta-products-page__categories-pills">
          <button
            class="ta-pill-btn"
            :class="{ 'ta-pill-btn--active': !selectedCategory }"
            @click="selectCategory(null)"
          >
            All Collections
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="ta-pill-btn"
            :class="{ 'ta-pill-btn--active': selectedCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Search & Sort Toolbar -->
        <div class="ta-products-page__toolbar">
          <div class="ta-products-page__search-wrap">
            <AppSearchBar
              placeholder="Search by product name, fabric, or SKU..."
              @search="handleSearch"
            />
          </div>

          <div class="d-flex align-center gap-3">
            <span class="text-caption font-weight-medium text-muted d-none d-sm-inline">SORT BY:</span>
            <v-select
              v-model="selectedSort"
              :items="sortOptions"
              variant="outlined"
              density="compact"
              hide-details
              class="ta-products-page__sort-select"
              @update:model-value="handleSortChange"
            />
          </div>
        </div>

        <!-- Active Filters Indicator -->
        <div v-if="selectedCategory || searchQuery" class="ta-products-page__active-filters">
          <span class="text-caption text-muted me-2">Active Filters:</span>
          <v-chip
            v-if="selectedCategory"
            closable
            size="small"
            color="primary"
            class="me-2"
            @click:close="selectCategory(null)"
          >
            Category: {{ getCategoryName(selectedCategory) }}
          </v-chip>
          <v-chip
            v-if="searchQuery"
            closable
            size="small"
            color="primary"
            class="me-2"
            @click:close="handleSearch('')"
          >
            Search: "{{ searchQuery }}"
          </v-chip>
          <v-btn
            variant="text"
            size="x-small"
            color="error"
            class="text-caption font-weight-bold"
            @click="clearAllFilters"
          >
            Clear All
          </v-btn>
        </div>

        <!-- Skeleton Loader State -->
        <div v-if="loading" class="ta-products-page__grid">
          <div v-for="n in 8" :key="n" class="shimmer-card">
            <div class="shimmer-loader" style="aspect-ratio: 3/4; border-radius: 4px;" />
            <div class="shimmer-loader mt-3" style="height: 16px; width: 60%;" />
            <div class="shimmer-loader mt-2" style="height: 20px; width: 85%;" />
            <div class="shimmer-loader mt-2" style="height: 18px; width: 40%;" />
          </div>
        </div>

        <!-- Products Grid -->
        <div v-else-if="products.length" class="ta-products-page__grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Empty State -->
        <AppEmptyState
          v-else
          icon="mdi-hanger"
          title="No products match your filter"
          description="Try selecting another category or clearing your search query."
        />

        <!-- Pagination -->
        <div v-if="computedTotalPages > 1" class="mt-12">
          <AppPagination
            :page="currentPage"
            :total-pages="computedTotalPages"
            @update:page="handlePageChange"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { PaginationDefaults } from '~/constants/app.js'

useHead({ title: PageTitles.PRODUCTS })

const router = useRouter()
const route = useRoute()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}

const { products, total, loading, fetchProducts } = useProducts()
const { categories, fetchCategories } = useCategories()

const currentPage = ref(PaginationDefaults.PAGE)
const searchQuery = ref('')
const selectedCategory = ref(route.query.category || null)
const selectedSort = ref('created_at:desc')

const sortOptions = [
  { title: 'Newest Arrivals', value: 'created_at:desc' },
  { title: 'Price: Low to High', value: 'selling_price:asc' },
  { title: 'Price: High to Low', value: 'selling_price:desc' },
  { title: 'Popularity', value: 'stock:desc' },
]

const computedTotalPages = computed(() =>
  Math.ceil(total.value / PaginationDefaults.LIMIT) || 1,
)

const getCategoryName = (catId) => {
  const cat = categories.value.find(c => c.id === catId)
  return cat ? cat.name : catId
}

const loadProducts = async () => {
  const [sortBy, sortOrder] = selectedSort.value.split(':')
  await fetchProducts({
    page: currentPage.value,
    limit: PaginationDefaults.LIMIT,
    search: searchQuery.value || undefined,
    categoryId: selectedCategory.value || undefined,
    sortBy,
    sortOrder,
  })
}

const selectCategory = (catId) => {
  selectedCategory.value = catId
  currentPage.value = 1
  loadProducts()
}

const handleSearch = (query) => {
  searchQuery.value = query
  currentPage.value = 1
  loadProducts()
}

const handleSortChange = () => {
  currentPage.value = 1
  loadProducts()
}

const clearAllFilters = () => {
  selectedCategory.value = null
  searchQuery.value = ''
  currentPage.value = 1
  loadProducts()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await fetchCategories()
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
  await loadProducts()
})

watch(() => route.query.category, (newCat) => {
  if (newCat !== selectedCategory.value) {
    selectedCategory.value = newCat || null
    loadProducts()
  }
})
</script>

<style scoped lang="scss">
.ta-products-page {
  &__header {
    padding: var(--spacing-3xl) 0 var(--spacing-2xl);
    text-align: center;
    background: linear-gradient(180deg, var(--color-bg-alt) 0%, var(--color-bg) 100%);
    border-bottom: 1px solid var(--color-border-light);
  }

  &__title {
    font-family: var(--font-heading);
    font-size: clamp(2.2rem, 4.5vw, 3.4rem);
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }

  &__subtitle {
    font-size: 1.05rem;
    color: var(--color-text-secondary);
    max-width: 600px;
    margin-inline: auto;
  }

  &__categories-pills {
    @include flex(row, center, center, var(--spacing-sm));
    flex-wrap: wrap;
    margin-bottom: var(--spacing-2xl);
  }

  &__toolbar {
    @include flex(row, space-between, center, var(--spacing-lg));
    margin-bottom: var(--spacing-lg);

    @include respond-below(md) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__search-wrap {
    flex: 1;
    max-width: 480px;

    @include respond-below(md) {
      max-width: 100%;
    }
  }

  &__sort-select {
    min-width: 180px;
  }

  &__active-filters {
    @include flex(row, flex-start, center, 4px);
    margin-bottom: var(--spacing-xl);
    padding: 8px 16px;
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-xl);

    @include respond-below(xl) {
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-lg);
    }

    @include respond-below(lg) {
      grid-template-columns: repeat(3, 1fr);
    }

    @include respond-below(md) {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }

    @include respond-below(sm) {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-sm);
    }
  }
}

.ta-pill-btn {
  @include button-reset;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-accent);
    color: var(--color-primary);
  }

  &--active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #ffffff;

    &:hover {
      background: var(--color-primary);
      color: #ffffff;
    }
  }
}
</style>

