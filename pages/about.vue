<template>
  <div class="ta-about-page">
    <section class="ta-about-page__hero">
      <div class="container">
        <div class="divider" />
        <h1 class="ta-about-page__title">About Thash Attire</h1>
        <p class="ta-about-page__intro">
          Where elegance meets everyday wear
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container ta-about-page__content">
        <div class="ta-about-page__story">
          <h2 class="ta-about-page__heading">Our Story</h2>
          <p>
            Thash Attire was born from a passion for creating beautiful, wearable fashion
            that empowers women to express their unique style. We believe that great fashion
            should be accessible, comfortable, and timeless.
          </p>
          <p>
            Every piece in our collection is carefully selected and crafted with attention to detail,
            using premium fabrics that feel as good as they look. From casual everyday wear to
            statement pieces for special occasions, we curate collections that celebrate the modern woman.
          </p>
        </div>

        <div class="ta-about-page__values">
          <div v-for="value in values" :key="value.title" class="ta-about-page__value">
            <v-icon :icon="value.icon" size="32" class="ta-about-page__value-icon" />
            <h3 class="ta-about-page__value-title">{{ value.title }}</h3>
            <p class="ta-about-page__value-text">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'

useHead({ title: PageTitles.ABOUT })

const values = [
  {
    icon: 'mdi-diamond-stone',
    title: 'Premium Quality',
    description: 'We source the finest fabrics and work with skilled artisans to create pieces that last.',
  },
  {
    icon: 'mdi-heart-outline',
    title: 'Made with Love',
    description: 'Every garment is crafted with care and attention to detail, ensuring you feel special.',
  },
  {
    icon: 'mdi-leaf',
    title: 'Timeless Design',
    description: 'Our designs transcend trends, offering pieces you\'ll cherish season after season.',
  },
]
</script>

<style scoped lang="scss">
.ta-about-page {
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

  &__content {
    max-width: var(--container-narrow);
  }

  &__story {
    margin-bottom: var(--spacing-3xl);

    p {
      @include body-text();
      margin-bottom: var(--spacing-lg);
    }
  }

  &__heading {
    @include heading($font-size-2xl);
    margin-bottom: var(--spacing-lg);
  }

  &__values {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-xl);

    @include respond-below(md) {
      grid-template-columns: 1fr;
    }
  }

  &__value {
    text-align: center;
    padding: var(--spacing-xl);
  }

  &__value-icon {
    color: var(--color-accent);
    margin-bottom: var(--spacing-md);
  }

  &__value-title {
    @include heading($font-size-lg);
    margin-bottom: var(--spacing-sm);
  }

  &__value-text {
    @include body-text($font-size-sm, var(--color-text-secondary));
  }
}
</style>
