<template>
  <div class="ta-bag">
    <p v-if="!placed && !items.length" class="ta-bag__empty">Your bag is empty. Add a dress to check out.</p>

    <ul v-else-if="items.length" class="ta-bag__list">
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

    <template v-if="placed">
      <div class="ta-bag__placed">
        <h3>Order placed</h3>
        <p>
          Your order is placed. We will get back to you when Thash Attire confirms the order.
          Please pay the amount then, and you will receive your order confirmation.
        </p>
        <p v-if="placed.number" class="ta-bag__ref">Reference {{ placed.number }}</p>
        <a class="ta-bag__wa" :href="placedWhatsapp" target="_blank" rel="noopener">Connect on WhatsApp</a>
      </div>
    </template>

    <template v-else-if="items.length">
      <p class="ta-bag__total"><span>Total</span><strong>{{ formatCurrency(subtotal) }}</strong></p>

      <label class="ta-bag__note">
        <span>Size details & notes</span>
        <textarea
          v-model="note"
          rows="4"
          maxlength="500"
          placeholder="Bust, waist, hip, height, or any fit notes"
        />
      </label>

      <div v-if="!isAuthenticated" class="ta-bag__confirm">
        <p class="ta-bag__lead">Sign in to place this order. Thash Attire confirms it from the admin orders list.</p>
        <NuxtLink class="ta-bag__signin" :to="{ path: '/login', query: { redirect: '/?panel=bag' } }">Sign in</NuxtLink>
      </div>

      <v-form v-else-if="step === 'phone'" ref="phoneForm" class="ta-bag__form" @submit.prevent="continuePhone">
        <p class="ta-bag__lead">Enter your mobile number to place this order.</p>
        <CommonAppTextField
          v-model="phone"
          label="Mobile number"
          placeholder="10-digit mobile"
          :rules="[requiredRule(), phoneRule()]"
        />
        <CommonAppButton premium block type="submit">Continue</CommonAppButton>
      </v-form>

      <div v-else class="ta-bag__confirm">
        <p class="ta-bag__phone">Mobile · {{ formatPhone(cleanPhone(phone)) }}</p>
        <button type="button" class="ta-bag__change" @click="step = 'phone'">Change number</button>
        <CommonAppButton premium block :loading="placing" @click="confirmOrder">Confirm order</CommonAppButton>
      </div>
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
const { isAuthenticated, profile } = useCustomerAuth()
const { error: showError } = useSnackbar()

const phoneForm = ref(null)
const placing = ref(false)
const step = ref('phone')
const phone = ref('')
const note = ref('')
const placed = ref(null)

const catalogCheckout = computed(() => items.value.length > 0 && items.value.every(item => (
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(item.productId || ''))
)))

const placedWhatsapp = computed(() => {
  if (!placed.value) return '#'
  const noteLine = placed.value.note ? ` Notes: ${placed.value.note}` : ''
  const message = `Hi Thash Attire, I placed order ${placed.value.number}. My mobile is ${placed.value.phone}.${noteLine}`
  return getWhatsAppLink(config.public.whatsappNumber, message)
})

watch(profile, (value) => {
  if (value?.phone && !phone.value) phone.value = value.phone
}, { immediate: true })

function sharedOfferId(cartItems) {
  if (!cartItems.length) return null
  const offerId = cartItems[0].offerId
  if (!offerId) return null
  const sameSet = cartItems.every(item => item.offerId === offerId && item.quantity === item.offerQty)
  return sameSet ? offerId : null
}

async function continuePhone() {
  const { valid } = await phoneForm.value.validate()
  if (!valid) return
  step.value = 'confirm'
}

async function confirmOrder() {
  const mobile = cleanPhone(phone.value)
  if (!mobile) {
    step.value = 'phone'
    return
  }

  placing.value = true
  const customerNote = note.value.trim()
  const notes = customerNote
    ? `${customerNote}\n\nConfirm with the customer, then collect payment.`
    : 'Confirm with the customer, then collect payment.'
  let number = `TA${Date.now().toString().slice(-8)}`
  try {
    if (!isAuthenticated.value) {
      showError('Sign in to place this order')
      return
    }
    if (!catalogCheckout.value) {
      showError('One of these dresses is no longer available. Remove it and add it again from the shop.')
      return
    }
    const order = await CustomerOrderService.placeOrder({
      items: items.value.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: profile.value?.address?.trim()?.length >= 8
        ? profile.value.address.trim()
        : 'To be confirmed with you',
      paymentMethod: 'upi',
      name: profile.value?.name || 'Customer',
      phone: mobile,
      notes,
      offerId: sharedOfferId(items.value),
    })
    number = order?.order_number || number
    clear()
    placed.value = { number, phone: mobile, note: customerNote }
    note.value = ''
    step.value = 'phone'
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
  &__phone,
  &__lead,
  &__ref {
    color: var(--color-text-secondary);
  }

  &__lead {
    margin-bottom: var(--spacing-md);
  }

  &__confirm {
    display: grid;
    gap: var(--spacing-sm);
  }

  &__change,
  &__signin {
    @include button-reset;
    justify-self: start;
    color: var(--color-accent);
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    text-decoration: none;
  }

  &__placed {
    display: grid;
    gap: var(--spacing-md);

    h3 {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 500;
      margin: 0;
    }

    p {
      margin: 0;
      line-height: 1.6;
    }
  }

  &__wa {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    background: #1fa971;
    color: #fff;
    text-decoration: none;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.78rem;
    font-weight: 600;
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

  &__note {
    display: grid;
    gap: 6px;
    margin-bottom: var(--spacing-md);

    span {
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    textarea {
      width: 100%;
      min-height: 96px;
      resize: vertical;
      padding: 12px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
      line-height: 1.5;

      &:focus {
        outline: 1px solid var(--color-accent);
        border-color: var(--color-accent);
      }
    }
  }
}
</style>
