<template>
  <div class="ta-admin-login">
    <div class="ta-admin-login__card">
      <div class="ta-admin-login__header">
        <h1 class="ta-admin-login__title">Thash Attire</h1>
        <p class="ta-admin-login__subtitle">Admin Panel</p>
      </div>

      <v-form ref="formRef" v-model="isValid" @submit.prevent="handleLogin">
        <CommonAppTextField
          v-model="email"
          label="Email"
          type="email"
          prepend-icon="mdi-email-outline"
          :rules="[requiredRule(), emailRule()]"
          class="ta-admin-login__field"
        />

        <CommonAppTextField
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-icon="mdi-lock-outline"
          :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[requiredRule()]"
          class="ta-admin-login__field"
          @click:append-inner="showPassword = !showPassword"
        />

        <CommonAppButton
          premium
          block
          type="submit"
          :loading="loading"
          :disabled="!isValid"
          class="ta-admin-login__submit"
        >
          Sign In
        </CommonAppButton>
      </v-form>

      <NuxtLink to="/" class="ta-admin-login__back">
        &larr; Back to website
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { requiredRule, emailRule } from '~/utils/validation.js'
import { PageTitles } from '~/constants/pageTitles.js'
import { Routes } from '~/constants/routes.js'

definePageMeta({
  layout: 'blank',
  middleware: 'guest',
})

useHead({ title: PageTitles.ADMIN_LOGIN })

const { login, loading } = useAuth()

const formRef = ref(null)
const isValid = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const success = await login(email.value, password.value)
  console.log('sher success', success)

  if (success) {
    await navigateTo(Routes.ADMIN_DASHBOARD)
  }
}
</script>

<style scoped lang="scss">
.ta-admin-login {
  min-height: 100vh;
  @include flex-center;
  background: var(--color-bg-alt);
  padding: var(--spacing-lg);

  &__card {
    width: 100%;
    max-width: 420px;
    @include card(var(--spacing-2xl));
    box-shadow: var(--shadow-lg);
  }

  &__header {
    text-align: center;
    margin-bottom: var(--spacing-2xl);
  }

  &__title {
    @include heading($font-size-2xl);
    margin-bottom: var(--spacing-xs);
  }

  &__subtitle {
    @include body-text($font-size-sm, var(--color-text-muted));
    letter-spacing: $letter-spacing-wider;
    text-transform: uppercase;
  }

  &__field {
    margin-bottom: var(--spacing-md);
  }

  &__submit {
    margin-top: var(--spacing-lg);
  }

  &__back {
    display: block;
    text-align: center;
    margin-top: var(--spacing-xl);
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    @include transition(color);

    &:hover {
      color: var(--color-text-primary);
    }
  }
}
</style>
