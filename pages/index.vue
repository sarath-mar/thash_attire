<template>
  <div class="ta-home">
    <!-- Hero Banner Slider -->
    <LayoutHeroBanner />

    <!-- Categories Grid Showcase -->
    <section class="ta-categories section">
      <div class="container">
        <div class="text-center mb-10">
          <span class="eyebrow">CURATED SILHOUETTES</span>
          <h2 class="section-title">Explore Collections</h2>
          <div class="divider" />
          <p class="section-subtitle">Discover handcrafted sarees, gowns, and bespoke couture for every occasion</p>
        </div>

        <div class="ta-categories__grid">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/products?category=${cat.id}`"
            class="ta-category-card"
          >
            <img :src="cat.image_url" :alt="cat.name" class="ta-category-card__image" loading="lazy">
            <div class="ta-category-card__overlay">
              <span class="ta-category-card__count">COUTURE</span>
              <h3 class="ta-category-card__title">{{ cat.name }}</h3>
              <span class="ta-category-card__link">
                View Collection <v-icon icon="mdi-arrow-right" size="16" class="ms-1" />
              </span>
            </div>
          </NuxtLink>
        </div>

      </div>
    </section>

    <!-- Featured Collection -->
    <FeaturedProducts
      title="Royal Featured Collection"
      subtitle="Handpicked statement pieces from our latest artisanal drop"
      :products="featuredProducts"
      :loading="featuredLoading"
    />

    <!-- Artisanal Craftsmanship Story -->
    <section class="ta-story section">
      <div class="container ta-story__grid">
        <div class="ta-story__visual">
          <img
            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85"
            alt="Thash Attire Craftsmanship"
            class="ta-story__image"
          >
          <div class="ta-story__badge-floating">
            <v-icon icon="mdi-seal" color="#C5A059" size="28" />
            <div>
              <span class="d-block font-weight-bold text-caption">100% HANDWOVEN</span>
              <span class="text-micro text-muted">Master Artisans across India</span>
            </div>
          </div>
        </div>

        <div class="ta-story__content">
          <span class="eyebrow">OUR HERITAGE</span>
          <h2 class="ta-story__title">Crafted with Passion & Precision</h2>
          <div class="divider ms-0 mb-6" />
          <p class="ta-story__text">
            At <strong>Thash Attire</strong>, every garment tells a story of heritage weaving, delicate hand embroidery, and modern silhouette tailoring.
            We work directly with master weavers to craft timeless silk sarees, exquisite Anarkalis, and bridal couture designed to empower your unique grace.
          </p>

          <div class="ta-story__features">
            <div class="ta-story__feature">
              <v-icon icon="mdi-sparkles" color="#C5A059" size="22" class="me-3" />
              <div>
                <h4 class="font-weight-semibold text-body-2">Pure Zari & Silk Fabrics</h4>
                <p class="text-caption text-secondary">Authentic Kanjivaram, Chanderi, and Pashmina threads.</p>
              </div>
            </div>
            <div class="ta-story__feature">
              <v-icon icon="mdi-content-cut" color="#C5A059" size="22" class="me-3" />
              <div>
                <h4 class="font-weight-semibold text-body-2">Custom Tailoring Advice</h4>
                <p class="text-caption text-secondary">Bespoke fitting guidance directly on WhatsApp.</p>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <AppButton premium to="/about">
              Discover Our Story
            </AppButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Trending Collection -->
    <FeaturedProducts
      title="Trending Bestsellers"
      subtitle="Most loved creations sought after by women of distinction"
      :products="trendingProducts"
      :loading="trendingLoading"
    />

    <!-- Client Testimonials -->
    <section class="ta-testimonials section">
      <div class="container">
        <div class="text-center mb-10">
          <span class="eyebrow">CLIENT STORIES</span>
          <h2 class="section-title">Words of Elegance</h2>
          <div class="divider" />
        </div>

        <div class="ta-testimonials__grid">
          <div v-for="(t, idx) in testimonials" :key="idx" class="ta-testimonial-card">
            <div class="ta-testimonial-card__stars">
              <v-icon v-for="s in 5" :key="s" icon="mdi-star" color="#C5A059" size="16" />
            </div>
            <p class="ta-testimonial-card__quote">"{{ t.quote }}"</p>
            <div class="ta-testimonial-card__author">
              <span class="ta-testimonial-card__name">{{ t.author }}</span>
              <span class="ta-testimonial-card__location">{{ t.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Instagram Gallery Feed Mockup -->
    <section class="ta-instagram section pt-0">
      <div class="container">
        <div class="text-center mb-8">
          <span class="eyebrow">@THASHATTIRE</span>
          <h2 class="section-title">Follow Us on Instagram</h2>
          <p class="section-subtitle">Tag #ThashAttire to feature in our luxury style journal</p>
        </div>

        <div class="ta-instagram__grid">
          <a
            v-for="(img, idx) in instaImages"
            :key="idx"
            :href="instagramUrl"
            target="_blank"
            class="ta-instagram__item"
          >
            <img :src="img" alt="Instagram Look" class="ta-instagram__img" loading="lazy">
            <div class="ta-instagram__overlay">
              <v-icon icon="mdi-instagram" size="32" color="#ffffff" />
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="ta-cta section">
      <div class="container ta-cta__content">
        <span class="eyebrow text-gold mb-2">PERSONALIZED STYLING</span>
        <h2 class="ta-cta__title">Looking for a Bespoke Custom Piece?</h2>
        <p class="ta-cta__text">
          Connect directly with our head designer via WhatsApp for direct ordering, custom sizing, and style consultations.
        </p>
        <div class="ta-cta__actions">
          <AppButton premium to="/products" class="px-8">
            Browse Full Catalog
          </AppButton>
          <AppButton outline :href="whatsappLink" target="_blank" class="ta-cta__wa-btn">
            <v-icon icon="mdi-whatsapp" start size="20" />
            Chat on WhatsApp
          </AppButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { getWhatsAppLink } from '~/helpers/phone.js'
import { CategoryService } from '~/services/CategoryService.js'
import { ProductService } from '~/services/ProductService.js'

useHead({ title: PageTitles.HOME })

const config = useRuntimeConfig()
const featuredProducts = ref([])
const trendingProducts = ref([])
const categories = ref([])
const featuredLoading = ref(false)
const trendingLoading = ref(false)

const whatsappLink = computed(() =>
  getWhatsAppLink(config.public.whatsappNumber, 'Hi Thash Attire! I would like to explore your latest collection.'),
)

const instagramUrl = computed(() => config.public.instagramUrl || 'https://instagram.com/thashattire')

const testimonials = [
  {
    quote: 'The Kanjivaram silk saree exceeded all my expectations. The zari sheen and drape feel genuinely regal.',
    author: 'Ananya R.',
    location: 'Chennai',
  },
  {
    quote: 'Ordered my reception Anarkali through WhatsApp. The team provided custom length advice and express delivery!',
    author: 'Priya Sharma',
    location: 'Bengaluru',
  },
  {
    quote: 'Thash Attire offers the exact balance of traditional craftsmanship and sleek modern silhouettes.',
    author: 'Meera V.',
    location: 'Mumbai',
  },
]

const instaImages = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
]

onMounted(async () => {
  featuredLoading.value = true
  trendingLoading.value = true

  try {
    const [featured, trending, cats] = await Promise.all([
      ProductService.getFeatured(8),
      ProductService.getTrending(8),
      CategoryService.getAll(),
    ])
    featuredProducts.value = featured.data
    trendingProducts.value = trending.data
    categories.value = cats
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
.ta-categories {
  background: var(--color-bg);

  &__grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-lg);

    @include respond-below(xl) {
      grid-template-columns: repeat(3, 1fr);
    }

    @include respond-below(md) {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }
  }
}

.ta-category-card {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  display: block;
  text-decoration: none;
  color: inherit;

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 600ms ease;
  }

  &:hover &__image {
    transform: scale(1.08);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(18, 18, 18, 0.1) 30%, rgba(18, 18, 18, 0.85) 100%);
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    color: #ffffff;
  }

  &__count {
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: var(--color-accent);
    font-weight: 600;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }

  &__link {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #e6dfd5;
    display: inline-flex;
    align-items: center;
    transition: color var(--transition-fast);
  }

  &:hover &__link {
    color: var(--color-accent);
  }
}

.ta-story {
  background: var(--color-bg-alt);

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-4xl);
    align-items: center;

    @include respond-below(md) {
      grid-template-columns: 1fr;
      gap: var(--spacing-2xl);
    }
  }

  &__visual {
    position: relative;
    aspect-ratio: 4 / 5;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-xl);
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__badge-floating {
    position: absolute;
    bottom: var(--spacing-lg);
    left: var(--spacing-lg);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-gold);
    @include flex-center;
    gap: var(--spacing-sm);
  }

  &__title {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 3.5vw, 3rem);
    font-weight: 500;
    line-height: 1.2;
    margin-bottom: var(--spacing-md);
  }

  &__text {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xl);
  }

  &__features {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  &__feature {
    display: flex;
    align-items: flex-start;
  }
}

.ta-testimonials {
  background: var(--color-bg);

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-xl);

    @include respond-below(md) {
      grid-template-columns: 1fr;
    }
  }
}

.ta-testimonial-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-border-gold);
    box-shadow: var(--shadow-gold);
  }

  &__stars {
    display: flex;
    gap: 4px;
    margin-bottom: var(--spacing-md);
  }

  &__quote {
    font-family: var(--font-heading);
    font-size: 1.1rem;
    font-style: italic;
    line-height: 1.6;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
  }

  &__author {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-weight: 600;
    font-size: 0.88rem;
  }

  &__location {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
}

.ta-instagram {
  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-md);

    @include respond-below(sm) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__item {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: var(--radius-md);
    overflow: hidden;
    display: block;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(18, 18, 18, 0.45);
    @include flex-center;
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  &__item:hover &__img {
    transform: scale(1.08);
  }

  &__item:hover &__overlay {
    opacity: 1;
  }
}

.ta-cta {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  text-align: center;
  border-top: 1px solid var(--color-border-gold);

  &__content {
    max-width: 680px;
    margin-inline: auto;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: clamp(2.2rem, 4vw, 3.2rem);
    font-weight: 500;
    margin-bottom: var(--spacing-md);
    color: #ffffff;
  }

  &__text {
    font-size: 1.05rem;
    color: #c4bcae;
    margin-bottom: var(--spacing-2xl);
    line-height: 1.6;
  }

  &__actions {
    @include flex(row, center, center, var(--spacing-md));

    @include respond-below(sm) {
      flex-direction: column;
    }
  }

  &__wa-btn {
    border-color: rgba(37, 211, 102, 0.6) !important;
    color: #ffffff !important;
    background: rgba(37, 211, 102, 0.15) !important;

    &:hover {
      background: #25D366 !important;
      color: #ffffff !important;
    }
  }
}
</style>

