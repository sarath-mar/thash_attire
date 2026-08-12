<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    :rail="isRail"
    :permanent="mdAndUp"
    color="surface"
    class="ta-admin-sidebar"
    width="260"
    rail-width="64"
  >
    <!-- Brand Header -->
    <div class="ta-admin-sidebar__brand">
      <div class="ta-admin-sidebar__brand-logo">
        <v-icon icon="mdi-hanger" size="24" color="accent" />
      </div>
      <Transition name="fade">
        <div v-if="!isRail" class="ta-admin-sidebar__brand-text">
          <span class="ta-admin-sidebar__brand-name">Thash Attire</span>
          <span class="ta-admin-sidebar__brand-subtitle">Admin Panel</span>
        </div>
      </Transition>
    </div>

    <v-divider />

    <!-- Navigation -->
    <v-list density="compact" nav class="ta-admin-sidebar__nav">
      <template v-for="item in AdminNavItems" :key="item.to">
        <!-- Group item (has children) -->
        <template v-if="item.children && !isRail">
          <v-list-group :value="item.title" class="ta-admin-sidebar__group">
            <template #activator="{ props: groupProps }">
              <v-list-item
                v-bind="groupProps"
                :prepend-icon="item.icon"
                :title="item.title"
                :active="isGroupActive(item)"
                active-class="ta-admin-sidebar__item--active"
                class="ta-admin-sidebar__item"
                rounded="lg"
              />
            </template>

            <v-list-item
              v-for="child in item.children"
              :key="child.to"
              :prepend-icon="child.icon"
              :title="child.title"
              :to="child.to"
              :active="isActive(child.to)"
              active-class="ta-admin-sidebar__item--active"
              class="ta-admin-sidebar__item ta-admin-sidebar__item--child"
              rounded="lg"
            />
          </v-list-group>
        </template>

        <!-- Rail mode: show group parent as single icon with tooltip -->
        <template v-else-if="item.children && isRail">
          <v-list-item
            :value="item.to"
            :to="item.to"
            :active="isGroupActive(item)"
            active-class="ta-admin-sidebar__item--active"
            class="ta-admin-sidebar__item"
            rounded="lg"
          >
            <template #prepend>
              <v-tooltip :text="item.title" location="end">
                <template #activator="{ props: tooltipProps }">
                  <v-icon v-bind="tooltipProps" :icon="item.icon" />
                </template>
              </v-tooltip>
            </template>
          </v-list-item>
        </template>

        <!-- Regular flat item -->
        <template v-else>
          <v-list-item
            :value="item.to"
            :prepend-icon="!isRail ? item.icon : undefined"
            :title="!isRail ? item.title : ''"
            :to="item.to"
            :active="isActive(item.to)"
            active-class="ta-admin-sidebar__item--active"
            class="ta-admin-sidebar__item"
            rounded="lg"
          >
            <template v-if="isRail" #prepend>
              <v-tooltip :text="item.title" location="end">
                <template #activator="{ props: tooltipProps }">
                  <v-icon v-bind="tooltipProps" :icon="item.icon" />
                </template>
              </v-tooltip>
            </template>
          </v-list-item>
        </template>
      </template>
    </v-list>

    <!-- Rail Toggle (desktop) -->
    <template v-if="mdAndUp" #append>
      <v-divider />
      <div class="ta-admin-sidebar__toggle">
        <v-btn
          :icon="isRail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          variant="text"
          size="small"
          @click="isRail = !isRail"
        />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { AdminNavItems } from '~/constants/navigation.js'
import { useDisplay } from 'vuetify'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const route = useRoute()
const { mdAndUp } = useDisplay()

const isRail = ref(false)

const drawerOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isActive = (path) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path === path
}

const isGroupActive = (item) => {
  if (!item.children) return isActive(item.to)
  return item.children.some(child => route.path.startsWith(child.to))
}
</script>

<style scoped lang="scss">
.ta-admin-sidebar {
  border-right: 1px solid var(--color-border) !important;

  &__brand {
    @include flex-between;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-md);
    min-height: 64px;
  }

  &__brand-logo {
    @include flex-center;
    width: 36px;
    height: 36px;
    background: var(--color-accent-light);
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }

  &__brand-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__brand-name {
    font-family: var(--font-heading);
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  &__brand-subtitle {
    font-family: var(--font-body);
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: var(--color-text-muted);
    letter-spacing: $letter-spacing-wider;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &__nav {
    padding: var(--spacing-sm);
  }

  &__group {
    margin-bottom: 2px;

    :deep(.v-list-group__items .v-list-item) {
      padding-left: var(--spacing-md) !important;
    }
  }

  &__item {
    margin-bottom: 2px;
    font-family: var(--font-body);
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;

    &--child {
      font-size: $font-size-xs;
    }

    &--active {
      background: var(--color-accent-light) !important;
      color: var(--color-secondary) !important;

      :deep(.v-icon) {
        color: var(--color-secondary) !important;
      }
    }
  }

  &__toggle {
    @include flex-center;
    padding: var(--spacing-xs);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
