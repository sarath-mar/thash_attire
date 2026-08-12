<template>
  <div class="ta-dashboard-summary">
    <AdminStatCard
      label="Total Products"
      :value="summary?.totalProducts ?? 0"
      icon="mdi-hanger"
      icon-color="#7e674b"
      icon-bg="rgba(126, 103, 75, 0.12)"
      :loading="loading"
    />
    <AdminStatCard
      label="Total Stock"
      :value="summary?.totalStock ?? 0"
      icon="mdi-package-variant"
      icon-color="#2d6a4f"
      icon-bg="rgba(45, 106, 79, 0.12)"
      :loading="loading"
    />
    <AdminStatCard
      label="Total Customers"
      :value="summary?.totalCustomers ?? 0"
      icon="mdi-account-group"
      icon-color="#6b7280"
      icon-bg="rgba(107, 114, 128, 0.12)"
      :loading="loading"
    />
    <AdminStatCard
      label="Total Sales"
      :value="summary?.totalSales ?? 0"
      icon="mdi-cart-check"
      icon-color="#c5a059"
      icon-bg="rgba(197, 160, 89, 0.12)"
      :loading="loading"
    />
    <AdminStatCard
      label="Total Revenue"
      :value="summary?.totalRevenue ?? 0"
      icon="mdi-currency-inr"
      icon-color="#2d6a4f"
      icon-bg="rgba(45, 106, 79, 0.12)"
      :is-currency="true"
      :loading="loading"
    />
    <AdminStatCard
      label="Total Expenses"
      :value="summary?.totalExpenses ?? 0"
      icon="mdi-cash-minus"
      icon-color="#c0392b"
      icon-bg="rgba(192, 57, 43, 0.12)"
      :is-currency="true"
      :loading="loading"
    />
    <AdminStatCard
      label="Estimated Profit"
      :value="summary?.estimatedProfit ?? 0"
      icon="mdi-chart-line"
      icon-color="#7e674b"
      icon-bg="rgba(197, 160, 89, 0.15)"
      :is-currency="true"
      :loading="loading"
    />
  </div>
</template>

<script setup>
defineProps({
  summary: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped lang="scss">
.ta-dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);

  @include respond-below(md) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
