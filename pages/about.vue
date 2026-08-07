<template>
  <div class="ta-about-page">
    <!-- Header Banner -->
    <section class="ta-about-page__hero">
      <div class="container position-relative">
        <button class="ta-page-nav-btn" @click="goBack" aria-label="Return to previous page">
          <v-icon icon="mdi-arrow-left" size="16" class="me-1" />
          <span>Return</span>
        </button>
        <div class="text-center">
          <span class="eyebrow text-gold mb-2">HERITAGE & CRAFTSMANSHIP</span>
          <h1 class="ta-about-page__title">The Story of Thash Attire</h1>
          <div class="divider" />
          <p class="ta-about-page__intro">
            Empowering modern elegance through authentic Indian handlooms and haute couture
          </p>
        </div>
      </div>
    </section>

    <!-- Editorial Story Section -->
    <section class="section">
      <div class="container ta-about-page__content">
        <div class="ta-about-page__grid">
          <div class="ta-about-page__visual">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
              alt="Thash Attire Heritage Silk"
              class="ta-about-page__img"
            >
          </div>

          <div class="ta-about-page__story">
            <span class="eyebrow">FOUNDATION</span>
            <h2 class="ta-about-page__heading">Timeless Grace, Contemporary Spirit</h2>
            <p>
              Founded with a vision to preserve the soulful artistry of Indian textile weaving while tailoring sleek modern silhouettes,
              <strong>Thash Attire</strong> stands as a sanctuary of boutique fashion for discerning women.
            </p>
            <p>
              From the quiet looms of Kanchipuram and Varanasi to our design atelier, every warp and weft is chosen with intention.
              We believe that luxury should feel deeply personal, comfortable, and timeless.
            </p>
            <p>
              Whether it is a handwoven Kanjivaram silk saree passed down through generations or a contemporary organza Anarkali dress for a festive evening, our creations celebrate the multi-faceted beauty of every woman.
            </p>
          </div>
        </div>

        <!-- Brand Values Grid -->
        <div class="ta-about-page__values-section mt-16">
          <div class="text-center mb-10">
            <span class="eyebrow">OUR PILLARS</span>
            <h2 class="section-title">The Thash Promise</h2>
            <div class="divider" />
          </div>

          <div class="ta-about-page__values">
            <div v-for="val in values" :key="val.title" class="ta-value-card">
              <div class="ta-value-card__icon-wrap">
                <v-icon :icon="val.icon" size="28" color="#C5A059" />
              </div>
              <h3 class="ta-value-card__title">{{ val.title }}</h3>
              <p class="ta-value-card__text">{{ val.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="ta-cta section">
      <div class="container ta-cta__content text-center">
        <h2 class="ta-cta__title">Experience Boutique Fashion Firsthand</h2>
        <p class="ta-cta__text">Explore our latest arrivals or request a customized fitting consultation via WhatsApp.</p>
        <div class="d-flex justify-center gap-4 flex-wrap">
          <AppButton premium to="/products" class="px-8">
            Explore Collection
          </AppButton>
          <AppButton outline :href="whatsappLink" target="_blank" class="px-8">
            <v-icon icon="mdi-whatsapp" start size="18" />
            WhatsApp Stylist
          </AppButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { getWhatsAppLink } from '~/helpers/phone.js'

useHead({ title: PageTitles.ABOUT })

const config = useRuntimeConfig()
const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}


const whatsappLink = computed(() =>
  getWhatsAppLink(config.public.whatsappNumber, 'Hi Thash Attire! I read your story and would love to consult with a stylist.'),
)

const values = [
  {
    icon: 'mdi-diamond-stone',
    title: 'Purity of Fabrics',
    description: 'We use certified pure silks, weightless organza, Chanderi, and Pashmina threads carefully tested for lustre and durability.',
  },
  {
    icon: 'mdi-handshake-outline',
    title: 'Artisan Preservation',
    description: 'Direct collaboration with traditional weaver clusters ensuring fair wages, ethical crafting, and authentic handloom heritage.',
  },
  {
    icon: 'mdi-scissors-cutting',
    title: 'Bespoke Customization',
    description: 'Custom sleeve lengths, necklines, blouse stitching, and saree falls tailored precisely to your measurements.',
  },
]
</script>

<style scoped lang="scss">
.ta-about-page {
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
    max-width: 620px;
    margin-inline: auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: var(--spacing-3xl);
    align-items: center;

    @include respond-below(md) {
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
    }
  }

  &__visual {
    aspect-ratio: 4 / 5;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-xl);
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__heading {
    font-family: var(--font-heading);
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    font-weight: 500;
    margin-bottom: var(--spacing-md);
    line-height: 1.2;
  }

  &__story {
    p {
      font-size: 1rem;
      line-height: 1.7;
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-lg);
    }
  }

  &__values {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-xl);

    @include respond-below(md) {
      grid-template-columns: 1fr;
    }
  }
}

.ta-value-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-border-gold);
    transform: translateY(-4px);
    box-shadow: var(--shadow-gold);
  }

  &__icon-wrap {
    @include flex-center;
    width: 60px;
    height: 60px;
    margin-inline: auto;
    margin-bottom: var(--spacing-md);
    border-radius: 50%;
    background: var(--color-accent-light);
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 1.3rem;
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }

  &__text {
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--color-text-secondary);
  }
}

.ta-cta {
  background: var(--color-primary);
  color: #ffffff;
  border-top: 1px solid var(--color-border-gold);

  &__title {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 500;
    margin-bottom: var(--spacing-md);
    color: #ffffff;
  }

  &__text {
    font-size: 1.05rem;
    color: #c4bcae;
    margin-bottom: var(--spacing-2xl);
    max-width: 600px;
    margin-inline: auto;
  }
}
</style>

