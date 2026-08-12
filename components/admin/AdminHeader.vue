<template>
  <v-app-bar
    flat
    border="b"
    color="surface"
    class="ta-admin-header"
    height="64"
  >
    <!-- Mobile: hamburger toggle -->
    <v-app-bar-nav-icon
      v-if="!mdAndUp"
      @click="$emit('toggle-drawer')"
    />

    <!-- Page title -->
    <v-app-bar-title class="ta-admin-header__title">
      {{ pageTitle }}
    </v-app-bar-title>

    <template #append>
      <!-- User info -->
      <div class="ta-admin-header__user">
        <span class="ta-admin-header__user-email">{{ userEmail }}</span>
        <v-avatar
          size="32"
          color="accent"
          class="ta-admin-header__avatar"
        >
          <span class="ta-admin-header__avatar-initials">{{ userInitial }}</span>
        </v-avatar>
      </div>

      <!-- Logout -->
      <v-btn
        variant="text"
        icon="mdi-logout"
        size="small"
        :loading="logoutLoading"
        class="ta-admin-header__logout"
        title="Logout"
        @click="handleLogout"
      />
    </template>
  </v-app-bar>
</template>

<script setup>
import { useDisplay } from 'vuetify'

defineEmits(['toggle-drawer'])

const route = useRoute()
const { mdAndUp } = useDisplay()
const { user, logout, loading: logoutLoading } = useAuth()

const pageTitle = computed(() => {
  const meta = route.meta?.title
  if (meta) return meta

  const name = route.name || ''
  if (name === 'admin') return 'Dashboard'
  if (name.includes('products')) return 'Products'
  if (name.includes('categories')) return 'Categories'
  if (name.includes('materials')) return 'Materials'
  if (name.includes('inventory')) return 'Inventory'
  if (name.includes('sales')) return 'Sales'
  if (name.includes('customers')) return 'Customers'
  if (name.includes('expenses')) return 'Expenses'
  if (name.includes('reports')) return 'Reports'
  if (name.includes('settings')) return 'Settings'
  if (name.includes('banners')) return 'Banners'
  return 'Admin'
})

const userEmail = computed(() => user.value?.email || '')
const userInitial = computed(() => {
  const email = userEmail.value
  return email ? email.charAt(0).toUpperCase() : 'A'
})

const handleLogout = async () => {
  await logout()
}
</script>

<style scoped lang="scss">
.ta-admin-header {
  :deep(.v-toolbar__content) {
    padding-inline: var(--spacing-md);
  }

  &__title {
    font-family: var(--font-body);
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
  }

  &__user {
    @include flex-center;
    gap: var(--spacing-sm);
    margin-right: var(--spacing-sm);
  }

  &__user-email {
    font-family: var(--font-body);
    font-size: $font-size-xs;
    color: var(--color-text-muted);

    @include respond-below(md) {
      display: none;
    }
  }

  &__avatar {
    cursor: default;

    &-initials {
      font-family: var(--font-body);
      font-size: $font-size-xs;
      font-weight: $font-weight-bold;
      color: var(--color-text-inverse);
    }
  }

  &__logout {
    margin-left: var(--spacing-xs);
  }
}
</style>
