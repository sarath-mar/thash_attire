<template>
  <article class="ta-product-card" @click="navigateToProduct">
    <div class="ta-product-card__image-wrapper">
      <img
        :src="imageUrl"
        :alt="product.name"
        class="ta-product-card__image"
        loading="lazy"
      >
      <div v-if="product.is_featured" class="ta-product-card__badge ta-product-card__badge--featured">
        Featured
      </div>
      <div v-if="product.is_trending" class="ta-product-card__badge ta-product-card__badge--trending">
        Trending
      </div>
      <div class="ta-product-card__overlay">
        <AppButton premium size="small" @click.stop="navigateToProduct">
          View Details
        </AppButton>
      </div>
    </div>

    <div class="ta-product-card__content">
      <p v-if="categoryName" class="ta-product-card__category">{{ categoryName }}</p>
      <h3 class="ta-product-card__name">{{ product.name }}</h3>
      <p class="ta-product-card__price">{{ formattedPrice }}</p>
    </div>
  </article>
</template>

<script setup>
import { formatCurrency } from '~/helpers/currency.js'
import { getImageUrl } from '~/helpers/imageUrl.js'
import { DefaultImages } from '~/constants/defaults.js'
import { Routes } from '~/constants/routes.js'
import { StorageService } from '~/services/StorageService.js'
import { StorageBucket } from '~/enums/storageBucket.js'

const props = defineProps({
  product: { type: Object, required: true },
})

const categoryName = computed(() => props.product.categories?.name || '')
const formattedPrice = computed(() => formatCurrency(props.product.selling_price))

const imageUrl = computed(() => {
  const images = props.product.images
  if (!images?.length) return DefaultImages.PRODUCT

  const firstImage = images[0]
  if (firstImage.startsWith('http')) return firstImage

  return StorageService.getPublicUrl(StorageBucket.PRODUCTS, firstImage) || DefaultImages.PRODUCT
})

const navigateToProduct = () => {
  navigateTo(Routes.PRODUCT_DETAIL(props.product.id))
}
</script>

<style scoped lang="scss">
.ta-product-card {
  cursor: pointer;
  group: card;

  &__image-wrapper {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: var(--color-bg-alt);
    border-radius: var(--radius-sm);
  }

  &__image {
    @include image-cover;
    @include transition(transform, var(--transition-slow));
  }

  &:hover &__image {
    transform: scale(1.05);
  }

  &__badge {
    position: absolute;
    top: var(--spacing-sm);
    left: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    letter-spacing: $letter-spacing-wider;
    text-transform: uppercase;
    color: var(--color-text-inverse);
    background: var(--color-primary);
    z-index: 1;

    &--trending {
      top: auto;
      bottom: var(--spacing-sm);
      background: var(--color-accent);
    }
  }

  &__overlay {
    @include overlay(0.3);
    @include flex-center;
    opacity: 0;
    @include transition(opacity);
    z-index: 2;
  }

  &:hover &__overlay {
    opacity: 1;
  }

  &__content {
    padding: var(--spacing-md) 0;
  }

  &__category {
    font-size: $font-size-xs;
    letter-spacing: $letter-spacing-wider;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-xs);
  }

  &__name {
    @include heading($font-size-md);
    @include text-ellipsis(2);
    margin-bottom: var(--spacing-xs);
  }

  &__price {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
  }
}
</style>
