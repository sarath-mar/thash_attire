<template>
  <div class="ta-auth">
    <p class="ta-auth__eyebrow">Thash Attire</p>
    <h1 class="ta-auth__title">{{ mode === 'register' ? 'Create your account' : 'Welcome back' }}</h1>
    <p class="ta-auth__lead">
      {{ mode === 'register'
        ? 'Save your measurements, addresses and orders. Browsing stays open without an account.'
        : 'Sign in to checkout and see the dresses made for you.' }}
    </p>

    <button type="button" class="ta-auth__google" :disabled="loading" @click="continueWithGoogle">
      <v-icon icon="mdi-google" size="18" />
      Continue with Google
    </button>

    <div class="ta-auth__divider"><span>or</span></div>

    <v-form ref="formRef" v-model="valid" @submit.prevent="submit">
      <CommonAppTextField
        v-if="mode === 'register'"
        v-model="name"
        label="Full name"
        :disabled="codeSent"
        :rules="[requiredRule()]"
      />
      <CommonAppTextField
        v-model="email"
        label="Email"
        type="email"
        :disabled="codeSent"
        :rules="[requiredRule(), emailRule()]"
      />
      <CommonAppTextField
        v-if="mode === 'register'"
        v-model="phone"
        label="Mobile number (optional)"
        placeholder="10-digit mobile"
        :disabled="codeSent"
        :rules="[phoneRule()]"
      />

      <div v-if="codeSent" class="ta-auth__otp">
        <p>Enter the 6-digit code sent to {{ email }}</p>
        <v-otp-input v-model="otp" length="6" type="number" @finish="submit" />
      </div>

      <CommonAppButton premium block type="submit" :loading="loading" class="mt-2">
        {{ codeSent ? 'Verify and continue' : 'Continue with email' }}
      </CommonAppButton>
    </v-form>

    <button v-if="codeSent" type="button" class="ta-auth__text-btn" :disabled="loading" @click="codeSent = false">
      Use a different email
    </button>

    <p class="ta-auth__switch">
      <template v-if="mode === 'register'">
        Already have an account?
        <NuxtLink :to="loginLink">Sign in</NuxtLink>
      </template>
      <template v-else>
        New to Thash Attire?
        <NuxtLink :to="registerLink">Create an account</NuxtLink>
      </template>
    </p>
  </div>
</template>

<script setup>
import { requiredRule, emailRule, phoneRule } from '~/utils/validation.js'
import { cleanPhone } from '~/helpers/phone.js'

const props = defineProps({
  mode: { type: String, default: 'login' },
})

const route = useRoute()
const { error: showError } = useSnackbar()
const {
  loading,
  sendEmailCode,
  verifyEmailCode,
  signInWithGoogle,
  nextPath,
} = useCustomerAuth()

const formRef = ref(null)
const valid = ref(false)
const name = ref('')
const email = ref('')
const phone = ref('')
const otp = ref('')
const codeSent = ref(false)

const redirectQuery = computed(() => {
  const value = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return value ? { redirect: value } : {}
})

const loginLink = computed(() => ({ path: '/login', query: redirectQuery.value }))
const registerLink = computed(() => ({ path: '/register', query: redirectQuery.value }))

function profileDetails() {
  return {
    name: name.value.trim(),
    phone: cleanPhone(phone.value),
  }
}

async function continueWithGoogle() {
  if (props.mode === 'register' && !name.value.trim()) {
    showError('Please enter your name')
    return
  }
  const phoneCheck = phoneRule()(phone.value)
  if (phoneCheck !== true) {
    showError(phoneCheck)
    return
  }
  await signInWithGoogle(profileDetails())
}

async function submit() {
  const { valid: formValid } = await formRef.value.validate()
  if (!formValid) return

  if (!codeSent.value) {
    const sent = await sendEmailCode(email.value, profileDetails())
    if (sent) codeSent.value = true
    return
  }

  if (String(otp.value).length < 6) return
  const verified = await verifyEmailCode(email.value, otp.value)
  if (verified) await navigateTo(nextPath())
}
</script>

<style scoped lang="scss">
.ta-auth {
  width: min(420px, 100%);
  margin-inline: auto;
  padding: 0;
  background: transparent;

  &__eyebrow {
    font-family: var(--font-script);
    font-size: 1.8rem;
    color: var(--color-accent);
    line-height: 1;
    margin-bottom: var(--spacing-sm);
  }

  &__title {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 4vw, 2.6rem);
    font-weight: 500;
    line-height: 1.1;
    color: var(--color-text-primary);
  }

  &__lead {
    margin: var(--spacing-sm) 0 var(--spacing-lg);
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  &__google {
    @include button-reset;
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 1px solid #231a1d;
    border-radius: 0;
    background: transparent;
    color: #231a1d;
    font-weight: 600;
    letter-spacing: 0.02em;

    &:hover:not(:disabled) {
      background: var(--color-accent-light);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  &__divider {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin: var(--spacing-lg) 0;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--color-border);
    }
  }

  &__otp {
    margin-bottom: var(--spacing-md);

    p {
      margin-bottom: var(--spacing-sm);
      color: var(--color-text-secondary);
      font-size: 0.92rem;
    }
  }

  &__text-btn {
    @include button-reset;
    display: block;
    margin: var(--spacing-md) auto 0;
    color: var(--color-accent);
    font-size: 0.9rem;
    font-weight: 600;
  }

  &__switch {
    margin-top: var(--spacing-lg);
    text-align: center;
    color: var(--color-text-secondary);

    a {
      color: var(--color-accent);
      font-weight: 600;
      margin-left: 4px;
    }
  }
}
</style>
