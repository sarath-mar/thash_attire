<template>
  <div v-if="bagOpen" class="ta-bag-drawer">
    <button type="button" class="ta-bag-drawer__scrim" aria-label="Close bag" @click="closeBag" />
    <aside class="ta-bag-drawer__panel">
      <div class="ta-bag-drawer__head">
        <h2>Your bag</h2>
        <button type="button" aria-label="Close bag" @click="closeBag">×</button>
      </div>
      <CustomerCheckout />
    </aside>
  </div>
</template>

<script setup>
const { bagOpen, closeBag } = useBagDrawer()
</script>

<style scoped lang="scss">
.ta-bag-drawer {
  position: fixed;
  inset: 0;
  z-index: 80;

  &__scrim {
    @include button-reset;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(35, 26, 29, 0.35);
  }

  &__panel {
    position: absolute;
    top: 0;
    right: 0;
    width: min(420px, 100%);
    height: 100%;
    overflow: auto;
    background: #fbf4ec;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg) var(--spacing-lg) 0;

    h2 {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 500;
    }

    button {
      @include button-reset;
      font-size: 1.6rem;
      line-height: 1;
    }
  }

  :deep(.ta-bag) {
    padding: var(--spacing-lg);
  }
}
</style>
