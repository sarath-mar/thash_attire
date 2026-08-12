<template>
  <div class="ta-image-upload">
    <p class="ta-image-upload__label">{{ label }}</p>

    <!-- Image Previews -->
    <div v-if="previewUrls.length" class="ta-image-upload__previews">
      <div
        v-for="(url, idx) in previewUrls"
        :key="idx"
        class="ta-image-upload__preview-item"
      >
        <img :src="url" :alt="`Image ${idx + 1}`" class="ta-image-upload__preview-img" />
        <v-btn
          icon="mdi-close"
          size="x-small"
          color="error"
          class="ta-image-upload__remove"
          @click="removeImage(idx)"
        />
      </div>
    </div>

    <!-- Upload Area -->
    <div
      v-if="previewUrls.length < maxImages"
      class="ta-image-upload__dropzone"
      :class="{ 'ta-image-upload__dropzone--drag': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <v-icon icon="mdi-image-plus" size="32" color="grey-lighten-1" />
      <p class="ta-image-upload__hint">Click or drag images here</p>
      <p class="ta-image-upload__hint ta-image-upload__hint--small">
        {{ acceptHint }}
      </p>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        :multiple="maxImages > 1"
        class="ta-image-upload__file-input"
        @change="onFileChange"
      />
    </div>

    <p v-if="errorMessage" class="ta-image-upload__error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { AppConfig } from '~/constants/app.js'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: 'Images',
  },
  maxImages: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const isDragging = ref(false)
const errorMessage = ref('')

// modelValue is array of File objects or URL strings
const previewUrls = computed(() => {
  return props.modelValue.map(item => {
    if (typeof item === 'string') return item
    if (item instanceof File) return URL.createObjectURL(item)
    return ''
  }).filter(Boolean)
})

const acceptHint = computed(() => `JPEG, PNG, WebP — max ${AppConfig.MAX_FILE_SIZE / 1024 / 1024}MB each`)

function triggerFileInput() {
  fileInput.value?.click()
}

function validateFile(file) {
  if (!AppConfig.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errorMessage.value = 'Only JPEG, PNG and WebP images are allowed'
    return false
  }
  if (file.size > AppConfig.MAX_FILE_SIZE) {
    errorMessage.value = `File size must not exceed ${AppConfig.MAX_FILE_SIZE / 1024 / 1024}MB`
    return false
  }
  return true
}

function addFiles(files) {
  errorMessage.value = ''
  const remaining = props.maxImages - props.modelValue.length
  const toAdd = Array.from(files).slice(0, remaining)

  const validFiles = toAdd.filter(validateFile)
  if (validFiles.length) {
    emit('update:modelValue', [...props.modelValue, ...validFiles])
  }
}

function onFileChange(event) {
  addFiles(event.target.files)
  // Reset the input so same file can be re-selected
  event.target.value = ''
}

function onDrop(event) {
  isDragging.value = false
  addFiles(event.dataTransfer.files)
}

function removeImage(idx) {
  const updated = [...props.modelValue]
  updated.splice(idx, 1)
  emit('update:modelValue', updated)
}
</script>

<style scoped lang="scss">
.ta-image-upload {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  &__label {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-secondary);
    margin: 0;
  }

  &__previews {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  &__preview-item {
    position: relative;
    width: 96px;
    height: 96px;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--color-border);
  }

  &__preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__remove {
    position: absolute;
    top: 4px;
    right: 4px;
    box-shadow: var(--shadow-sm);
  }

  &__dropzone {
    @include flex-center;
    flex-direction: column;
    gap: var(--spacing-xs);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    cursor: pointer;
    @include transition(border-color, background);

    &:hover,
    &--drag {
      border-color: var(--color-accent);
      background: var(--color-accent-light);
    }
  }

  &__hint {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    text-align: center;
    margin: 0;

    &--small {
      font-size: $font-size-xs;
    }
  }

  &__file-input {
    display: none;
  }

  &__error {
    font-family: var(--font-body);
    font-size: $font-size-xs;
    color: var(--color-error);
    margin: 0;
  }
}
</style>
