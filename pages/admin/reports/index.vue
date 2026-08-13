<template>
  <div class="ta-admin-reports">
    <AdminPageHeader
      title="Reports"
      subtitle="Analyze your business performance."
    >
      <template #actions>
        <v-btn-toggle v-model="dateRange" mandatory density="compact" variant="outlined" color="primary">
          <v-btn value="today">Today</v-btn>
          <v-btn value="week">This Week</v-btn>
          <v-btn value="month">This Month</v-btn>
          <v-btn value="year">This Year</v-btn>
        </v-btn-toggle>
      </template>
    </AdminPageHeader>

    <v-card elevation="0" border rounded="lg" class="mb-4">
      <v-tabs v-model="activeTab" color="primary" align-tabs="start">
        <v-tab value="sales">Sales</v-tab>
        <v-tab value="products">Products Profit</v-tab>
        <v-tab value="inventory">Inventory</v-tab>
      </v-tabs>
      <v-divider />
      
      <v-window v-model="activeTab">
        <v-window-item value="sales">
          <div class="pa-5">
            <v-row dense class="mb-4">
              <v-col cols="12" md="3"><v-card border elevation="0" class="pa-4 text-center"><div class="text-caption text-medium-emphasis">Revenue</div><div class="text-h6">₹45,500</div></v-card></v-col>
              <v-col cols="12" md="3"><v-card border elevation="0" class="pa-4 text-center"><div class="text-caption text-medium-emphasis">Orders</div><div class="text-h6">24</div></v-card></v-col>
              <v-col cols="12" md="3"><v-card border elevation="0" class="pa-4 text-center"><div class="text-caption text-medium-emphasis">Products Sold</div><div class="text-h6">35</div></v-card></v-col>
              <v-col cols="12" md="3"><v-card border elevation="0" class="pa-4 text-center"><div class="text-caption text-medium-emphasis">Avg. Order Value</div><div class="text-h6">₹1,895</div></v-card></v-col>
            </v-row>
            <DashboardSalesChart :chart-data="[]" />
          </div>
        </v-window-item>

        <v-window-item value="products">
          <v-table density="comfortable">
            <thead><tr><th>Product</th><th>Cost</th><th>Selling Price</th><th>Profit</th><th>Margin</th></tr></thead>
            <tbody>
              <tr><td>Floral Summer Dress</td><td>₹850</td><td>₹1,499</td><td class="text-success">₹649</td><td>43.2%</td></tr>
              <tr><td>Linen Trousers</td><td>₹600</td><td>₹1,100</td><td class="text-success">₹500</td><td>45.4%</td></tr>
            </tbody>
          </v-table>
        </v-window-item>

        <v-window-item value="inventory">
          <v-table density="comfortable">
            <thead><tr><th>Material</th><th>Quantity</th><th>Avg Cost</th><th>Inventory Value</th></tr></thead>
            <tbody>
              <tr><td>Cotton Fabric</td><td>45 m</td><td>₹150</td><td>₹6,750</td></tr>
              <tr><td>Silk Thread</td><td>20 spools</td><td>₹45</td><td>₹900</td></tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_REPORTS || 'Reports' })

const dateRange = ref('month')
const activeTab = ref('sales')
</script>
