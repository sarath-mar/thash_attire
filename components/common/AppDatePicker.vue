<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    min-width="auto"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        v-model="formattedDate"
        :label="label"
        :variant="variant"
        :density="density"
        :hide-details="hideDetails"
        :rules="rules"
        :class="className"
        readonly
        v-bind="props"
        append-inner-icon="mdi-calendar"
        @click:clear="clearDate"
        :clearable="clearable"
      ></v-text-field>
    </template>
    
    <v-date-picker
      v-model="internalDate"
      @update:model-value="onDateSelected"
      color="primary"
      show-adjacent-months
    ></v-date-picker>
  </v-menu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Date, null],
    default: null
  },
  label: {
    type: String,
    default: 'Select Date'
  },
  variant: {
    type: String,
    default: 'outlined'
  },
  density: {
    type: String,
    default: 'comfortable'
  },
  hideDetails: {
    type: [Boolean, String],
    default: false
  },
  rules: {
    type: Array,
    default: () => []
  },
  class: {
    type: String,
    default: ''
  },
  clearable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const menu = ref(false)

// Convert input modelValue (usually string YYYY-MM-DD) to Date object for v-date-picker
const internalDate = ref(props.modelValue ? new Date(props.modelValue) : null)

// Format the date for the text field as DD/MM/YYYY
const formattedDate = computed(() => {
  if (!internalDate.value) return ''
  const d = new Date(internalDate.value)
  if (isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
})

// Sync if parent changes modelValue directly
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    internalDate.value = null
  } else {
    // Only update if it's actually a different date to avoid loops
    const current = internalDate.value ? new Date(internalDate.value).toISOString().split('T')[0] : null
    const incoming = new Date(newVal).toISOString().split('T')[0]
    if (current !== incoming) {
      internalDate.value = new Date(newVal)
    }
  }
})

const onDateSelected = (val) => {
  internalDate.value = val
  menu.value = false
  if (val) {
    // Emit in YYYY-MM-DD format
    const d = new Date(val)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    emit('update:modelValue', `${year}-${month}-${day}`)
  } else {
    emit('update:modelValue', null)
  }
}

const clearDate = () => {
  internalDate.value = null
  emit('update:modelValue', null)
}
</script>
