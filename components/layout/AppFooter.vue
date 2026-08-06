<template>
  <footer class="ta-footer">
    <div class="container">
      <div class="ta-footer__grid">
        <div class="ta-footer__brand">
          <h3 class="ta-footer__logo">Thash Attire</h3>
          <p class="ta-footer__tagline">
            Premium women's fashion crafted with elegance and care.
            Discover timeless pieces for the modern woman.
          </p>
          <div class="ta-footer__social">
            <a
              v-if="instagramUrl"
              :href="instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="ta-footer__social-link"
              aria-label="Instagram"
            >
              <v-icon icon="mdi-instagram" size="22" />
            </a>
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="ta-footer__social-link"
              aria-label="WhatsApp"
            >
              <v-icon icon="mdi-whatsapp" size="22" />
            </a>
          </div>
        </div>

        <div class="ta-footer__links">
          <h4 class="ta-footer__heading">Quick Links</h4>
          <ul>
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink :to="item.to" class="ta-footer__link">{{ item.title }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="ta-footer__contact">
          <h4 class="ta-footer__heading">Get in Touch</h4>
          <p class="ta-footer__contact-text">
            Have a question about our collection? Reach out to us on WhatsApp and we'll be happy to help.
          </p>
          <AppButton
            premium
            size="small"
            prepend-icon="mdi-whatsapp"
            :href="whatsappLink"
            target="_blank"
          >
            Chat on WhatsApp
          </AppButton>
        </div>
      </div>

      <div class="ta-footer__bottom">
        <p>&copy; {{ currentYear }} Thash Attire. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { PublicNavItems } from '~/constants/navigation.js'
import { getWhatsAppLink } from '~/helpers/phone.js'

const config = useRuntimeConfig()
const navItems = PublicNavItems
const currentYear = new Date().getFullYear()

const whatsappLink = computed(() =>
  getWhatsAppLink(config.public.whatsappNumber, 'Hi! I\'d like to know more about Thash Attire.'),
)

const instagramUrl = computed(() => config.public.instagramUrl)
</script>

<style scoped lang="scss">
.ta-footer {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding-top: var(--spacing-3xl);

  &__grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr;
    gap: var(--spacing-2xl);
    padding-bottom: var(--spacing-2xl);

    @include respond-below(lg) {
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
    }
  }

  &__logo {
    font-family: var(--font-heading);
    font-size: $font-size-2xl;
    font-weight: $font-weight-medium;
    margin-bottom: var(--spacing-md);
  }

  &__tagline {
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;
    opacity: $opacity-muted;
    max-width: 320px;
    margin-bottom: var(--spacing-lg);
  }

  &__social {
    @include flex(row, flex-start, center, var(--spacing-md));
  }

  &__social-link {
    @include flex-center;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-full);
    color: var(--color-text-inverse);
    @include transition(background, border-color);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  &__heading {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    letter-spacing: $letter-spacing-wider;
    text-transform: uppercase;
    margin-bottom: var(--spacing-lg);
    opacity: $opacity-muted;
  }

  &__link {
    display: block;
    font-size: $font-size-sm;
    padding: var(--spacing-xs) 0;
    opacity: $opacity-muted;
    @include transition(opacity);

    &:hover {
      opacity: 1;
    }
  }

  &__contact-text {
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;
    opacity: $opacity-muted;
    margin-bottom: var(--spacing-lg);
    max-width: 280px;
  }

  &__bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: var(--spacing-lg) 0;
    text-align: center;

    p {
      font-size: $font-size-xs;
      opacity: $opacity-subtle;
    }
  }
}
</style>
