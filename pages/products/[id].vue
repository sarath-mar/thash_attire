<template>
  <div class="ta-product-detail">
    <AppLoading v-if="loading" fullscreen message="Fetching garment details..." />

    <template v-else-if="product">
      <!-- Breadcrumb Bar -->
      <section class="ta-product-detail__breadcrumb">
        <div class="container">
          <nav class="ta-product-detail__nav">
            <NuxtLink to="/">Home</NuxtLink>
            <v-icon icon="mdi-chevron-right" size="14" class="mx-1" />
            <NuxtLink to="/products">Shop</NuxtLink>
            <v-icon icon="mdi-chevron-right" size="14" class="mx-1" />
            <span class="text-primary font-weight-medium">{{ product.name }}</span>
          </nav>
        </div>
      </section>

      <!-- Main Product Display -->
      <section class="section">
        <div class="container ta-product-detail__grid">
          <!-- Media Gallery (Images + Videos) -->
          <div class="ta-product-detail__gallery">
            <div class="ta-product-detail__main-media">
              <video
                v-if="showingVideo && activeVideoUrl"
                controls
                autoplay
                class="ta-product-detail__video-player"
              >
                <source :src="activeVideoUrl" type="video/mp4">
                Your browser does not support video playback.
              </video>
              <img
                v-else
                :src="activeImage"
                :alt="product.name"
                class="ta-product-detail__main-img"
              >
              <span v-if="product.is_featured" class="ta-product-detail__featured-tag">COUTURE EDITION</span>
            </div>

            <!-- Media Thumbnails -->
            <div class="ta-product-detail__thumbnails">
              <button
                v-for="(img, index) in productImages"
                :key="index"
                class="ta-product-detail__thumb"
                :class="{ 'ta-product-detail__thumb--active': !showingVideo && activeImageIndex === index }"
                @click="selectImage(index)"
              >
                <img :src="img" :alt="`${product.name} ${index + 1}`">
              </button>

              <button
                v-if="product.videos && product.videos.length"
                class="ta-product-detail__thumb ta-product-detail__thumb--video"
                :class="{ 'ta-product-detail__thumb--active': showingVideo }"
                @click="selectVideo"
              >
                <v-icon icon="mdi-play-circle" size="28" color="#C5A059" />
                <span class="text-micro font-weight-bold d-block mt-1 text-gold">VIDEO DEMO</span>
              </button>
            </div>
          </div>

          <!-- Product Meta & Order Details -->
          <div class="ta-product-detail__info">
            <div class="d-flex justify-space-between align-center mb-2">
              <span v-if="product.categories?.name" class="eyebrow mb-0">
                {{ product.categories.name }}
              </span>
              <span v-if="product.stock > 0" class="ta-stock-badge ta-stock-badge--in">
                <v-icon icon="mdi-check-circle" size="14" class="me-1" />
                In Stock ({{ product.stock }} Available)
              </span>
              <span v-else class="ta-stock-badge ta-stock-badge--out">
                Out of Stock (Made to Order)
              </span>
            </div>

            <h1 class="ta-product-detail__name">{{ product.name }}</h1>

            <div class="d-flex align-baseline gap-3 mb-6">
              <span class="ta-product-detail__price">{{ formattedPrice }}</span>
              <span class="text-caption text-muted">Includes all taxes</span>
            </div>

            <p v-if="product.description" class="ta-product-detail__description">
              {{ product.description }}
            </p>

            <!-- Size Selector -->
            <div v-if="product.sizes?.length" class="ta-product-detail__option">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-caption font-weight-bold text-uppercase">Select Size:</span>
                <button class="ta-link-btn" @click="showSizeGuide = true">
                  <v-icon icon="mdi-ruler" size="14" class="me-1" /> Size Guide
                </button>
              </div>
              <div class="ta-product-detail__pills">
                <button
                  v-for="size in product.sizes"
                  :key="size"
                  class="ta-size-pill"
                  :class="{ 'ta-size-pill--active': selectedSize === size }"
                  @click="selectedSize = size"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- Color Swatches -->
            <div v-if="product.colors?.length" class="ta-product-detail__option mt-4">
              <span class="text-caption font-weight-bold text-uppercase d-block mb-2">Available Shade:</span>
              <div class="ta-product-detail__pills">
                <button
                  v-for="color in product.colors"
                  :key="color"
                  class="ta-color-pill"
                  :class="{ 'ta-color-pill--active': selectedColor === color }"
                  @click="selectedColor = color"
                >
                  <span class="ta-color-pill__dot" :style="{ backgroundColor: getColorHex(color) }" />
                  {{ color }}
                </button>
              </div>
            </div>

            <!-- WhatsApp Primary Direct Order Action -->
            <div class="ta-product-detail__actions mt-8">
              <a
                :href="whatsappOrderLink"
                target="_blank"
                rel="noopener noreferrer"
                class="ta-product-detail__order-btn"
              >
                <v-icon icon="mdi-whatsapp" size="24" class="me-2" />
                <span>Order Now via WhatsApp</span>
              </a>
              <p class="text-caption text-center text-muted mt-2">
                Click to directly chat with our stylist to confirm availability & dispatch date
              </p>
            </div>

            <!-- Guarantees & Highlights -->
            <div class="ta-product-detail__guarantees mt-8">
              <div class="ta-guarantee-item">
                <v-icon icon="mdi-truck-fast-outline" color="#C5A059" size="20" class="me-3" />
                <div>
                  <span class="font-weight-semibold text-body-2 d-block">Free Express Shipping</span>
                  <span class="text-caption text-muted">Delivered safely across India & Worldwide</span>
                </div>
              </div>
              <div class="ta-guarantee-item">
                <v-icon icon="mdi-check-decagram-outline" color="#C5A059" size="20" class="me-3" />
                <div>
                  <span class="font-weight-semibold text-body-2 d-block">100% Authentic Handloom</span>
                  <span class="text-caption text-muted">Handcrafted by certified master artisans</span>
                </div>
              </div>
              <div class="ta-guarantee-item">
                <v-icon icon="mdi-hanger" color="#C5A059" size="20" class="me-3" />
                <div>
                  <span class="font-weight-semibold text-body-2 d-block">Bespoke Custom Stitching</span>
                  <span class="text-caption text-muted">Custom blouse & hem alterations available</span>
                </div>
              </div>
            </div>

            <div v-if="product.sku" class="ta-product-detail__sku mt-6">
              <span>SKU: {{ product.sku }}</span>
              <span class="ms-4">Category: {{ product.categories?.name || 'Couture' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Products -->
      <FeaturedProducts
        v-if="relatedProducts.length"
        title="You May Also Like"
        subtitle="Complementary silhouettes handpicked for your wardrobe"
        :products="relatedProducts"
        :show-view-all="false"
      />

      <!-- Size Guide Dialog -->
      <v-dialog v-model="showSizeGuide" max-width="540">
        <v-card class="pa-6 rounded-lg">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="font-family-heading font-weight-medium text-h5">Standard Size Guide</h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="showSizeGuide = false" />
          </div>
          <p class="text-caption text-muted mb-4">All measurements are in inches. For custom tailoring, reach out on WhatsApp.</p>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Size</th>
                <th>Bust</th>
                <th>Waist</th>
                <th>Hip</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>XS</strong></td><td>32"</td><td>26"</td><td>35"</td></tr>
              <tr><td><strong>S</strong></td><td>34"</td><td>28"</td><td>37"</td></tr>
              <tr><td><strong>M</strong></td><td>36"</td><td>30"</td><td>39"</td></tr>
              <tr><td><strong>L</strong></td><td>38"</td><td>32"</td><td>41"</td></tr>
              <tr><td><strong>XL</strong></td><td>40"</td><td>34"</td><td>43"</td></tr>
              <tr><td><strong>XXL</strong></td><td>42"</td><td>36"</td><td>45"</td></tr>
            </tbody>
          </v-table>
        </v-card>
      </v-dialog>
    </template>

    <AppEmptyState
      v-else
      icon="mdi-alert-circle-outline"
      title="Product not found"
      description="The piece you are looking for may have been archived."
    >
      <template #action>
        <AppButton premium to="/products">Return to Catalog</AppButton>
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
import { ProductService } from '~/services/ProductService.js'

const route = useRoute()
const config = useRuntimeConfig()
const { product, loading, fetchProduct } = useProducts()

const activeImageIndex = ref(0)
const showingVideo = ref(false)
const selectedSize = ref('')
const selectedColor = ref('')
const showSizeGuide = ref(false)
const relatedProducts = ref([])

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

const activeImage = computed(() => productImages.value[activeImageIndex.value] || DefaultImages.PRODUCT)

const activeVideoUrl = computed(() => {
  if (!product.value?.videos?.length) return null
  const vid = product.value.videos[0]
  if (vid.startsWith('http')) return vid
  return StorageService.getPublicUrl(StorageBucket.PRODUCT_VIDEOS, vid)
})

const selectImage = (idx) => {
  showingVideo.value = false
  activeImageIndex.value = idx
}

const selectVideo = () => {
  showingVideo.value = true
}

const getColorHex = (name) => {
  const map = {
    'Emerald Green': '#0d5c3a',
    'Royal Gold': '#d4af37',
    'Ruby Red': '#9b111e',
    'Dusty Rose': '#dcae96',
    'Champagne Gold': '#e6ca65',
    'Ivory': '#fdfbf7',
    'Maroon Crimson': '#800020',
    'Antique Gold': '#b8860b',
    'Royal Blue': '#4169e1',
    'Mint Green': '#98ff98',
    'Peach Pink': '#ffe5b4',
    'Mustard Yellow': '#ffdb58',
    'Deep Purple': '#36013f',
    'Wine Red': '#722f37',
    'Midnight Black': '#121212',
  }
  return map[name] || '#c5a059'
}

const whatsappOrderLink = computed(() => {
  if (!product.value) return '#'
  let msg = `Hi Thash Attire! I would like to order:\n`
  msg += `📌 Product: ${product.value.name}\n`
  msg += `🏷️ SKU: ${product.value.sku || 'N/A'}\n`
  msg += `💰 Price: ${formattedPrice.value}\n`
  if (selectedSize.value) msg += `📐 Size: ${selectedSize.value}\n`
  if (selectedColor.value) msg += `🎨 Color: ${selectedColor.value}\n`
  msg += `Please confirm availability and order steps.`
  return getWhatsAppLink(config.public.whatsappNumber, msg)
})

useHead({
  title: computed(() => product.value?.name ? `${product.value.name} — Thash Attire` : 'Product Details'),
})

onMounted(async () => {
  await fetchProduct(route.params.id)
  if (product.value) {
    if (product.value.sizes?.length) selectedSize.value = product.value.sizes[0]
    if (product.value.colors?.length) selectedColor.value = product.value.colors[0]

    // Fetch related products
    try {
      const res = await ProductService.getAll({ categoryId: product.value.category_id, limit: 4 })
      relatedProducts.value = res.data.filter(p => p.id !== product.value.id)
    } catch {
      relatedProducts.value = []
    }
  }
})
</script>

<style scoped lang="scss">
.ta-product-detail {
  &__breadcrumb {
    padding: calc(var(--header-height) + var(--spacing-md)) 0 var(--spacing-sm);
    background: var(--color-bg-alt);
    border-bottom: 1px solid var(--color-border-light);

    @include respond-below(md) {
      padding-top: calc(var(--header-height-mobile) + var(--spacing-md));
    }
  }

  &__nav {
    @include flex(row, flex-start, center, 4px);
    font-size: 0.8rem;
    color: var(--color-text-muted);

    a {
      color: var(--color-text-secondary);
      text-decoration: none;

      &:hover { color: var(--color-primary); }
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-4xl);
    align-items: start;

    @include respond-below(lg) {
      gap: var(--spacing-2xl);
    }

    @include respond-below(md) {
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
    }
  }

  &__main-media {
    position: relative;
    aspect-ratio: 3 / 4;
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
  }

  &__main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__video-player {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__featured-tag {
    position: absolute;
    top: var(--spacing-md);
    left: var(--spacing-md);
    background: var(--color-primary);
    color: var(--color-accent);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    padding: 4px 10px;
  }

  &__thumbnails {
    @include flex(row, flex-start, center, var(--spacing-sm));
    margin-top: var(--spacing-md);
    overflow-x: auto;
  }

  &__thumb {
    @include button-reset;
    flex-shrink: 0;
    width: 72px;
    height: 96px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 2px solid transparent;
    transition: all var(--transition-fast);

    &--active {
      border-color: var(--color-accent);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &--video {
      background: var(--color-primary);
      @include flex-center;
      flex-direction: column;
    }
  }

  &__name {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 500;
    line-height: 1.15;
    margin-bottom: var(--spacing-xs);
  }

  &__price {
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--color-primary);
  }

  &__description {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xl);
  }

  &__pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  &__order-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 16px 24px;
    border-radius: var(--radius-full);
    background: #25D366;
    color: #ffffff;
    font-size: 1.05rem;
    font-weight: 600;
    text-decoration: none;
    box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
    transition: all var(--transition-base);

    &:hover {
      background: #1eb956;
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(37, 211, 102, 0.5);
    }
  }

  &__guarantees {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);
  }

  &__sku {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
}

.ta-stock-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-full);

  &--in {
    background: rgba(45, 106, 79, 0.1);
    color: #2d6a4f;
  }

  &--out {
    background: rgba(192, 57, 43, 0.1);
    color: #c0392b;
  }
}

.ta-size-pill {
  @include button-reset;
  min-width: 44px;
  height: 40px;
  padding-inline: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-accent);
  }

  &--active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #ffffff;
  }
}

.ta-color-pill {
  @include button-reset;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.15);
  }

  &--active {
    border-color: var(--color-accent);
    color: var(--color-primary);
    background: var(--color-accent-light);
  }
}

.ta-link-btn {
  @include button-reset;
  font-size: 0.78rem;
  color: var(--color-accent);
  font-weight: 600;
  display: inline-flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }
}
</style>

