<template>
  <div class="ta-product-detail">
    <AppLoading v-if="loading" fullscreen message="Loading product..." />

    <template v-else-if="product">
      <section class="ta-product-detail__breadcrumb">
        <div class="container">
          <nav class="ta-product-detail__nav">
            <NuxtLink to="/">Home</NuxtLink>
            <span>/</span>
            <NuxtLink to="/products">Shop</NuxtLink>
            <span>/</span>
            <span>{{ product.name }}</span>
          </nav>
        </div>
      </section>

      <section class="section">
        <div class="container ta-product-detail__grid">
          <div class="ta-product-detail__gallery">
            <div class="ta-product-detail__main-image">
              <img :src="activeImage" :alt="product.name">
            </div>
            <div v-if="productImages.length > 1" class="ta-product-detail__thumbnails">
              <button
                v-for="(img, index) in productImages"
                :key="index"
                class="ta-product-detail__thumb"
                :class="{ 'ta-product-detail__thumb--active': activeImageIndex === index }"
                @click="activeImageIndex = index"
              >
                <img :src="img" :alt="`${product.name} ${index + 1}`">
              </button>
            </div>
          </div>

          <div class="ta-product-detail__info">
            <p v-if="product.categories?.name" class="ta-product-detail__category">
              {{ product.categories.name }}
            </p>
            <h1 class="ta-product-detail__name">{{ product.name }}</h1>
            <p class="ta-product-detail__price">{{ formattedPrice }}</p>

            <p v-if="product.description" class="ta-product-detail__description">
              {{ product.description }}
            </p>

            <div v-if="product.sizes?.length" class="ta-product-detail__meta">
              <strong>Sizes:</strong>
              <div class="ta-product-detail__tags">
                <span v-for="size in product.sizes" :key="size" class="ta-product-detail__tag">
                  {{ size }}
                </span>
              </div>
            </div>

            <div v-if="product.colors?.length" class="ta-product-detail__meta">
              <strong>Colors:</strong>
              <div class="ta-product-detail__tags">
                <span v-for="color in product.colors" :key="color" class="ta-product-detail__tag">
                  {{ color }}
                </span>
              </div>
            </div>

            <div class="ta-product-detail__actions">
              <AppButton
                premium
                block
                prepend-icon="mdi-whatsapp"
                :href="whatsappLink"
                target="_blank"
              >
                Enquire on WhatsApp
              </AppButton>
            </div>

            <p v-if="product.sku" class="ta-product-detail__sku">SKU: {{ product.sku }}</p>
          </div>
        </div>
      </section>
    </template>

    <AppEmptyState
      v-else
      icon="mdi-alert-circle-outline"
      title="Product not found"
      description="The product you're looking for doesn't exist or has been removed."
    >
      <template #action>
        <AppButton outline to="/products">Back to Shop</AppButton>
      </template>
    </AppEmptyState>
  </div>
</template>

<script setup>
import { formatCurrency } from '~/helpers/currency.js'
import { getWhatsAppLink } from '~/helpers/phone.js'
import { DefaultImages } from '~/constants/defaults.js'
import { StorageService } from '~/services/StorageService.js'
import { StorageBucket } from '~/enums/storageBucket.js'

const route = useRoute()
const config = useRuntimeConfig()
const { product, loading, fetchProduct } = useProducts()
const activeImageIndex = ref(0)

const formattedPrice = computed(() =>
  product.value ? formatCurrency(product.value.selling_price) : '',
)

const productImages = computed(() => {
  if (!product.value?.images?.length) return [DefaultImages.PRODUCT]
  return product.value.images.map((img) => {
    if (img.startsWith('http')) return img
    return StorageService.getPublicUrl(StorageBucket.PRODUCTS, img) || DefaultImages.PRODUCT
  })
})

const activeImage = computed(() => productImages.value[activeImageIndex.value])

const whatsappLink = computed(() => {
  if (!product.value) return '#'
  const message = `Hi! I'm interested in "${product.value.name}" (SKU: ${product.value.sku || 'N/A'}). Is it available?`
  return getWhatsAppLink(config.public.whatsappNumber, message)
})

useHead({
  title: computed(() => product.value?.name || 'Product Details'),
})

onMounted(async () => {
  await fetchProduct(route.params.id)
})
</script>

<style scoped lang="scss">
.ta-product-detail {
  &__breadcrumb {
    padding: var(--spacing-lg) 0;
    background: var(--color-bg-alt);
  }

  &__nav {
    @include flex(row, flex-start, center, var(--spacing-sm));
    font-size: $font-size-sm;
    color: var(--color-text-muted);

    a:hover {
      color: var(--color-text-primary);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-3xl);
    align-items: start;

    @include respond-below(md) {
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
    }
  }

  &__main-image {
    aspect-ratio: 3 / 4;
    background: var(--color-bg-alt);
    border-radius: var(--radius-sm);
    overflow: hidden;

    img {
      @include image-cover;
    }
  }

  &__thumbnails {
    @include flex(row, flex-start, center, var(--spacing-sm));
    margin-top: var(--spacing-md);
    overflow-x: auto;
    @include custom-scrollbar;
  }

  &__thumb {
    @include button-reset;
    flex-shrink: 0;
    width: 72px;
    height: 96px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 2px solid transparent;
    @include transition(border-color);

    &--active {
      border-color: var(--color-primary);
    }

    img {
      @include image-cover;
    }
  }

  &__category {
    font-size: $font-size-xs;
    letter-spacing: $letter-spacing-wider;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-sm);
  }

  &__name {
    @include heading($font-size-3xl);
    margin-bottom: var(--spacing-md);
  }

  &__price {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    margin-bottom: var(--spacing-lg);
  }

  &__description {
    @include body-text();
    margin-bottom: var(--spacing-xl);
    line-height: $line-height-relaxed;
  }

  &__meta {
    margin-bottom: var(--spacing-lg);

    strong {
      display: block;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      margin-bottom: var(--spacing-sm);
    }
  }

  &__tags {
    @include flex(row, flex-start, center, var(--spacing-sm));
    flex-wrap: wrap;
  }

  &__tag {
    padding: var(--spacing-xs) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: $font-size-sm;
  }

  &__actions {
    margin-top: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);
  }

  &__sku {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
  }
}
</style>
