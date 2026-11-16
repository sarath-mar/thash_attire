<template>
  <div class="ta-admin-settings">
    <AdminPageHeader
      title="Settings"
      subtitle="Configure your store, notifications and account preferences."
    />

    <v-alert type="info" variant="tonal" class="mb-4">
      These fields are read-only. The shop reads WhatsApp and Instagram from the <code>.env</code> file.
    </v-alert>

    <v-card elevation="0" border rounded="lg" class="mb-4">
      <v-tabs v-model="activeTab" color="primary" align-tabs="start">
        <v-tab value="general">General</v-tab>
        <v-tab value="notifications">Notifications</v-tab>
        <v-tab value="payment">Payment</v-tab>
        <v-tab value="account">Account</v-tab>
      </v-tabs>
      <v-divider />
      
      <v-window v-model="activeTab" class="pa-5">
        <v-window-item value="general">
          <h3 class="text-subtitle-1 font-weight-semibold mb-4">Store Information</h3>
          <v-form>
            <v-row dense>
              <v-col cols="12" md="6"><v-text-field label="Store Name" model-value="Thash Attire" variant="outlined" density="comfortable" readonly /></v-col>
              <v-col cols="12" md="6"><v-text-field label="WhatsApp" :model-value="whatsappNumber" variant="outlined" density="comfortable" readonly /></v-col>
              <v-col cols="12" md="6"><v-text-field label="Instagram" :model-value="instagramUrl" variant="outlined" density="comfortable" readonly /></v-col>
              <v-col cols="12" md="6"><v-text-field label="Currency" model-value="INR" variant="outlined" density="comfortable" readonly /></v-col>
            </v-row>
          </v-form>
        </v-window-item>

        <v-window-item value="notifications">
          <h3 class="text-subtitle-1 font-weight-semibold mb-4">Email Notifications</h3>
          <v-list lines="two" density="compact" class="bg-transparent pa-0">
            <v-list-item>
              <v-list-item-title>New Orders</v-list-item-title>
              <v-list-item-subtitle>Email alerts are not sent. New orders show on the Orders page.</v-list-item-subtitle>
            </v-list-item>
            <v-divider />
            <v-list-item>
              <v-list-item-title>Low Stock</v-list-item-title>
              <v-list-item-subtitle>Low materials show on the dashboard. No email is sent.</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-window-item>

        <v-window-item value="payment">
          <h3 class="text-subtitle-1 font-weight-semibold mb-4">Payment Methods</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">Orders accept UPI and cash. Customers pay after Thash Attire confirms the order.</p>
        </v-window-item>

        <v-window-item value="account">
          <h3 class="text-subtitle-1 font-weight-semibold mb-4">Admin Account</h3>
          <v-text-field label="Signed-in email" :model-value="adminEmail" variant="outlined" density="comfortable" readonly />
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_SETTINGS || 'Settings' })

const config = useRuntimeConfig()
const { user, initAuth } = useAuth()
const activeTab = ref('general')
const adminEmail = computed(() => user.value?.email || '')
const whatsappNumber = computed(() => config.public.whatsappNumber || 'Set NUXT_PUBLIC_WHATSAPP_NUMBER')
const instagramUrl = computed(() => config.public.instagramUrl || 'Set NUXT_PUBLIC_INSTAGRAM_URL')

onMounted(() => {
  initAuth()
})
</script>
