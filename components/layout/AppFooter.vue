<template>
  <footer class="ta-footer">
    <div class="container">
      <div class="ta-footer__grid">
        <!-- Brand Info -->
        <div class="ta-footer__brand">
          <NuxtLink to="/" class="ta-footer__logo-group">
            <span class="ta-footer__logo">THASH ATTIRE</span>
            <span class="ta-footer__sub">BOUTIQUE HAUTE COUTURE</span>
          </NuxtLink>
          <p class="ta-footer__tagline">
            Celebrating the heritage of Indian craftsmanship with modern elegance.
            Curated silk sarees, designer gowns, and bespoke bridal wear.
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
              <v-icon icon="mdi-instagram" size="20" />
            </a>
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="ta-footer__social-link"
              aria-label="WhatsApp"
            >
              <v-icon icon="mdi-whatsapp" size="20" />
            </a>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="ta-footer__links">
          <h4 class="ta-footer__heading">Navigation</h4>
          <ul>
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink :to="item.to" class="ta-footer__link">{{ item.title }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Categories -->
        <div class="ta-footer__links">
          <h4 class="ta-footer__heading">Collections</h4>
          <ul>
            <li><NuxtLink to="/products?category=cat-001" class="ta-footer__link">Silk Sarees</NuxtLink></li>
            <li><NuxtLink to="/products?category=cat-002" class="ta-footer__link">Designer Kurtis</NuxtLink></li>
            <li><NuxtLink to="/products?category=cat-003" class="ta-footer__link">Indo-Western Gowns</NuxtLink></li>
            <li><NuxtLink to="/products?category=cat-005" class="ta-footer__link">Bridal Couture</NuxtLink></li>
          </ul>
        </div>

        <!-- WhatsApp Direct Orders -->
        <div class="ta-footer__contact">
          <h4 class="ta-footer__heading">Boutique Concierge</h4>
          <p class="ta-footer__contact-text">
            Personalized sizing advice & custom orders via WhatsApp direct line.
          </p>
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="ta-footer__wa-badge"
          >
            <v-icon icon="mdi-whatsapp" size="20" class="me-2" color="#25D366" />
            <span>+91 98765 43210</span>
          </a>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="ta-footer__bottom">
        <p>&copy; {{ currentYear }} Thash Attire. All rights reserved. Handcrafted with care.</p>
        <NuxtLink to="/admin/login" class="ta-footer__admin-link">
          <v-icon icon="mdi-shield-account" size="14" class="me-1" />
          Admin Portal
        </NuxtLink>
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
  getWhatsAppLink(config.public.whatsappNumber, 'Hi Thash Attire! I would like to inquire about your collections.'),
)

const instagramUrl = computed(() => config.public.instagramUrl || 'https://instagram.com/thashattire')
</script>

<style scoped lang="scss">
.ta-footer {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding-top: var(--spacing-4xl);
  border-top: 1px solid rgba(197, 160, 89, 0.3);

  &__grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    gap: var(--spacing-2xl);
    padding-bottom: var(--spacing-3xl);

    @include respond-below(lg) {
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-xl);
    }

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }
  }

  &__logo-group {
    text-decoration: none;
    display: flex;
    flex-direction: column;
    margin-bottom: var(--spacing-md);
  }

  &__logo {
    font-family: var(--font-heading);
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: #ffffff;
  }

  &__sub {
    font-size: 0.55rem;
    letter-spacing: 0.3em;
    color: var(--color-accent);
    font-weight: 600;
  }

  &__tagline {
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;
    color: #b0a89e;
    max-width: 320px;
    margin-bottom: var(--spacing-lg);
  }

  &__social {
    @include flex(row, flex-start, center, var(--spacing-sm));
  }

  &__social-link {
    @include flex-center;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(197, 160, 89, 0.4);
    border-radius: var(--radius-full);
    color: var(--color-accent);
    @include transition(background, border-color);

    &:hover {
      background: var(--color-accent);
      color: #121212;
    }
  }

  &__heading {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-accent);
    margin-bottom: var(--spacing-lg);
  }

  &__link {
    display: block;
    font-size: $font-size-sm;
    padding: 6px 0;
    color: #c4bcae;
    text-decoration: none;
    @include transition(color, transform);

    &:hover {
      color: #ffffff;
      transform: translateX(3px);
    }
  }

  &__contact-text {
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;
    color: #b0a89e;
    margin-bottom: var(--spacing-lg);
  }

  &__wa-badge {
    display: inline-flex;
    align-items: center;
    padding: 10px 16px;
    border: 1px solid rgba(37, 211, 102, 0.4);
    border-radius: var(--radius-full);
    background: rgba(37, 211, 102, 0.1);
    color: #ffffff;
    font-weight: 500;
    font-size: 0.85rem;
    text-decoration: none;
    transition: all var(--transition-base);

    &:hover {
      background: rgba(37, 211, 102, 0.25);
      border-color: #25D366;
    }
  }

  &__bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: var(--spacing-xl) 0;
    @include flex-between;

    @include respond-below(sm) {
      flex-direction: column;
      gap: var(--spacing-sm);
      text-align: center;
    }

    p {
      font-size: $font-size-xs;
      color: #8e877c;
    }
  }

  &__admin-link {
    font-size: 0.72rem;
    color: #8e877c;
    text-decoration: none;
    @include flex-center;
    transition: color var(--transition-fast);

    &:hover {
      color: var(--color-accent);
    }
  }
}
</style>

