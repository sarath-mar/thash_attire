<template>
  <v-card elevation="0" border rounded="lg" class="ta-product-card" :to="to">
    <div class="ta-product-card__image-wrap">
      <img :src="imageUrl" :alt="product.name" class="ta-product-card__image" />
      <AdminStatusChip
        :status="product.status"
        :label-map="ProductStatusLabels"
        :color-map="ProductStatusColors"
        class="ta-product-card__status"
      />
    </div>
    <v-card-text class="ta-product-card__body">
      <p class="ta-product-card__name">{{ product.name }}</p>
      <p class="ta-product-card__sku">{{ product.sku }}</p>
      <div class="ta-product-card__footer">
        <strong class="ta-product-card__price">{{ formatCurrency(product.selling_price) }}</strong>
        <span class="ta-product-card__stock" :class="stockClass">
          {{ product.stock }} in stock
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ProductStatusLabels, ProductStatusColors } from '~/enums/productStatus.js'
import { formatCurrency } from '~/helpers/currency.js'
import { getProductImageUrl } from '~/helpers/imageUrl.js'

const props = defineProps({
  product: { type: Object, required: true },
  to: { type: String, default: '' },
})

const imageUrl = computed(() => getProductImageUrl(props.product))

const stockClass = computed(() => ({
  'ta-product-card__stock--low': props.product.stock > 0 && props.product.stock <= 5,
  'ta-product-card__stock--out': props.product.stock === 0,
}))
</script>

<style scoped lang="scss">
.ta-product-card {
  cursor: pointer;
  overflow: hidden;
  @include transition(box-shadow, transform);

  &:hover {
    box-shadow: var(--shadow-md) !important;
    transform: translateY(-2px);
  }

  &__image-wrap {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: var(--color-bg-alt);
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__status {
    position: absolute;
    top: var(--spacing-sm);
    left: var(--spacing-sm);
  }

  &__body {
    padding: var(--spacing-md) !important;
  }

  &__name {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-xs);
    @include text-ellipsis;
  }

  &__sku {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    margin: 0 0 var(--spacing-sm);
  }

  &__footer {
    @include flex-between;
    gap: var(--spacing-sm);
  }

  &__price {
    font-size: $font-size-sm;
    color: var(--color-secondary);
  }

  &__stock {
    font-size: $font-size-xs;
    color: var(--color-success);

    &--low { color: var(--color-warning); }
    &--out { color: var(--color-error); }
  }
}
</style>
