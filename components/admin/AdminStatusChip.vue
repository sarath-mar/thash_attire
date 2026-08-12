<template>
  <v-chip
    :color="chipColor"
    :size="size"
    label
    class="ta-status-chip"
  >
    {{ displayLabel }}
  </v-chip>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  colorMap: {
    type: Object,
    default: () => ({}),
  },
  labelMap: {
    type: Object,
    default: () => ({}),
  },
  size: {
    type: String,
    default: 'small',
  },
})

const chipColor = computed(() => props.colorMap[props.status] || 'grey')
const displayLabel = computed(() => props.labelMap[props.status] || props.status)
</script>

<style scoped lang="scss">
.ta-status-chip {
  font-family: var(--font-body) !important;
  font-size: $font-size-xs !important;
  font-weight: $font-weight-medium !important;
  letter-spacing: $letter-spacing-wide !important;
  text-transform: uppercase;
}
</style>
