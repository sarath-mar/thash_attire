<template>
  <div class="ta-bag">
    <p v-if="!items.length" class="ta-bag__empty">Your bag is empty. Add a dress to check out.</p>

    <ul v-else class="ta-bag__list">
      <li v-for="item in items" :key="itemKey(item)">
        <img v-if="item.image" :src="item.image" :alt="item.name">
        <div>
          <strong>{{ item.name }}</strong>
          <p>
            <span v-if="item.color">{{ item.color }}</span>
            <span v-if="item.size"> · {{ item.size }}</span>
          </p>
          <div class="ta-bag__qty">
            <button type="button" aria-label="Decrease quantity" @click="setQuantity(itemKey(item), item.quantity - 1)">−</button>
            <span>{{ item.quantity }}</span>
            <button type="button" aria-label="Increase quantity" @click="setQuantity(itemKey(item), item.quantity + 1)">+</button>
            <button type="button" class="ta-bag__remove" @click="removeItem(itemKey(item))">Remove</button>
          </div>
        </div>
        <b>{{ formatCurrency(item.price * item.quantity) }}</b>
      </li>
    </ul>

    <template v-if="items.length">
      <p class="ta-bag__total"><span>Total</span><strong>{{ formatCurrency(subtotal) }}</strong></p>

      <a v-if="!catalogCheckout" class="ta-bag__signin" :href="customOrderLink" target="_blank" rel="noopener">
        Order now
      </a>
      <NuxtLink v-else-if="!isAuthenticated" :to="{ path: '/login', query: { redirect: '/?panel=bag' } }" class="ta-bag__signin">
        Sign in to checkout
      </NuxtLink>

      <v-form v-else ref="formRef" class="ta-bag__form" @submit.prevent="placeOrder">
        <CommonAppTextField v-model="name" label="Full name" :rules="[requiredRule()]" />
        <CommonAppTextField
          v-if="needsPhone"
          v-model="phone"
          label="Mobile number"
          placeholder="10-digit mobile"
          :rules="[requiredRule(), phoneRule()]"
        />
        <p v-else class="ta-bag__phone">Mobile · {{ formatPhone(profile?.phone) }}</p>
        <v-textarea
          v-model="address"
          label="Delivery address"
          variant="outlined"
          rows="3"
          auto-grow
          :rules="[addressRule]"
        />
        <div class="ta-bag__pay">
          <button type="button" :class="{ 'is-on': paymentMethod === 'upi' }" @click="paymentMethod = 'upi'">UPI</button>
          <button type="button" :class="{ 'is-on': paymentMethod === 'cash' }" @click="paymentMethod = 'cash'">Cash on delivery</button>
        </div>
        <CommonAppButton premium block type="submit" :loading="placing">Place order</CommonAppButton>
      </v-form>
    </template>
  </div>
</template>

<script setup>
import { requiredRule, phoneRule } from '~/utils/validation.js'
import { cleanPhone, formatPhone, getWhatsAppLink } from '~/helpers/phone.js'
import { formatCurrency } from '~/helpers/currency.js'
import { CustomerOrderService } from '~/services/CustomerOrderService.js'

const config = useRuntimeConfig()
const { items, subtotal, itemKey, setQuantity, removeItem, clear } = useCart()
const { isAuthenticated, profile, refreshProfile } = useCustomerAuth()
const { closeBag } = useBagDrawer()
const { success, error: showError } = useSnackbar()

const formRef = ref(null)
const placing = ref(false)
const name = ref('')
const phone = ref('')
const address = ref('')
const paymentMethod = ref('upi')

const needsPhone = computed(() => !profile.value?.phone)

const catalogCheckout = computed(() => items.value.every(item => (
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(item.productId || ''))
)))

const customOrderLink = computed(() => {
  const lines = items.value.map(item => `${item.name} × ${item.quantity} · ${formatCurrency(item.price * item.quantity)}`)
  return getWhatsAppLink(config.public.whatsappNumber, `Hi Thash Attire, I’d like to order:\n${lines.join('\n')}`)
})

watch(profile, (value) => {
  if (!value) return
  if (!name.value) name.value = value.name || ''
  if (!address.value) address.value = value.address || ''
}, { immediate: true })

function addressRule(value) {
  if (!value || value.trim().length < 8) return 'Enter a complete delivery address'
  return true
}

async function placeOrder() {
  const { valid } = await formRef.value.validate()
  if (!valid || !items.value.length) return

  placing.value = true
  try {
    const order = await CustomerOrderService.placeOrder({
      items: items.value.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: address.value.trim(),
      paymentMethod: paymentMethod.value,
      name: name.value.trim(),
      phone: needsPhone.value ? cleanPhone(phone.value) : null,
      notes: '',
    })
    clear()
    await refreshProfile()
    closeBag()
    success(`Order ${order.order_number} is placed`)
  } catch (err) {
    showError(err.message)
  } finally {
    placing.value = false
  }
}
</script>

<style scoped lang="scss">
.ta-bag {
  &__empty,
  &__phone {
    color: var(--color-text-secondary);
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--spacing-md);

    li {
      display: grid;
      grid-template-columns: 64px 1fr auto;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--color-border);
    }

    img {
      width: 64px;
      height: 80px;
      object-fit: cover;
      background: var(--color-bg-alt);
    }

    p {
      color: var(--color-text-secondary);
      font-size: 0.85rem;
    }
  }

  &__qty {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;

    button {
      @include button-reset;
      width: 28px;
      height: 28px;
      border: 1px solid var(--color-border);
      border-radius: 50%;
    }
  }

  &__remove {
    width: auto !important;
    border: 0 !important;
    color: var(--color-accent);
    font-size: 0.8rem;
    font-weight: 600;
  }

  &__total {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-md);
    font-family: var(--font-heading);
    font-size: 1.6rem;
  }

  &__signin {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    background: var(--color-primary);
    color: var(--color-text-inverse);
    text-decoration: none;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.78rem;
    font-weight: 600;
  }

  &__pay {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);

    button {
      @include button-reset;
      flex: 1;
      height: 44px;
      border: 1px solid var(--color-border);
      background: var(--color-surface);

      &.is-on {
        background: var(--color-primary);
        color: var(--color-text-inverse);
        border-color: var(--color-primary);
      }
    }
  }
}
</style>
