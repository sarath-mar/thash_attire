<template>
  <div class="ta-layout-default">
    <AppHeader />
    <main class="ta-layout-default__main">
      <slot />
    </main>
    <AppFooter />
    <AppSnackbar />
  </div>
</template>

<style scoped lang="scss">
.ta-layout-default {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__main {
    flex: 1;
    padding-top: var(--header-height);

    @include respond-below(lg) {
      padding-top: var(--header-height-mobile);
    }
  }
}
</style>
