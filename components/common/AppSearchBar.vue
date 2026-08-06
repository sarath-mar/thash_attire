<template>
  <div class="ta-search-bar">
    <v-text-field
      v-model="query"
      :placeholder="placeholder"
      :density="density"
      variant="solo-filled"
      flat
      hide-details
      clearable
      class="ta-search-bar__input"
      @update:model-value="handleSearch"
      @click:clear="handleClear"
    >
      <template #prepend-inner>
        <v-icon icon="mdi-magnify" size="20" color="grey" />
      </template>
    </v-text-field>
  </div>
</template>

<script setup>
import { debounceRef } from '~/helpers/debounce.js'
import { AppConfig } from '~/constants/app.js'

const props = defineProps({
  placeholder: { type: String, default: 'Search...' },
  density: { type: String, default: 'comfortable' },
  debounce: { type: Number, default: AppConfig.DEBOUNCE_DELAY },
})

const emit = defineEmits(['search', 'clear'])

const query = ref('')

const debouncedSearch = debounceRef((value) => {
  emit('search', value || '')
}, props.debounce)

const handleSearch = (value) => {
  debouncedSearch(value)
}

const handleClear = () => {
  query.value = ''
  emit('clear')
  emit('search', '')
}
</script>

<style scoped lang="scss">
.ta-search-bar {
  &__input {
    :deep(.v-field) {
      border-radius: var(--radius-full);
      background: var(--color-bg-alt) !important;
    }

    :deep(.v-field__input) {
      font-size: $font-size-sm;
    }
  }
}
</style>
