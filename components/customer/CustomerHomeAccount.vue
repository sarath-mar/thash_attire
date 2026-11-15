<template>
  <div class="ta-home-account">
    <div v-if="!isAuthenticated" class="ta-home-account__guest">
      <p>Sign in to save your name, mobile number and delivery address.</p>
      <NuxtLink :to="{ path: '/login', query: { redirect: '/?panel=profile' } }" class="ta-home-account__btn">Sign in</NuxtLink>
    </div>

    <template v-else>
      <v-form ref="formRef" class="ta-home-account__form" @submit.prevent="save">
        <CommonAppTextField v-model="name" label="Full name" :rules="[requiredRule()]" />
        <CommonAppTextField :model-value="email" label="Email" readonly />
        <CommonAppTextField
          v-model="phone"
          label="Mobile number"
          placeholder="10-digit mobile"
          :rules="[phoneRule()]"
        />
        <v-textarea v-model="address" label="Delivery address" variant="outlined" rows="3" auto-grow />
        <div class="ta-home-account__actions">
          <CommonAppButton premium type="submit" :loading="loading">Save details</CommonAppButton>
          <button type="button" class="ta-home-account__logout" @click="logout">Log out</button>
        </div>
      </v-form>
    </template>
  </div>
</template>

<script setup>
import { requiredRule, phoneRule } from '~/utils/validation.js'
import { cleanPhone } from '~/helpers/phone.js'

const { isAuthenticated, profile, user, loading, saveProfile, logout } = useCustomerAuth()
const formRef = ref(null)
const name = ref('')
const phone = ref('')
const address = ref('')

const email = computed(() => profile.value?.email || user.value?.email || '')

watch(profile, (value) => {
  if (!value) return
  name.value = value.name || ''
  phone.value = value.phone || ''
  address.value = value.address || ''
}, { immediate: true })

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  await saveProfile({
    name: name.value.trim(),
    phone: cleanPhone(phone.value),
    address: address.value.trim(),
  })
}
</script>

<style scoped lang="scss">
.ta-home-account {
  display: grid;
  gap: var(--spacing-xl);
  max-width: 720px;

  &__guest p,
  &__orders p {
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-md);
  }

  &__btn,
  &__logout {
    @include button-reset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 18px;
    background: #d9707a;
    color: #fbf4ec;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 0.72rem;
    font-weight: 600;
    text-decoration: none;
  }

  &__logout {
    background: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  h3 {
    font-family: var(--font-heading);
    font-size: 1.8rem;
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
  }

  &__orders ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__orders li {
    display: grid;
    grid-template-columns: 1fr 1.4fr auto;
    gap: var(--spacing-sm);
    padding: 10px 0;
    border-bottom: 1px solid var(--color-border);

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
