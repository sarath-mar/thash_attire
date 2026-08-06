<template>
  <section class="ta-hero">
    <div v-if="loading" class="ta-hero__skeleton">
      <v-skeleton-loader type="image" height="80vh" />
    </div>

    <div v-else-if="banners.length" class="ta-hero__slider">
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
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
          <p v-if="banner.subtitle" class="ta-hero__subtitle">{{ banner.subtitle }}</p>
          <h1 class="ta-hero__title">{{ banner.title }}</h1>
          <p v-if="banner.description" class="ta-hero__description">{{ banner.description }}</p>
          <AppButton
            v-if="banner.link"
            premium
            :to="banner.link"
            class="ta-hero__cta"
          >
            {{ banner.button_text || 'Shop Now' }}
          </AppButton>
        </div>
      </div>

      <div v-if="banners.length > 1" class="ta-hero__dots">
        <button
          v-for="(_, index) in banners"
          :key="index"
          class="ta-hero__dot"
          :class="{ 'ta-hero__dot--active': index === activeIndex }"
          @click="activeIndex = index"
        />
      </div>
    </div>

    <div v-else class="ta-hero__fallback">
      <div class="ta-hero__overlay" />
      <div class="ta-hero__content container">
        <p class="ta-hero__subtitle">New Collection 2026</p>
        <h1 class="ta-hero__title">Elegance Redefined</h1>
        <p class="ta-hero__description">
          Discover our curated collection of premium women's fashion,
          crafted for the modern woman who values timeless style.
        </p>
        <AppButton premium to="/products" class="ta-hero__cta">
          Explore Collection
        </AppButton>
      </div>
    </div>
  </section>
</template>

<script setup>
import { DefaultImages } from '~/constants/defaults.js'
import { StorageService } from '~/services/StorageService.js'
import { StorageBucket } from '~/enums/storageBucket.js'

const { banners, loading, fetchActiveBanners } = useBanners()
const activeIndex = ref(0)

const getBannerImage = (banner) => {
  if (!banner.image_url) return DefaultImages.BANNER
  if (banner.image_url.startsWith('http')) return banner.image_url
  return StorageService.getPublicUrl(StorageBucket.BANNERS, banner.image_url) || DefaultImages.BANNER
}

onMounted(async () => {
  await fetchActiveBanners()

  if (banners.value.length > 1) {
    setInterval(() => {
      activeIndex.value = (activeIndex.value + 1) % banners.value.length
    }, 6000)
  }
})
</script>

<style scoped lang="scss">
.ta-hero {
  position: relative;
  height: 85vh;
  min-height: 500px;
  max-height: 800px;
  overflow: hidden;

  @include respond-below(md) {
    height: 70vh;
    min-height: 400px;
  }

  &__slider,
  &__fallback,
  &__skeleton {
    height: 100%;
  }

  &__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    @include transition(opacity, var(--transition-slower));

    &--active {
      opacity: 1;
    }
  }

  &__fallback {
    position: relative;
    background: linear-gradient(135deg, var(--color-bg-alt) 0%, var(--color-accent-light) 100%);
  }

  &__image {
    @include image-cover;
  }

  &__overlay {
    @include overlay(0.35);
    z-index: 1;
  }

  &__content {
    position: absolute;
    bottom: 15%;
    left: 0;
    right: 0;
    z-index: 2;
    color: var(--color-text-inverse);
    animation: fadeInUp 0.8s ease forwards;
  }

  &__subtitle {
    font-size: $font-size-sm;
    letter-spacing: $letter-spacing-widest;
    text-transform: uppercase;
    margin-bottom: var(--spacing-md);
    opacity: 0.9;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: $font-weight-medium;
    line-height: $line-height-tight;
    margin-bottom: var(--spacing-lg);
    max-width: 600px;
  }

  &__description {
    font-size: $font-size-base;
    line-height: $line-height-relaxed;
    max-width: 480px;
    margin-bottom: var(--spacing-xl);
    opacity: 0.9;
  }

  &__dots {
    position: absolute;
    bottom: var(--spacing-xl);
    left: 50%;
    transform: translateX(-50%);
    @include flex(row, center, center, var(--spacing-sm));
    z-index: 3;
  }

  &__dot {
    @include button-reset;
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.4);
    @include transition(background, transform);

    &--active {
      background: var(--color-text-inverse);
      transform: scale(1.3);
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
