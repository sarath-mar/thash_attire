<template>
  <div class="ta-auth-page">
    <CustomerAuthPanel mode="login" />
  </div>
</template>

<script setup>
import { rememberCustomerRedirect } from '~/services/CustomerAuthService.js'
import { safeInternalPath } from '~/helpers/redirect.js'
import { PageTitles } from '~/constants/pageTitles.js'

definePageMeta({ layout: 'blank', middleware: 'customer-guest' })
useHead({ title: PageTitles.CUSTOMER_LOGIN })

const route = useRoute()

onMounted(() => {
  const redirect = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  rememberCustomerRedirect(safeInternalPath(redirect, '/'))
})
</script>

<style scoped lang="scss">
.ta-auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
  background: #fbf4ec;
}
</style>
