<template>
  <header class="ta-header-wrapper.0">
    <!-- Top Luxury Announcement Bar -->
    <div class="ta-announcement">
      <div class="container ta-announcement__content">
        <span class="ta-announcement__text">
          <v-icon icon="mdi-sparkles" size="14" class="me-1" color="#C5A059" />
          Free Express Shipping on Orders Above ₹4,999 | Artisanal Couture
        </span>
        <a :href="whatsappLink" target="_blank" class="ta-announcement__link">
          <v-icon icon="mdi-whatsapp" size="14" class="me-1" />
          WhatsApp Concierge
        </a>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <div class="ta-header" :class="{ 'ta-header--scrolled': isScrolled }">
      <div class="ta-header__container container">
        <!-- Logo Branding -->
        <NuxtLink to="/" class="ta-header__logo">
          <span class="ta-header__logo-brand">THASH ATTIRE</span>
          <span class="ta-header__logo-sub">HAUTE COUTURE</span>
        </NuxtLink>

        <!-- Navigation Links -->
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

        <!-- Action Items -->
        <div class="ta-header__actions">
          <NuxtLink to="/products" class="ta-header__action-btn" aria-label="Search Collection">
            <v-icon icon="mdi-magnify" size="22" />
          </NuxtLink>

          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="ta-header__whatsapp-btn"
            aria-label="Direct WhatsApp Order"
          >
            <v-icon icon="mdi-whatsapp" size="18" class="me-1" />
            <span class="d-none d-sm-inline text-caption font-weight-medium">Order via WhatsApp</span>
          </a>

          <button
            class="ta-header__menu-toggle"
            aria-label="Toggle menu"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <v-icon :icon="mobileMenuOpen ? 'mdi-close' : 'mdi-menu'" size="26" />
          </button>
        </div>
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
  getWhatsAppLink(config.public.whatsappNumber, 'Hi Thash Attire! I would like to explore your latest collection.'),
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
.ta-header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
}

.ta-announcement {
  background: var(--color-primary);
  color: #e6dfd5;
  font-size: 0.72rem;
  letter-spacing: $letter-spacing-wider;
  padding-block: 6px;
  border-bottom: 1px solid rgba(197, 160, 89, 0.2);

  &__content {
    @include flex-between;

    @include respond-below(sm) {
      justify-content: center;
    }
  }

  &__text {
    @include flex-center;
    font-weight: $font-weight-medium;
    text-transform: uppercase;
  }

  &__link {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: $font-weight-semibold;
    @include flex-center;
    transition: color var(--transition-fast);

    &:hover {
      color: #ffffff;
    }

    @include respond-below(sm) {
      display: none;
    }
  }
}

.ta-header {
  height: var(--header-height);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border-bottom: 1px solid var(--color-border-light);
  @include transition(background, box-shadow);

  &--scrolled {
    box-shadow: var(--shadow-md);
    border-color: var(--color-border-gold);
    background: rgba(255, 255, 255, 0.94);
  }

  &__container {
    @include flex-between;
    height: 100%;
  }

  &__logo {
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__logo-brand {
    font-family: var(--font-heading);
    font-size: 1.45rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--color-primary);
    line-height: 1.1;
  }

  &__logo-sub {
    font-family: var(--font-body);
    font-size: 0.58rem;
    font-weight: $font-weight-semibold;
    letter-spacing: 0.35em;
    color: var(--color-accent);
    text-transform: uppercase;
  }

  &__nav {
    @include flex(row, center, center, var(--spacing-xl));

    @include respond-below(lg) {
      position: fixed;
      top: 96px;
      left: 0;
      right: 0;
      bottom: 0;
      flex-direction: column;
      justify-content: flex-start;
      padding-top: var(--spacing-3xl);
      gap: var(--spacing-xl);
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
    position: relative;
    font-size: 0.78rem;
    font-weight: $font-weight-medium;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    padding-block: 6px;
    @include transition(color);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--color-accent-gold-grad);
      transition: width var(--transition-base);
    }

    &:hover,
    &.router-link-active {
      color: var(--color-primary);

      &::after {
        width: 100%;
      }
    }

    @include respond-below(lg) {
      font-size: $font-size-md;
    }
  }

  &__actions {
    @include flex(row, center, center, var(--spacing-sm));
  }

  &__action-btn {
    @include flex-center;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-full);
    color: var(--color-primary);
    transition: all var(--transition-fast);

    &:hover {
      background: var(--color-bg-alt);
      color: var(--color-accent);
    }
  }

  &__whatsapp-btn {
    @include flex-center;
    padding: 8px 16px;
    border-radius: var(--radius-full);
    background: #25D366;
    color: #ffffff;
    text-decoration: none;
    font-weight: $font-weight-medium;
    box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
    transition: all var(--transition-base);

    &:hover {
      background: #1eb956;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(37, 211, 102, 0.4);
    }
  }

  &__menu-toggle {
    @include button-reset;
    @include flex-center;
    width: 40px;
    height: 40px;
    color: var(--color-primary);

    @include respond-to(lg) {
      display: none;
    }
  }
}
</style>

