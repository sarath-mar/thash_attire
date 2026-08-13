<template>
  <div class="ta-admin-dashboard">
    <AdminPageHeader
      title="Dashboard"
      subtitle="Overview of your business performance"
    >
      <template #actions>
        <span class="ta-admin-dashboard__date">{{ todayLabel }}</span>
      </template>
    </AdminPageHeader>

    <!-- Sales Stats Row -->
    <section class="ta-admin-dashboard__section">
      <h2 class="ta-admin-dashboard__section-title">Sales</h2>
      <div class="ta-admin-dashboard__stats-grid">
        <AdminStatCard
          label="Today's Revenue"
          :value="stats.today_revenue"
          icon="mdi-currency-inr"
          icon-color="#2d6a4f"
          icon-bg="rgba(45,106,79,0.12)"
          :is-currency="true"
          :loading="loading"
        />
        <AdminStatCard
          label="Monthly Revenue"
          :value="stats.month_revenue"
          icon="mdi-chart-line-variant"
          icon-color="#7e674b"
          icon-bg="rgba(126,103,75,0.12)"
          :is-currency="true"
          :loading="loading"
        />
        <AdminStatCard
          label="Total Revenue"
          :value="stats.total_revenue"
          icon="mdi-bank-outline"
          icon-color="#2d6a4f"
          icon-bg="rgba(45,106,79,0.1)"
          :is-currency="true"
          :loading="loading"
        />
        <AdminStatCard
          label="Total Orders"
          :value="stats.total_orders"
          icon="mdi-clipboard-list-outline"
          icon-color="#c5a059"
          icon-bg="rgba(197,160,89,0.12)"
          :loading="loading"
        />
      </div>
    </section>

    <!-- Order Status Row -->
    <section class="ta-admin-dashboard__section">
      <h2 class="ta-admin-dashboard__section-title">Order Status</h2>
      <div class="ta-admin-dashboard__stats-grid ta-admin-dashboard__stats-grid--6">
        <AdminStatCard
          label="New Orders"
          :value="stats.orders_new"
          icon="mdi-clipboard-check-outline"
          icon-color="#3b82f6"
          icon-bg="rgba(59,130,246,0.1)"
          :loading="loading"
        />
        <AdminStatCard
          label="Awaiting Payment"
          :value="stats.orders_payment_pending"
          icon="mdi-clock-outline"
          icon-color="#f59e0b"
          icon-bg="rgba(245,158,11,0.1)"
          :loading="loading"
        />
        <AdminStatCard
          label="In Stitching"
          :value="stats.orders_in_stitching"
          icon="mdi-needle"
          icon-color="#8b5cf6"
          icon-bg="rgba(139,92,246,0.1)"
          :loading="loading"
        />
        <AdminStatCard
          label="Ready to Ship"
          :value="stats.orders_ready_to_ship"
          icon="mdi-package-variant-closed"
          icon-color="#0ea5e9"
          icon-bg="rgba(14,165,233,0.1)"
          :loading="loading"
        />
        <AdminStatCard
          label="Shipped"
          :value="stats.orders_shipped"
          icon="mdi-truck-outline"
          icon-color="#7e674b"
          icon-bg="rgba(126,103,75,0.12)"
          :loading="loading"
        />
        <AdminStatCard
          label="Delivered"
          :value="stats.orders_delivered"
          icon="mdi-home-check-outline"
          icon-color="#2d6a4f"
          icon-bg="rgba(45,106,79,0.12)"
          :loading="loading"
        />
      </div>
    </section>

    <!-- Profit Row -->
    <section class="ta-admin-dashboard__section">
      <h2 class="ta-admin-dashboard__section-title">This Month — Profit</h2>
      <div class="ta-admin-dashboard__stats-grid">
        <AdminStatCard
          label="Total Product Cost"
          :value="stats.month_product_cost"
          icon="mdi-cash-multiple"
          icon-color="#c0392b"
          icon-bg="rgba(192,57,43,0.08)"
          :is-currency="true"
          :loading="loading"
        />
        <AdminStatCard
          label="Revenue"
          :value="stats.month_revenue_calc"
          icon="mdi-currency-inr"
          icon-color="#2d6a4f"
          icon-bg="rgba(45,106,79,0.12)"
          :is-currency="true"
          :loading="loading"
        />
        <AdminStatCard
          label="Gross Profit"
          :value="stats.month_gross_profit"
          icon="mdi-chart-line"
          icon-color="#7e674b"
          icon-bg="rgba(197,160,89,0.15)"
          :is-currency="true"
          :loading="loading"
        />
        <AdminStatCard
          label="Profit Margin"
          :value="`${stats.month_profit_margin}%`"
          icon="mdi-percent-outline"
          icon-color="#10b981"
          icon-bg="rgba(16,185,129,0.1)"
          :loading="loading"
        />
      </div>
    </section>

    <!-- Inventory Row -->
    <section class="ta-admin-dashboard__section">
      <h2 class="ta-admin-dashboard__section-title">Inventory</h2>
      <div class="ta-admin-dashboard__stats-grid">
        <AdminStatCard
          label="Material Inventory Value"
          :value="stats.total_material_value"
          icon="mdi-warehouse"
          icon-color="#7e674b"
          icon-bg="rgba(126,103,75,0.12)"
          :is-currency="true"
          :loading="loading"
        />
        <AdminStatCard
          label="Low Stock Materials"
          :value="stats.low_stock_materials"
          icon="mdi-alert-outline"
          icon-color="#f59e0b"
          icon-bg="rgba(245,158,11,0.1)"
          :loading="loading"
        />
        <AdminStatCard
          label="Out of Stock"
          :value="stats.out_of_stock_materials"
          icon="mdi-alert-circle-outline"
          icon-color="#c0392b"
          icon-bg="rgba(192,57,43,0.08)"
          :loading="loading"
        />
      </div>
    </section>

    <!-- Charts Row -->
    <section class="ta-admin-dashboard__charts">
      <DashboardSalesChart
        :chart-data="stats.chart_data"
        :loading="loading"
      />
      <DashboardOrderStatusChart
        :stats="stats"
        :loading="loading"
      />
    </section>

    <!-- Data Sections -->
    <div class="ta-admin-dashboard__sections">
      <!-- Recent Orders (renamed from sales) -->
      <DashboardRecentOrders
        :orders="stats.recent_orders"
        :loading="loading"
      />

      <div class="ta-admin-dashboard__side">
        <DashboardLowStockMaterials
          :materials="stats.low_stock_materials_list"
          :loading="loading"
        />
        <DashboardTopProducts
          :products="topProducts"
          :loading="loading"
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

// Reusing useDashboard
const {
  summary,
  recentSales,
  lowStockProducts,
  topProducts,
  fetchAll,
  loadingSummary,
  loadingRecentSales,
  loadingLowStock,
  loadingTopProducts
} = useDashboard()

const loading = computed(() => loadingSummary.value || loadingRecentSales.value || loadingLowStock.value || loadingTopProducts.value)

const stats = computed(() => {
  const s = summary.value || {}
  return {
    today_revenue: 0, // Not explicitly calculated in simplified DashboardService
    month_revenue: s.totalRevenue || 0,
    total_revenue: s.totalRevenue || 0,
    total_orders: s.totalSales || 0,
    orders_new: 0,
    orders_payment_pending: 0,
    orders_in_stitching: 0,
    orders_ready_to_ship: 0,
    orders_shipped: 0,
    orders_delivered: 0,
    month_product_cost: 0,
    month_revenue_calc: s.totalRevenue || 0,
    month_gross_profit: s.estimatedProfit || 0,
    month_profit_margin: s.totalRevenue ? Math.round((s.estimatedProfit / s.totalRevenue) * 100) : 0,
    total_material_value: 0,
    low_stock_materials: 0,
    out_of_stock_materials: 0,
    chart_data: { labels: [], datasets: [] },
    recent_orders: recentSales.value || [],
    low_stock_materials_list: lowStockProducts.value || []
  }
})

const todayLabel = computed(() => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

onMounted(() => {
  fetchAll()
})
</script>

<style scoped lang="scss">
.ta-admin-dashboard {
  &__date {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }

  &__section {
    margin-bottom: var(--spacing-xl);
  }

  &__section-title {
    font-family: var(--font-body);
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wider;
    margin: 0 0 var(--spacing-md) 0;
  }

  &__stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-md);

    @include respond-below(xl) {
      grid-template-columns: repeat(2, 1fr);
    }

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }

    &--6 {
      grid-template-columns: repeat(6, 1fr);

      @include respond-below(xl) {
        grid-template-columns: repeat(3, 1fr);
      }

      @include respond-below(md) {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  &__charts {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);

    @include respond-below(lg) {
      grid-template-columns: 1fr;
    }
  }

  &__sections {
    display: grid;
    grid-template-columns: 1fr 360px;
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
