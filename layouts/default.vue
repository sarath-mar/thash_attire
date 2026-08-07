<template>
  <div class="ta-layout-default">
    <!-- <AppHeader /> -->
    <LayoutAppHeader />
    <main class="ta-layout-default__main">
      <slot />
    </main>
    <LayoutAppFooter />
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
    // padding-top: var(--header-height);

    @include respond-below(lg) {
      // padding-top: var(--header-height-mobile);
    }
  }
}
</style>
