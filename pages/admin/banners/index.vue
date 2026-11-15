<template>
  <div class="ta-admin-banners">
    <AdminPageHeader
      title="Banners"
      subtitle="Manage promotional banners for the public website."
    >
      <template #actions>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="dialog = true">
          Add Banner ->
        </v-btn>
      </template>
    </AdminPageHeader>

    <div v-if="loading" class="pa-4 text-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <AppEmptyState
      v-else-if="!banners.length"
      icon="mdi-image-multiple"
      title="No banners yet"
      description="Create a banner to display on the homepage."
      action-label="Add Banner"
      @action="dialog = true"
    />

    <v-row v-else dense class="ta-admin-banners__grid">
      <v-col v-for="banner in banners" :key="banner.id" cols="12" md="6" lg="4">
        <v-card elevation="0" border rounded="lg" class="ta-banner-card">
          <v-img v-if="banner.image_url" :src="banner.image_url" height="180" cover class="align-end bg-grey-lighten-2">
            <div class="ta-banner-card__overlay pa-3">
              <h3 class="text-white text-subtitle-1 font-weight-bold mb-1">{{ banner.title }}</h3>
              <p v-if="banner.subtitle" class="text-white text-caption">{{ banner.subtitle }}</p>
            </div>
          </v-img>
          <div v-else class="pa-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-1">{{ banner.title }}</h3>
            <p v-if="banner.subtitle" class="text-caption text-medium-emphasis">{{ banner.subtitle }}</p>
          </div>
          
          <v-card-text class="pa-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-chip size="x-small" :color="banner.status === 'active' ? 'success' : 'default'">
                {{ banner.status === 'active' ? 'Active' : 'Inactive' }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">Order: {{ banner.display_order }}</span>
            </div>
            <div class="text-caption text-medium-emphasis mb-1">
              <strong>Dates:</strong> {{ banner.start_date || 'Any' }} to {{ banner.end_date || 'Any' }}
            </div>
            <div v-if="banner.button_text" class="text-caption text-medium-emphasis">
              <strong>Link:</strong> {{ banner.button_text }} ({{ banner.button_link }})
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="px-3 py-2">
            <v-spacer />
            <v-btn size="small" variant="text" prepend-icon="mdi-pencil-outline" @click="editBanner(banner)">Edit</v-btn>
            <v-btn size="small" variant="text" color="error" prepend-icon="mdi-delete-outline" @click="handleDelete(banner.id)">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="600" scrollable>
      <v-card>
        <v-card-title class="pa-4">{{ form.id ? 'Edit Banner' : 'Add Banner' }}</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mb-4">{{ formError }}</v-alert>
          <v-form ref="formRef">
            <AdminImageUpload v-model="form.image" label="Banner image *" :max-images="1" :error="imageError" class="mb-4" />
            <v-text-field v-model="form.title" label="Title *" variant="outlined" density="comfortable" class="mb-2" :rules="[v => !!(v && String(v).trim()) || 'Enter a title']" />
            <v-text-field v-model="form.subtitle" label="Subtitle" variant="outlined" density="comfortable" class="mb-2" :rules="[v => !v || String(v).trim().length <= 160 || 'Subtitle must be 160 characters or less']" />

            <v-row dense class="mb-2">
              <v-col cols="6">
                <v-text-field v-model="form.button_text" label="Button text" variant="outlined" density="comfortable" :rules="[v => !String(form.button_link || '').trim() || !!(v && String(v).trim()) || 'Enter button text, or clear the button link']" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="form.button_link" label="Button link" variant="outlined" density="comfortable" :rules="buttonLinkRules" />
              </v-col>
            </v-row>

            <v-row dense class="mb-2">
              <v-col cols="6">
                <v-text-field v-model="form.start_date" type="date" label="Start date" variant="outlined" density="comfortable" :rules="[v => !v || !form.end_date || v <= form.end_date || 'Start date must be on or before the end date']" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="form.end_date" type="date" label="End date" variant="outlined" density="comfortable" :rules="[v => !v || !form.start_date || v >= form.start_date || 'End date must be on or after the start date']" />
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="6">
                <v-text-field v-model.number="form.display_order" type="number" label="Display order" variant="outlined" density="comfortable" :rules="[v => v === '' || v == null || (Number.isFinite(Number(v)) && Number(v) >= 0) || 'Display order must be 0 or more']" />
              </v-col>
              <v-col cols="6"><v-switch v-model="form.status" color="primary" true-value="active" false-value="inactive" label="Active" hide-details /></v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveBanner">Save Banner</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'

import { useBanners } from '~/composables/useBanners.js'
import { StorageService } from '~/services/StorageService.js'
import { StorageBucket } from '~/enums/storageBucket.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_BANNERS || 'Banners' })

const { banners, loading, saving, fetchAllBanners, createBanner, updateBanner, deleteBanner } = useBanners()
const dialog = ref(false)
const formRef = ref(null)
const formError = ref('')
const imageError = ref('')

const buttonLinkRules = [
  (value) => !String(form.button_text || '').trim() || !!(value && String(value).trim()) || 'Enter a link, or clear the button text',
  (value) => {
    const link = String(value || '').trim()
    if (!link) return true
    return /^(https?:\/\/|\/)/.test(link) || 'Use a full link starting with https:// or a page path starting with /'
  },
]

function explainBannerError(message) {
  const text = String(message || '')
  if (/image_url/i.test(text) && /null/i.test(text)) {
    return 'The database still requires a banner image. Run the banner update in supabase/storefront_content.sql, then save again.'
  }
  if (/column/i.test(text) && /schema cache/i.test(text)) {
    return 'A field on this form does not match the banners table. Refresh the page and try again.'
  }
  return text || 'Could not save this banner. Check the fields and try again.'
}

const defaultForm = {
  id: null,
  image: [],
  image_url: '',
  title: '',
  subtitle: '',
  button_text: '',
  button_link: '',
  start_date: '',
  end_date: '',
  display_order: 1,
  status: 'active'
}

const form = reactive({ ...defaultForm })

watch(() => form.image.length, (count) => {
  if (count) imageError.value = ''
})

const editBanner = (banner) => {
  formError.value = ''
  imageError.value = ''
  Object.assign(form, {
    id: banner.id,
    image: banner.image_url ? [banner.image_url] : [],
    image_url: banner.image_url || '',
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    button_text: banner.button_text || '',
    button_link: banner.button_link || '',
    start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
    end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
    display_order: banner.display_order || 1,
    status: banner.status || 'active'
  })
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  formError.value = ''
  imageError.value = ''
  Object.assign(form, defaultForm)
}

const saveBanner = async () => {
  formError.value = ''
  imageError.value = form.image?.length ? '' : 'Add a banner image'
  const { valid } = await formRef.value.validate()
  if (!valid || imageError.value) {
    formError.value = 'Fix the highlighted fields before saving.'
    return
  }

  let finalImageUrl = ''

  try {
    if (form.image && form.image.length > 0) {
      const file = form.image[0]
      if (file instanceof File) {
        const path = `banner_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const uploaded = await StorageService.upload(StorageBucket.BANNERS, path, file)
        finalImageUrl = StorageService.getPublicUrl(StorageBucket.BANNERS, uploaded?.path || path)
      } else if (typeof file === 'string') {
        finalImageUrl = file
      }
    }
  } catch (err) {
    imageError.value = err.message || 'The banner image could not be uploaded.'
    formError.value = imageError.value
    return
  }

  if (!finalImageUrl) {
    imageError.value = 'Add a banner image'
    formError.value = 'Fix the highlighted fields before saving.'
    return
  }

  const payload = {
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || null,
    image_url: finalImageUrl,
    button_text: form.button_text.trim() || null,
    button_link: form.button_link.trim() || null,
    start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
    end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    display_order: Number.isFinite(form.display_order) ? form.display_order : 1,
    status: form.status || 'active'
  }

  const result = form.id ? await updateBanner(form.id, payload) : await createBanner(payload)
  if (result?.ok === false) {
    formError.value = explainBannerError(result.message)
    return
  }
  if (result) closeDialog()
}

const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this banner?')) {
    await deleteBanner(id)
  }
}

onMounted(() => {
  fetchAllBanners()
})
</script>

<style scoped lang="scss">
.ta-admin-banners {
  &__grid { margin-top: var(--spacing-md); }
}

.ta-banner-card {
  &__overlay {
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    width: 100%;
  }
}
</style>
