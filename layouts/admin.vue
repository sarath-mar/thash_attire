<template>
  <ClientOnly>
    <template #fallback>
      <div class="ta-admin-layout__loading">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-medium-emphasis">Loading Admin Panel...</p>
      </div>
    </template>
    
    <v-app class="ta-admin-layout">
      <AdminSidebar v-model="drawerOpen" />
      <AdminHeader @toggle-drawer="drawerOpen = !drawerOpen" />

      <v-main class="ta-admin-layout__main">
        <div class="ta-admin-layout__content">
          <slot />
        </div>
      </v-main>

      <AppSnackbar />
    </v-app>
  </ClientOnly>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const drawerOpen = ref(true)

// Close the mobile drawer by default on small screens
watch(mdAndUp, (isDesktop) => {
  if (!isDesktop) {
    drawerOpen.value = false
  } else {
    drawerOpen.value = true
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.ta-admin-layout {
  background: var(--color-bg) !important;

  &__main {
    background: var(--color-bg) !important;
  }

  &__content {
    padding: var(--spacing-lg);
    max-width: 1600px;
    margin: 0 auto;

    @include respond-below(md) {
      padding: var(--spacing-md);
    }
  }

  &__loading {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
  }
}
</style>
