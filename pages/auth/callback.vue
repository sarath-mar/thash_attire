<template>
  <div class="ta-auth-callback">
    <div v-if="authError" class="ta-auth-callback__card">
      <h1>Sign-in could not be completed</h1>
      <p>{{ authError }}</p>
      <CommonAppButton premium to="/login">Back to sign in</CommonAppButton>
    </div>
    <div v-else class="ta-auth-callback__card">
      <p class="ta-auth-callback__mark">Thash Attire</p>
      <h1>Signing you in</h1>
      <p>Please wait a moment.</p>
    </div>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'

definePageMeta({ layout: 'blank' })
useHead({ title: PageTitles.CUSTOMER_LOGIN })

const { finishRedirectLogin, nextPath, authError } = useCustomerAuth()

onMounted(async () => {
  const ok = await finishRedirectLogin()
  if (ok) await navigateTo(nextPath())
})
</script>

<style scoped lang="scss">
.ta-auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
  background: #fbf4ec;

  &__card {
    width: min(440px, 100%);
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);

    h1 {
      font-family: var(--font-heading);
      font-weight: 500;
      font-size: 2.2rem;
      margin-bottom: var(--spacing-sm);
    }

    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-lg);
    }
  }

  &__mark {
    font-family: var(--font-script);
    font-size: 1.8rem;
    color: var(--color-accent);
  }
}
</style>
