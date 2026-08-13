<template>
  <div class="ta-admin-settings">
    <AdminPageHeader
      title="Settings"
      subtitle="Configure your store, notifications and account preferences."
    />

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
              <v-col cols="12" md="6"><v-text-field label="Store Name" model-value="Thash Attire" variant="outlined" density="comfortable" /></v-col>
              <v-col cols="12" md="6"><v-text-field label="Contact Email" model-value="support@thashattire.com" variant="outlined" density="comfortable" /></v-col>
              <v-col cols="12" md="6"><v-text-field label="Contact Phone" model-value="+91 98765 43210" variant="outlined" density="comfortable" /></v-col>
              <v-col cols="12" md="6">
                <v-select label="Currency" model-value="INR" :items="['INR', 'USD', 'EUR']" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12"><v-textarea label="Store Address" rows="3" variant="outlined" density="comfortable" /></v-col>
            </v-row>
            <v-btn color="primary" variant="flat" class="mt-2">Save Changes</v-btn>
          </v-form>
        </v-window-item>

        <v-window-item value="notifications">
          <h3 class="text-subtitle-1 font-weight-semibold mb-4">Email Notifications</h3>
          <v-list lines="two" density="compact" class="bg-transparent pa-0">
            <v-list-item>
              <template #prepend><v-switch color="primary" model-value="true" hide-details class="mr-4" /></template>
              <v-list-item-title>New Orders</v-list-item-title>
              <v-list-item-subtitle>Receive an email when a new order is placed</v-list-item-subtitle>
            </v-list-item>
            <v-divider />
            <v-list-item>
              <template #prepend><v-switch color="primary" model-value="true" hide-details class="mr-4" /></template>
              <v-list-item-title>Low Stock Alerts</v-list-item-title>
              <v-list-item-subtitle>Get notified when products or materials fall below minimum threshold</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-btn color="primary" variant="flat" class="mt-4">Update Preferences</v-btn>
        </v-window-item>

        <v-window-item value="payment">
          <h3 class="text-subtitle-1 font-weight-semibold mb-4">Payment Methods</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">Configure which payment methods are available during manual order creation.</p>
          <div class="d-flex flex-column gap-2">
            <v-checkbox label="UPI / Google Pay" model-value="true" color="primary" hide-details density="compact" />
            <v-checkbox label="Bank Transfer" model-value="true" color="primary" hide-details density="compact" />
            <v-checkbox label="Cash" model-value="true" color="primary" hide-details density="compact" />
            <v-checkbox label="Credit Card" color="primary" hide-details density="compact" />
          </div>
          <v-btn color="primary" variant="flat" class="mt-4">Save Configuration</v-btn>
        </v-window-item>

        <v-window-item value="account">
          <h3 class="text-subtitle-1 font-weight-semibold mb-4">Admin Account</h3>
          <v-form>
            <v-text-field label="Name" model-value="Admin User" variant="outlined" density="comfortable" class="mb-2" />
            <v-text-field label="Email" model-value="admin@thashattire.com" variant="outlined" density="comfortable" class="mb-2" />
            
            <h4 class="text-subtitle-2 font-weight-semibold mt-6 mb-2">Change Password</h4>
            <v-text-field type="password" label="Current Password" variant="outlined" density="comfortable" class="mb-2" />
            <v-text-field type="password" label="New Password" variant="outlined" density="comfortable" class="mb-2" />
            <v-text-field type="password" label="Confirm New Password" variant="outlined" density="comfortable" class="mb-2" />
            
            <v-btn color="primary" variant="flat" class="mt-2">Update Account</v-btn>
          </v-form>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_SETTINGS || 'Settings' })

const activeTab = ref('general')
</script>
