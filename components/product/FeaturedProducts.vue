<template>
  <section class="ta-featured section">
    <div class="container">
      <div class="text-center mb-6">
        <span class="eyebrow mb-1">HAUTE COUTURE</span>
        <h2 class="section-title">{{ title }}</h2>
        <div class="divider" />
        <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      </div>

      <AppLoading v-if="loading" />

      <div v-else-if="products.length" class="ta-featured__grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>

      <AppEmptyState
        v-else
        icon="mdi-hanger"
        title="No products yet"
        description="Our collection is being curated. Check back soon!"
      />

      <div v-if="products.length && showViewAll" class="ta-featured__action">
        <AppButton premium to="/products" class="px-8">
          Explore Complete Collection
        </AppButton>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Featured Collection' },
  subtitle: { type: String, default: 'Handpicked pieces from our latest collection' },
  products: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  showViewAll: { type: Boolean, default: true },
})
</script>

<style scoped lang="scss">
.ta-featured {
  background: var(--color-bg);

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

  &__action {
    @include flex-center;
    margin-top: var(--spacing-3xl);
  }
}
</style>

