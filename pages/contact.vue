<template>
  <div class="ta-contact-page">
    <section class="ta-contact-page__hero">
      <div class="container">
        <div class="divider" />
        <h1 class="ta-contact-page__title">Contact Us</h1>
        <p class="ta-contact-page__intro">
          We'd love to hear from you
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container ta-contact-page__grid">
        <div class="ta-contact-page__info">
          <h2 class="ta-contact-page__heading">Get in Touch</h2>
          <p class="ta-contact-page__text">
            Have a question about our products, sizing, or availability?
            Reach out to us on WhatsApp and we'll get back to you as soon as possible.
          </p>

          <div class="ta-contact-page__methods">
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="ta-contact-page__method"
            >
              <v-icon icon="mdi-whatsapp" size="28" color="#25D366" />
              <div>
                <strong>WhatsApp</strong>
                <span>Chat with us instantly</span>
              </div>
            </a>

            <a
              v-if="instagramUrl"
              :href="instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="ta-contact-page__method"
            >
              <v-icon icon="mdi-instagram" size="28" />
              <div>
                <strong>Instagram</strong>
                <span>Follow our latest updates</span>
              </div>
            </a>
          </div>
        </div>

        <div class="ta-contact-page__cta-card">
          <v-icon icon="mdi-message-text-outline" size="48" class="ta-contact-page__cta-icon" />
          <h3>Ready to shop?</h3>
          <p>
            Browse our collection and message us on WhatsApp to place your order.
            We offer personalized styling advice and size recommendations.
          </p>
          <AppButton
            premium
            block
            prepend-icon="mdi-whatsapp"
            :href="whatsappLink"
            target="_blank"
          >
            Start a Conversation
          </AppButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { getWhatsAppLink } from '~/helpers/phone.js'

useHead({ title: PageTitles.CONTACT })

const config = useRuntimeConfig()

const whatsappLink = computed(() =>
  getWhatsAppLink(config.public.whatsappNumber, 'Hi! I\'d like to get in touch with Thash Attire.'),
)

const instagramUrl = computed(() => config.public.instagramUrl)
</script>

<style scoped lang="scss">
.ta-contact-page {
  &__hero {
    padding: var(--spacing-3xl) 0;
    text-align: center;
    background: var(--color-bg-alt);
  }

  &__title {
    @include heading($font-size-4xl);
    margin-bottom: var(--spacing-sm);
  }

  &__intro {
    @include body-text($font-size-lg, var(--color-text-secondary));
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-3xl);
    max-width: var(--container-narrow);

    @include respond-below(md) {
      grid-template-columns: 1fr;
    }
  }

  &__heading {
    @include heading($font-size-2xl);
    margin-bottom: var(--spacing-md);
  }

  &__text {
    @include body-text();
    margin-bottom: var(--spacing-xl);
  }

  &__methods {
    @include flex(column, flex-start, stretch, var(--spacing-md));
  }

  &__method {
    @include flex(row, flex-start, center, var(--spacing-md));
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    @include transition(border-color, box-shadow);

    &:hover {
      border-color: var(--color-accent);
      box-shadow: var(--shadow-sm);
    }

    strong {
      display: block;
      font-weight: $font-weight-medium;
      margin-bottom: 2px;
    }

    span {
      font-size: $font-size-sm;
      color: var(--color-text-muted);
    }
  }

  &__cta-card {
    @include card(var(--spacing-2xl));
    text-align: center;
    background: var(--color-bg-alt);
    box-shadow: none;
    border: 1px solid var(--color-border);

    h3 {
      @include heading($font-size-xl);
      margin-bottom: var(--spacing-md);
    }

    p {
      @include body-text($font-size-sm);
      margin-bottom: var(--spacing-xl);
    }
  }

  &__cta-icon {
    color: var(--color-accent);
    margin-bottom: var(--spacing-lg);
  }
}
</style>
