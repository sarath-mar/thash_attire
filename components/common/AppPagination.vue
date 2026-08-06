<template>
  <div class="ta-pagination">
    <v-pagination
      v-model="currentPage"
      :length="totalPages"
      :total-visible="totalVisible"
      density="comfortable"
      rounded="circle"
      active-color="primary"
      @update:model-value="handlePageChange"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  totalVisible: { type: Number, default: 5 },
})

const emit = defineEmits(['update:page'])

const currentPage = ref(props.page)

watch(() => props.page, (val) => {
  currentPage.value = val
})

const handlePageChange = (page) => {
  emit('update:page', page)
}
</script>

<style scoped lang="scss">
.ta-pagination {
  @include flex-center;
  padding: var(--spacing-xl) 0;

  :deep(.v-pagination__item) {
    font-size: $font-size-sm;
  }
}
</style>
