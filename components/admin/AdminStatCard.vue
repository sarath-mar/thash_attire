<template>
  <v-card class="ta-stat-card" :loading="loading" elevation="0" border>
    <v-card-text class="ta-stat-card__body">
      <div class="ta-stat-card__left">
        <p class="ta-stat-card__label">{{ label }}</p>
        <p class="ta-stat-card__value">{{ displayValue }}</p>

        <div v-if="trend !== null" class="ta-stat-card__trend" :class="trendClass">
          <v-icon :icon="trendIcon" size="14" />
          <span>{{ Math.abs(trend) }}% this month</span>
        </div>
      </div>

      <div class="ta-stat-card__icon-wrap" :style="{ backgroundColor: iconBg }">
        <v-icon :icon="icon" size="22" :color="iconColor" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { AppConfig } from '~/constants/app.js'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    default: 0,
  },
  icon: {
    type: String,
    default: 'mdi-chart-line',
  },
  iconColor: {
    type: String,
    default: 'primary',
  },
  iconBg: {
    type: String,
    default: 'rgba(197, 160, 89, 0.12)',
  },
  isCurrency: {
    type: Boolean,
    default: false,
  },
  trend: {
    type: Number,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const displayValue = computed(() => {
  if (props.loading) return '—'
  if (props.isCurrency) {
    return new Intl.NumberFormat(AppConfig.LOCALE, {
      style: 'currency',
      currency: AppConfig.CURRENCY,
      maximumFractionDigits: 0,
    }).format(props.value)
  }
  return props.value?.toLocaleString(AppConfig.LOCALE) ?? '0'
})

const trendClass = computed(() => ({
  'ta-stat-card__trend--up': props.trend > 0,
  'ta-stat-card__trend--down': props.trend < 0,
}))

const trendIcon = computed(() =>
  props.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
)
</script>

<style scoped lang="scss">
.ta-stat-card {
  border-radius: var(--radius-lg) !important;
  @include transition(box-shadow);

  &:hover {
    box-shadow: var(--shadow-md) !important;
  }

  &__body {
    @include flex-between;
    align-items: flex-start;
    padding: var(--spacing-lg) !important;
    gap: var(--spacing-md);
  }

  &__left {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    min-width: 0;
  }

  &__label {
    font-family: var(--font-body);
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wider;
    margin: 0;
  }

  &__value {
    font-family: var(--font-body);
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1;
  }

  &__trend {
    @include flex-center;
    gap: 4px;
    font-family: var(--font-body);
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    &--up {
      color: var(--color-success);
    }

    &--down {
      color: var(--color-error);
    }
  }

  &__icon-wrap {
    @include flex-center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    flex-shrink: 0;
  }
}
</style>
