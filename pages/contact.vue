<template>
  <div class="ta-contact-page">
    <!-- Header Banner -->
    <section class="ta-contact-page__hero">
      <div class="container position-relative">
        <button class="ta-page-nav-btn" @click="goBack" aria-label="Return to previous page">
          <v-icon icon="mdi-arrow-left" size="16" class="me-1" />
          <span>Return</span>
        </button>
        <div class="text-center">
          <span class="eyebrow text-gold mb-2">BOUTIQUE CONCIERGE</span>
          <h1 class="ta-contact-page__title">Connect with Thash Attire</h1>
          <div class="divider" />
          <p class="ta-contact-page__intro">
            We are here to assist with custom sizing, order inquiries, and styling recommendations
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container ta-contact-page__grid">
        <!-- Direct Concierge Cards -->
        <div class="ta-contact-page__info">
          <span class="eyebrow">INSTANT SUPPORT</span>
          <h2 class="ta-contact-page__heading">Direct Channels</h2>
          <p class="ta-contact-page__text">
            For fastest response regarding garment availability, price quotes, or custom blouse stitching, reach out directly on WhatsApp.
          </p>

          <div class="ta-contact-page__methods">
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="ta-contact-page__method ta-contact-page__method--wa"
            >
              <v-icon icon="mdi-whatsapp" size="32" color="#25D366" />
              <div>
                <strong>WhatsApp VIP Line</strong>
                <span>Instant response from head stylist (+91 98765 43210)</span>
              </div>
            </a>

            <a
              v-if="instagramUrl"
              :href="instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="ta-contact-page__method"
            >
              <v-icon icon="mdi-instagram" size="32" color="#C5A059" />
              <div>
                <strong>Instagram Direct</strong>
                <span>Follow @thashattire for daily arrivals & DM styling</span>
              </div>
            </a>

            <div class="ta-contact-page__method">
              <v-icon icon="mdi-store-outline" size="32" color="#C5A059" />
              <div>
                <strong>Flagship Boutique Atelier</strong>
                <span>102 Couture Haven, Luxury Lane, Jubilee Hills, Hyderabad</span>
              </div>
            </div>

            <div class="ta-contact-page__method">
              <v-icon icon="mdi-clock-outline" size="32" color="#C5A059" />
              <div>
                <strong>Boutique Hours</strong>
                <span>Mon – Sat: 10:00 AM – 8:00 PM (IST)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Inquiry Form -->
        <div class="ta-contact-page__form-card">
          <h3 class="font-family-heading font-weight-medium text-h5 mb-2">Send an Inquiry</h3>
          <p class="text-caption text-muted mb-6">Leave us a message and our styling team will respond within 24 hours.</p>

          <v-form v-model="formValid" @submit.prevent="submitForm">
            <v-text-field
              v-model="form.name"
              label="Your Full Name"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Name is required']"
              class="mb-3"
            />

            <v-text-field
              v-model="form.phone"
              label="Phone Number / WhatsApp"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Phone number is required']"
              class="mb-3"
            />

            <v-select
              v-model="form.subject"
              :items="['Custom Stitching Request', 'Product Availability', 'Bulk / Wholesale Inquiry', 'General Question']"
              label="Subject of Inquiry"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-textarea
              v-model="form.message"
              label="Message Details"
              variant="outlined"
              density="comfortable"
              rows="4"
              :rules="[v => !!v || 'Message cannot be empty']"
              class="mb-4"
            />

            <AppButton
              premium
              block
              type="submit"
              :loading="sending"
            >
              Submit Message
            </AppButton>
          </v-form>
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
const router = useRouter()
const { success, error: showError } = useSnackbar()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}


const formValid = ref(false)
const sending = ref(false)

const form = reactive({
  name: '',
  phone: '',
  subject: 'Product Availability',
  message: '',
})

const whatsappLink = computed(() =>
  getWhatsAppLink(config.public.whatsappNumber, 'Hi Thash Attire! I would like to make an inquiry.'),
)

const instagramUrl = computed(() => config.public.instagramUrl || 'https://instagram.com/thashattire')

const submitForm = () => {
  if (!form.name || !form.phone || !form.message) return
  sending.value = true
  setTimeout(() => {
    sending.value = false
    success('Thank you! Your inquiry has been sent to our concierge team.')
    form.name = ''
    form.phone = ''
    form.message = ''
  }, 1000)
}
</script>

<style scoped lang="scss">
.ta-contact-page {
  &__hero {
    padding: var(--spacing-3xl) 0 var(--spacing-2xl);
    text-align: center;
    background: linear-gradient(180deg, var(--color-bg-alt) 0%, var(--color-bg) 100%);
    border-bottom: 1px solid var(--color-border-light);
  }

  &__title {
    font-family: var(--font-heading);
    font-size: clamp(2.2rem, 4.5vw, 3.4rem);
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }

  &__intro {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    max-width: 600px;
    margin-inline: auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-3xl);

    @include respond-below(md) {
      grid-template-columns: 1fr;
      gap: var(--spacing-2xl);
    }
  }

  &__heading {
    font-family: var(--font-heading);
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }

  &__text {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xl);
  }

  &__methods {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  &__method {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    text-decoration: none;
    color: var(--color-text-primary);
    transition: all var(--transition-base);

    &:hover {
      border-color: var(--color-accent);
      box-shadow: var(--shadow-md);
    }

    &--wa {
      border-color: rgba(37, 211, 102, 0.4);
      background: rgba(37, 211, 102, 0.04);
    }

    strong {
      display: block;
      font-size: 0.95rem;
      margin-bottom: 2px;
    }

    span {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
  }

  &__form-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-lg);
  }
}
</style>

