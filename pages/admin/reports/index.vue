<template>
  <div class="ta-admin-reports">
    <AdminPageHeader
      title="Reports"
      subtitle="Analyze your business performance."
    >
      <template #actions>
        <v-btn-toggle v-model="dateRange" mandatory density="compact" variant="outlined" color="primary" @update:model-value="fetchReports">
          <v-btn value="today">Today</v-btn>
          <v-btn value="week">This Week</v-btn>
          <v-btn value="month">This Month</v-btn>
          <v-btn value="year">This Year</v-btn>
        </v-btn-toggle>
      </template>
    </AdminPageHeader>

    <AppLoading v-if="loading" />

    <v-card v-else elevation="0" border rounded="lg" class="mb-4">
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
              <v-col cols="12" md="3"><v-card border elevation="0" class="pa-4 text-center"><div class="text-caption text-medium-emphasis">Revenue</div><div class="text-h6">{{ formatCurrency(reportData.totalRevenue) }}</div></v-card></v-col>
              <v-col cols="12" md="3"><v-card border elevation="0" class="pa-4 text-center"><div class="text-caption text-medium-emphasis">Orders</div><div class="text-h6">{{ reportData.totalSales }}</div></v-card></v-col>
              <v-col cols="12" md="3"><v-card border elevation="0" class="pa-4 text-center"><div class="text-caption text-medium-emphasis">Normal Product Sales</div><div class="text-h6">{{ formatCurrency(reportData.normalSales) }}</div></v-card></v-col>
              <v-col cols="12" md="3"><v-card border elevation="0" class="pa-4 text-center bg-primary-lighten-5"><div class="text-caption text-primary">Combo/Offer Sales</div><div class="text-h6 text-primary">{{ formatCurrency(reportData.comboSales) }}</div></v-card></v-col>
            </v-row>
            <DashboardSalesChart :chart-data="reportData.salesByDay || []" />
          </div>
        </v-window-item>

        <v-window-item value="products">
          <div class="pa-5 text-center text-medium-emphasis">
            Coming soon in detailed reporting module.
          </div>
        </v-window-item>

        <v-window-item value="inventory">
          <div class="pa-5 text-center text-medium-emphasis">
            Coming soon in detailed reporting module.
          </div>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { formatCurrency } from '~/helpers/currency.js'
import { ReportService } from '~/services/ReportService.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: PageTitles.ADMIN_REPORTS || 'Reports' })

const dateRange = ref('month')
const activeTab = ref('sales')
const loading = ref(true)
const reportData = ref({})

const fetchReports = async () => {
  loading.value = true
  try {
    const res = await ReportService.getSalesReport(dateRange.value)
    reportData.value = res
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReports()
})
</script>
