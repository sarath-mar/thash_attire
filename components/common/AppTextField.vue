<template>
  <v-text-field
    v-model="model"
    :label="label"
    :placeholder="placeholder"
    :type="type"
    :rules="rules"
    :disabled="disabled"
    :readonly="readonly"
    :prepend-inner-icon="prependIcon"
    :append-inner-icon="appendIcon"
    :hint="hint"
    :persistent-hint="persistentHint"
    :clearable="clearable"
    :density="density"
    :variant="variant"
    class="ta-textfield"
    @click:append-inner="$emit('click:append-inner')"
  />
</template>

<script setup>
const model = defineModel()

defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  prependIcon: { type: String, default: '' },
  appendIcon: { type: String, default: '' },
  hint: { type: String, default: '' },
  persistentHint: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  density: { type: String, default: 'comfortable' },
  variant: { type: String, default: 'outlined' },
})

defineEmits(['click:append-inner'])
</script>

<style scoped lang="scss">
.ta-textfield {
  :deep(.v-field) {
    border-radius: var(--radius-sm);
  }

  :deep(.v-field__outline) {
    --v-field-border-opacity: 0.3;
  }

  :deep(.v-field--focused .v-field__outline) {
    --v-field-border-opacity: 1;
  }
}
</style>
