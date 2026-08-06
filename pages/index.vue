<template>
  <div>
    <HeroBanner />

    <FeaturedProducts
      title="Featured Collection"
      subtitle="Handpicked pieces from our latest collection"
      :products="featuredProducts"
      :loading="featuredLoading"
    />

    <section class="ta-about-preview section">
      <div class="container ta-about-preview__grid">
        <div class="ta-about-preview__content">
          <div class="divider" style="margin-inline: 0;" />
          <h2 class="ta-about-preview__title">Crafted with Passion</h2>
          <p class="ta-about-preview__text">
            At Thash Attire, we believe every woman deserves to feel confident and beautiful.
            Our collections blend contemporary design with timeless elegance,
            using premium fabrics and meticulous craftsmanship.
          </p>
          <AppButton outline to="/about">
            Our Story
          </AppButton>
        </div>
        <div class="ta-about-preview__visual">
          <div class="ta-about-preview__image-placeholder">
            <v-icon icon="mdi-hanger" size="64" color="grey-lighten-1" />
          </div>
        </div>
      </div>
    </section>

    <FeaturedProducts
      title="Trending Now"
      subtitle="Most loved pieces by our customers"
      :products="trendingProducts"
      :loading="trendingLoading"
    />

    <section class="ta-cta section">
      <div class="container ta-cta__content">
        <h2 class="ta-cta__title">Ready to Find Your Perfect Look?</h2>
        <p class="ta-cta__text">
          Browse our full collection or reach out to us on WhatsApp for personalized styling advice.
        </p>
        <div class="ta-cta__actions">
          <AppButton premium to="/products">
            Shop Collection
          </AppButton>
          <AppButton outline :href="whatsappLink" target="_blank">
            <v-icon icon="mdi-whatsapp" start size="18" />
            WhatsApp Us
          </AppButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { getWhatsAppLink } from '~/helpers/phone.js'

useHead({ title: PageTitles.HOME })

import { ProductService } from '~/services/ProductService.js'

const config = useRuntimeConfig()
const featuredProducts = ref([])
const trendingProducts = ref([])
const featuredLoading = ref(false)
const trendingLoading = ref(false)

const whatsappLink = computed(() =>
  getWhatsAppLink(config.public.whatsappNumber, 'Hi! I\'d like to browse your collection.'),
)

onMounted(async () => {
  featuredLoading.value = true
  trendingLoading.value = true

  try {
    const [featured, trending] = await Promise.all([
      ProductService.getFeatured(8),
      ProductService.getTrending(8),
    ])
    featuredProducts.value = featured.data
    trendingProducts.value = trending.data
  } catch {
    featuredProducts.value = []
    trendingProducts.value = []
  } finally {
    featuredLoading.value = false
    trendingLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.ta-about-preview {
  background: var(--color-bg-alt);

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-3xl);
    align-items: center;

    @include respond-below(md) {
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
    }
  }

  &__title {
    @include heading($font-size-3xl);
    margin-bottom: var(--spacing-lg);
  }

  &__text {
    @include body-text($font-size-base);
    margin-bottom: var(--spacing-xl);
    max-width: 480px;
  }

  &__visual {
    aspect-ratio: 4 / 5;
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  &__image-placeholder {
    @include flex-center;
    width: 100%;
    height: 100%;
    background: var(--color-border-light);
  }
}

.ta-cta {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  text-align: center;

  &__content {
    max-width: 600px;
    margin-inline: auto;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: $font-size-3xl;
    margin-bottom: var(--spacing-md);
  }

  &__text {
    font-size: $font-size-base;
    opacity: $opacity-muted;
    margin-bottom: var(--spacing-xl);
    line-height: $line-height-relaxed;
  }

  &__actions {
    @include flex(row, center, center, var(--spacing-md));

    @include respond-below(sm) {
      flex-direction: column;
    }
  }
}
</style>
