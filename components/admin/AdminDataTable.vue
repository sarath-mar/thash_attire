<template>
  <v-card class="ta-admin-table" elevation="0" border rounded="lg">
    <!-- Table Header -->
    <div v-if="showSearch || $slots.filters || $slots.actions" class="ta-admin-table__toolbar">
      <div class="ta-admin-table__search-area">
        <v-text-field
          v-if="showSearch"
          v-model="searchModel"
          :placeholder="searchPlaceholder"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="ta-admin-table__search"
          @update:model-value="onSearchChange"
        />
        <slot name="filters" />
      </div>

      <div v-if="$slots.actions" class="ta-admin-table__actions">
        <slot name="actions" />
      </div>
    </div>

    <v-divider v-if="showSearch || $slots.filters || $slots.actions" />

    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-per-page="-1"
      hide-default-footer
      class="ta-admin-table__table"
    >
      <!-- Pass all slots through -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>

      <template #loading>
        <div class="ta-admin-table__loading">
          <v-progress-circular indeterminate color="accent" size="36" />
          <p>Loading...</p>
        </div>
      </template>

      <template #no-data>
        <div class="ta-admin-table__empty">
          <v-icon icon="mdi-inbox-outline" size="48" color="grey-lighten-1" />
          <p>{{ emptyMessage }}</p>
        </div>
      </template>
    </v-data-table>

    <!-- Pagination -->
    <template v-if="totalPages > 1">
      <v-divider />
      <div class="ta-admin-table__pagination">
        <span class="ta-admin-table__count">
          {{ total }} {{ total === 1 ? 'item' : 'items' }}
        </span>
        <v-pagination
          v-model="pageModel"
          :length="totalPages"
          :total-visible="5"
          rounded="lg"
          density="compact"
          @update:model-value="$emit('page-change', $event)"
        />
      </div>
    </template>
  </v-card>
</template>

<script setup>
import { debounceRef } from '~/helpers/debounce.js'

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  page: {
    type: Number,
    default: 1,
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  emptyMessage: {
    type: String,
    default: 'No records found.',
  },
})

const emit = defineEmits(['search', 'page-change'])

const searchModel = ref('')
const pageModel = ref(props.page)

const onSearchChange = debounceRef((value) => {
  emit('search', value || '')
}, 350)

watch(() => props.page, (val) => { pageModel.value = val })
</script>

<style scoped lang="scss">
.ta-admin-table {
  overflow: hidden;

  &__toolbar {
    @include flex-between;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
  }

  &__search-area {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    flex: 1;
    min-width: 0;
  }

  &__search {
    max-width: 320px;
    min-width: 200px;
    font-family: var(--font-body);
    font-size: $font-size-sm;
  }

  &__actions {
    @include flex-center;
    gap: var(--spacing-sm);
    flex-shrink: 0;
  }

  &__table {
    font-family: var(--font-body) !important;
    font-size: $font-size-sm !important;

    :deep(th) {
      font-family: var(--font-body) !important;
      font-size: $font-size-xs !important;
      font-weight: $font-weight-semibold !important;
      text-transform: uppercase;
      letter-spacing: $letter-spacing-wider !important;
      color: var(--color-text-muted) !important;
    }

    :deep(td) {
      font-family: var(--font-body) !important;
      font-size: $font-size-sm !important;
    }
  }

  &__loading,
  &__empty {
    @include flex-center;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-2xl);
    color: var(--color-text-muted);
    font-family: var(--font-body);
    font-size: $font-size-sm;
  }

  &__pagination {
    @include flex-between;
    padding: var(--spacing-md) var(--spacing-lg);
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  &__count {
    font-family: var(--font-body);
    font-size: $font-size-xs;
    color: var(--color-text-muted);
  }
}
</style>
