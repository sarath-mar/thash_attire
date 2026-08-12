<template>
  <div class="ta-video-upload">
    <p class="ta-video-upload__label">{{ label }}</p>

    <!-- Video Preview -->
    <div v-if="previewUrl" class="ta-video-upload__preview">
      <video :src="previewUrl" controls class="ta-video-upload__video" />
      <v-btn
        prepend-icon="mdi-delete-outline"
        color="error"
        variant="text"
        size="small"
        class="ta-video-upload__remove"
        @click="removeVideo"
      >
        Remove video
      </v-btn>
    </div>

    <!-- Upload Area -->
    <div
      v-else
      class="ta-video-upload__dropzone"
      :class="{ 'ta-video-upload__dropzone--drag': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <v-icon icon="mdi-video-plus" size="36" color="grey-lighten-1" />
      <p class="ta-video-upload__hint">Click or drag a video here</p>
      <p class="ta-video-upload__hint ta-video-upload__hint--small">MP4, WebM — max 50MB</p>
      <input
        ref="fileInput"
        type="file"
        accept="video/mp4,video/webm"
        class="ta-video-upload__file-input"
        @change="onFileChange"
      />
    </div>

    <p v-if="errorMessage" class="ta-video-upload__error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { AppConfig } from '~/constants/app.js'

const props = defineProps({
  modelValue: {
    type: [File, String],
    default: null,
  },
  label: {
    type: String,
    default: 'Video',
  },
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const isDragging = ref(false)
const errorMessage = ref('')

const previewUrl = computed(() => {
  if (!props.modelValue) return null
  if (typeof props.modelValue === 'string') return props.modelValue
  if (props.modelValue instanceof File) return URL.createObjectURL(props.modelValue)
  return null
})

function triggerFileInput() {
  fileInput.value?.click()
}

function validateFile(file) {
  if (!AppConfig.ALLOWED_VIDEO_TYPES.includes(file.type)) {
    errorMessage.value = 'Only MP4 and WebM videos are allowed'
    return false
  }
  if (file.size > AppConfig.MAX_VIDEO_SIZE) {
    errorMessage.value = `File size must not exceed ${AppConfig.MAX_VIDEO_SIZE / 1024 / 1024}MB`
    return false
  }
  return true
}

function handleFile(file) {
  errorMessage.value = ''
  if (validateFile(file)) {
    emit('update:modelValue', file)
  }
}

function onFileChange(event) {
  const file = event.target.files[0]
  if (file) handleFile(file)
  event.target.value = ''
}

function onDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) handleFile(file)
}

function removeVideo() {
  emit('update:modelValue', null)
}
</script>

<style scoped lang="scss">
.ta-video-upload {
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

  &__preview {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }

  &__video {
    width: 100%;
    max-height: 240px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: #000;
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
