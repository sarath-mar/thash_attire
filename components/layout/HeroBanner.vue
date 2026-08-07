<template>
  <section class="ta-hero">
    <div v-if="loading" class="ta-hero__skeleton">
      <div class="shimmer-loader w-100 h-100" />
    </div>

    <div v-else-if="bannerList.length" class="ta-hero__slider">
      <div
        v-for="(banner, index) in bannerList"
        :key="banner.id || index"
        class="ta-hero__slide"
        :class="{ 'ta-hero__slide--active': index === activeIndex }"
      >
        <img
          :src="getBannerImage(banner)"
          :alt="banner.title"
          class="ta-hero__image"
        >
        <div class="ta-hero__overlay" />
        <div class="ta-hero__content container">
          <span v-if="banner.subtitle" class="eyebrow text-gold">{{ banner.subtitle }}</span>
          <h1 class="ta-hero__title">{{ banner.title }}</h1>
          <p v-if="banner.description" class="ta-hero__description">{{ banner.description }}</p>
          <div class="ta-hero__actions">
            <AppButton
              v-if="banner.link"
              premium
              :to="banner.link"
              class="ta-hero__cta"
            >
              {{ banner.button_text || 'Explore Collection' }}
            </AppButton>
            <AppButton
              outline
              :href="whatsappLink"
              target="_blank"
              class="ta-hero__cta-secondary"
            >
              <v-icon icon="mdi-whatsapp" start size="18" />
              WhatsApp Concierge
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <button
        v-if="bannerList.length > 1"
        class="ta-hero__nav-arrow ta-hero__nav-arrow--prev"
        aria-label="Previous Slide"
        @click="prevSlide"
      >
        <v-icon icon="mdi-chevron-left" size="28" />
      </button>

      <button
        v-if="bannerList.length > 1"
        class="ta-hero__nav-arrow ta-hero__nav-arrow--next"
        aria-label="Next Slide"
        @click="nextSlide"
      >
        <v-icon icon="mdi-chevron-right" size="28" />
      </button>

      <div v-if="bannerList.length > 1" class="ta-hero__dots">
        <button
          v-for="(_, index) in bannerList"
          :key="index"
          class="ta-hero__dot"
          :class="{ 'ta-hero__dot--active': index === activeIndex }"
          @click="activeIndex = index"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { DefaultImages } from '~/constants/defaults.js'
import { StorageService } from '~/services/StorageService.js'
import { StorageBucket } from '~/enums/storageBucket.js'
import { getWhatsAppLink } from '~/helpers/phone.js'

const config = useRuntimeConfig()
const { banners, loading, fetchActiveBanners } = useBanners()
const activeIndex = ref(0)

const whatsappLink = computed(() =>
  getWhatsAppLink(config.public.whatsappNumber, 'Hi Thash Attire! I am interested in your luxury couture collection.'),
)

const bannerList = computed(() => {
  if (banners.value && banners.value.length > 0) return banners.value
  return [
    {
      id: 'ban-default-1',
      title: 'The Royal Couture Collection',
      subtitle: 'Artisanal Kanjivaram & Pure Silks',
      description: 'Handcrafted by India\'s master weavers, designed for timeless grace.',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=85',
      link: '/products',
      button_text: 'Shop Collection',
    },
    {
      id: 'ban-default-2',
      title: 'Modern Festive Elegance',
      subtitle: 'Bespoke Indo-Western Gowns & Anarkalis',
      description: 'Sophisticated silhouettes embellished with hand mirror and pearl work.',
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1800&q=85',
      link: '/products',
      button_text: 'Discover Gowns',
    },
  ]
})

const getBannerImage = (banner) => {
  if (!banner.image_url) return DefaultImages.BANNER
  if (banner.image_url.startsWith('http')) return banner.image_url
  return StorageService.getPublicUrl(StorageBucket.BANNERS, banner.image_url) || DefaultImages.BANNER
}

const nextSlide = () => {
  activeIndex.value = (activeIndex.value + 1) % bannerList.value.length
}

const prevSlide = () => {
  activeIndex.value = (activeIndex.value - 1 + bannerList.value.length) % bannerList.value.length
}

let timer = null
onMounted(async () => {
  await fetchActiveBanners()
  timer = setInterval(nextSlide, 6500)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
.ta-hero {
  position: relative;
  height: 88vh;
  min-height: 560px;
  max-height: 900px;
  overflow: hidden;
  // margin-top: calc(var(--header-height) + 28px);

  @include respond-below(md) {
    height: 75vh;
    min-height: 480px;
    // margin-top: calc(var(--header-height-mobile) + 24px);
  }

  &__slider,
  &__skeleton {
    height: 100%;
  }

  &__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1);

    &--active {
      opacity: 1;

      .ta-hero__image {
        transform: scale(1.04);
      }
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 7000ms ease-out;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(18, 18, 18, 0.2) 0%, rgba(18, 18, 18, 0.72) 100%);
    z-index: 1;
  }

  &__content {
    position: absolute;
    bottom: 16%;
    left: 0;
    right: 0;
    z-index: 2;
    color: var(--color-text-inverse);
    animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: clamp(2.4rem, 5.5vw, 4.2rem);
    font-weight: 500;
    line-height: 1.12;
    color: #ffffff;
    margin-bottom: var(--spacing-md);
    max-width: 680px;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  &__description {
    font-size: clamp(0.95rem, 1.8vw, 1.15rem);
    line-height: 1.6;
    max-width: 520px;
    margin-bottom: var(--spacing-xl);
    color: #f0eae1;
    font-weight: 300;
  }

  &__actions {
    @include flex(row, center, flex-start, var(--spacing-md));

    @include respond-below(sm) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__cta-secondary {
    border-color: rgba(255, 255, 255, 0.7) !important;
    color: #ffffff !important;
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(8px);

    &:hover {
      background: rgba(255, 255, 255, 0.25) !important;
      border-color: #ffffff !important;
    }
  }

  &__nav-arrow {
    @include button-reset;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 4;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    background: rgba(18, 18, 18, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    @include flex-center;
    transition: all var(--transition-base);

    &:hover {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: #121212;
    }

    &--prev { left: var(--spacing-lg); }
    &--next { right: var(--spacing-lg); }

    @include respond-below(md) {
      display: none;
    }
  }

  &__dots {
    position: absolute;
    bottom: var(--spacing-lg);
    left: 50%;
    transform: translateX(-50%);
    @include flex(row, center, center, var(--spacing-sm));
    z-index: 3;
  }

  &__dot {
    @include button-reset;
    width: 24px;
    height: 3px;
    background: rgba(255, 255, 255, 0.35);
    @include transition(background, transform);

    &--active {
      background: var(--color-accent);
      width: 40px;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

