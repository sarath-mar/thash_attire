<template>
  <article class="ta-product-card" @click="navigateToProduct">
    <div class="ta-product-card__image-wrapper">
      <img
        :src="imageUrl"
        :alt="product.name"
        class="ta-product-card__image ta-product-card__image--primary"
        loading="lazy"
      >
      <img
        v-if="hoverImageUrl"
        :src="hoverImageUrl"
        :alt="product.name"
        class="ta-product-card__image ta-product-card__image--hover"
        loading="lazy"
      >

      <!-- Badges -->
      <div class="ta-product-card__badges">
        <span v-if="product.is_featured" class="ta-product-card__badge ta-product-card__badge--featured">
          COUTURE
        </span>
        <span v-if="product.is_trending" class="ta-product-card__badge ta-product-card__badge--trending">
          BESTSELLER
        </span>
      </div>

      <!-- Quick Action Overlay -->
      <div class="ta-product-card__overlay">
        <div class="ta-product-card__actions">
          <AppButton premium size="small" @click.stop="navigateToProduct">
            Quick View
          </AppButton>
          <a
            :href="whatsappQuickOrderLink"
            target="_blank"
            rel="noopener noreferrer"
            class="ta-product-card__wa-btn"
            title="Order on WhatsApp"
            @click.stop
          >
            <v-icon icon="mdi-whatsapp" size="18" />
          </a>
        </div>
      </div>
    </div>

    <!-- Product Info -->
    <div class="ta-product-card__content">
      <div class="d-flex justify-space-between align-center mb-1">
        <p v-if="categoryName" class="ta-product-card__category">{{ categoryName }}</p>
        <span v-if="product.stock <= 3 && product.stock > 0" class="ta-product-card__low-stock">
          Only {{ product.stock }} left
        </span>
      </div>
      <h3 class="ta-product-card__name">{{ product.name }}</h3>

      <div class="d-flex justify-space-between align-center mt-2">
        <span class="ta-product-card__price">{{ formattedPrice }}</span>

        <div v-if="product.sizes && product.sizes.length" class="ta-product-card__sizes">
          <span v-for="sz in product.sizes.slice(0, 3)" :key="sz" class="ta-product-card__size-tag">
            {{ sz }}
          </span>
          <span v-if="product.sizes.length > 3" class="ta-product-card__size-tag">+{{ product.sizes.length - 3 }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { formatCurrency } from '~/helpers/currency.js'
import { DefaultImages } from '~/constants/defaults.js'
import { Routes } from '~/constants/routes.js'
import { StorageService } from '~/services/StorageService.js'
import { StorageBucket } from '~/enums/storageBucket.js'
import { getWhatsAppLink } from '~/helpers/phone.js'

const props = defineProps({
  product: { type: Object, required: true },
})

const config = useRuntimeConfig()
const categoryName = computed(() => props.product.categories?.name || '')
const formattedPrice = computed(() => formatCurrency(props.product.selling_price))

const resolveImage = (img) => {
  if (!img) return DefaultImages.PRODUCT
  if (img.startsWith('http')) return img
  return StorageService.getPublicUrl(StorageBucket.PRODUCTS, img) || DefaultImages.PRODUCT
}

const imageUrl = computed(() => {
  const images = props.product.images
  return images?.length ? resolveImage(images[0]) : DefaultImages.PRODUCT
})

const hoverImageUrl = computed(() => {
  const images = props.product.images
  return images?.length > 1 ? resolveImage(images[1]) : null
})

const whatsappQuickOrderLink = computed(() => {
  const msg = `Hi Thash Attire! I'm interested in buying: ${props.product.name} (SKU: ${props.product.sku || 'N/A'}) priced at ${formattedPrice.value}. Is it available?`
  return getWhatsAppLink(config.public.whatsappNumber, msg)
})

const navigateToProduct = () => {
  navigateTo(Routes.PRODUCT_DETAIL(props.product.id))
}
</script>

<style scoped lang="scss">
.ta-product-card {
  cursor: pointer;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  &__image-wrapper {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: var(--color-bg-alt);
    border-radius: var(--radius-sm);
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 500ms ease, transform 600ms ease;

    &--primary {
      opacity: 1;
    }

    &--hover {
      position: absolute;
      inset: 0;
      opacity: 0;
    }
  }

  &:hover &__image--primary {
    transform: scale(1.04);
  }

  &:hover &__image--hover {
    opacity: 1;
    transform: scale(1.04);
  }

  &__badges {
    position: absolute;
    top: var(--spacing-sm);
    left: var(--spacing-sm);
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 2;
  }

  &__badge {
    padding: 3px 8px;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #ffffff;
    background: var(--color-primary);

    &--trending {
      background: var(--color-accent-gold-grad);
      color: #121212;
    }
  }

  &__low-stock {
    font-size: 0.68rem;
    color: #c0392b;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(18, 18, 18, 0.25);
    backdrop-filter: blur(2px);
    @include flex-center;
    opacity: 0;
    transition: opacity var(--transition-base);
    z-index: 3;
  }

  &:hover &__overlay {
    opacity: 1;
  }

  &__actions {
    @include flex(row, center, center, var(--spacing-xs));
  }

  &__wa-btn {
    @include flex-center;
    width: 34px;
    height: 34px;
    border-radius: var(--radius-full);
    background: #25D366;
    color: #ffffff;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
    transition: transform var(--transition-fast);

    &:hover {
      transform: scale(1.1);
    }
  }

  &__content {
    padding: var(--spacing-md) var(--spacing-xs) var(--spacing-xs);
  }

  &__category {
    font-size: 0.68rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-accent);
    font-weight: 600;
  }

  &__name {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 500;
    color: var(--color-text-primary);
    line-height: 1.3;
    @include text-ellipsis(1);
  }

  &__price {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__sizes {
    display: flex;
    gap: 4px;
  }

  &__size-tag {
    font-size: 0.65rem;
    padding: 1px 5px;
    border: 1px solid var(--color-border);
    border-radius: 2px;
    color: var(--color-text-secondary);
    background: var(--color-bg);
  }
}
</style>

