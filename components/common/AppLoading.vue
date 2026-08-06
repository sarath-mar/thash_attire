<template>
  <div class="ta-loading" :class="{ 'ta-loading--fullscreen': fullscreen }">
    <div class="ta-loading__spinner">
      <div class="ta-loading__ring" />
    </div>
    <p v-if="message" class="ta-loading__message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
  fullscreen: { type: Boolean, default: false },
})
</script>

<style scoped lang="scss">
.ta-loading {
  @include flex-center;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);

  &--fullscreen {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: var(--z-modal);
  }

  &__spinner {
    width: 40px;
    height: 40px;
  }

  &__ring {
    width: 100%;
    height: 100%;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__message {
    @include body-text($font-size-sm, var(--color-text-secondary));
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
