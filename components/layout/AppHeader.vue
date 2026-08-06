<template>
  <header class="ta-header" :class="{ 'ta-header--scrolled': isScrolled }">
    <div class="ta-header__container container">
      <NuxtLink to="/" class="ta-header__logo">
        <span class="ta-header__logo-text">Thash Attire</span>
      </NuxtLink>

      <nav class="ta-header__nav" :class="{ 'ta-header__nav--open': mobileMenuOpen }">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="ta-header__nav-link"
          @click="mobileMenuOpen = false"
        >
          {{ item.title }}
        </NuxtLink>
      </nav>

      <div class="ta-header__actions">
        <a
          :href="whatsappLink"
          target="_blank"
          rel="noopener noreferrer"
          class="ta-header__whatsapp"
          aria-label="Contact on WhatsApp"
        >
          <v-icon icon="mdi-whatsapp" size="22" />
        </a>

        <button
          class="ta-header__menu-toggle"
          aria-label="Toggle menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <v-icon :icon="mobileMenuOpen ? 'mdi-close' : 'mdi-menu'" size="24" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { PublicNavItems } from '~/constants/navigation.js'
import { getWhatsAppLink } from '~/helpers/phone.js'

const config = useRuntimeConfig()
const navItems = PublicNavItems
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const whatsappLink = computed(() =>
  getWhatsAppLink(config.public.whatsappNumber, 'Hi! I\'m interested in your collection.'),
)

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
})
</script>

<style scoped lang="scss">
.ta-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  z-index: var(--z-fixed);
  @include transition(background, box-shadow);

  &--scrolled {
    box-shadow: var(--shadow-sm);
  }

  &__container {
    @include flex-between;
    height: 100%;
  }

  &__logo {
    text-decoration: none;
  }

  &__logo-text {
    font-family: var(--font-heading);
    font-size: $font-size-xl;
    font-weight: $font-weight-medium;
    letter-spacing: $letter-spacing-wide;
    color: var(--color-text-primary);
  }

  &__nav {
    @include flex(row, center, center, var(--spacing-xl));

    @include respond-below(lg) {
      position: fixed;
      top: var(--header-height-mobile);
      left: 0;
      right: 0;
      bottom: 0;
      flex-direction: column;
      justify-content: flex-start;
      padding-top: var(--spacing-2xl);
      gap: var(--spacing-lg);
      background: var(--color-surface);
      transform: translateX(100%);
      @include transition(transform);
      z-index: var(--z-modal);

      &--open {
        transform: translateX(0);
      }
    }
  }

  &__nav-link {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    letter-spacing: $letter-spacing-wider;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    @include transition(color);

    &:hover,
    &.router-link-active {
      color: var(--color-text-primary);
    }

    @include respond-below(lg) {
      font-size: $font-size-lg;
    }
  }

  &__actions {
    @include flex(row, center, center, var(--spacing-md));
  }

  &__whatsapp {
    @include flex-center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    color: #25D366;
    @include transition(background);

    &:hover {
      background: rgba(37, 211, 102, 0.1);
    }
  }

  &__menu-toggle {
    @include button-reset;
    @include flex-center;
    width: 40px;
    height: 40px;

    @include respond-to(lg) {
      display: none;
    }
  }

  @include respond-below(lg) {
    height: var(--header-height-mobile);
  }
}
</style>
