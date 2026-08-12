<template>
  <div class="ta-admin-dashboard">
    <AdminPageHeader
      title="Dashboard"
      subtitle="Overview of your business performance"
    />

    <!-- Summary Stats -->
    <DashboardSummary
      :summary="summary"
      :loading="loadingSummary"
      class="ta-admin-dashboard__summary"
    />

    <!-- Data Sections -->
    <div class="ta-admin-dashboard__sections">
      <DashboardRecentSales
        :sales="recentSales"
        :loading="loadingRecentSales"
        class="ta-admin-dashboard__recent-sales"
      />

      <div class="ta-admin-dashboard__side">
        <DashboardLowStock
          :products="lowStockProducts"
          :loading="loadingLowStock"
        />
        <DashboardTopProducts
          :products="topProducts"
          :loading="loadingTopProducts"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useHead({ title: PageTitles.ADMIN_DASHBOARD })

const {
  summary,
  recentSales,
  lowStockProducts,
  topProducts,
  loadingSummary,
  loadingRecentSales,
  loadingLowStock,
  loadingTopProducts,
  fetchAll,
} = useDashboard()

onMounted(fetchAll)
</script>

<style scoped lang="scss">
.ta-admin-dashboard {
  &__summary {
    margin-bottom: var(--spacing-lg);
  }

  &__sections {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: var(--spacing-md);
    align-items: start;

    @include respond-below(lg) {
      grid-template-columns: 1fr;
    }
  }

  &__side {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>
