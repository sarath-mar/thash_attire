<template>
  <div class="ed" @keydown.esc="onEscape">
    <svg ref="trailSvg" class="ed-trail" aria-hidden="true">
      <path ref="trailPath" />
    </svg>

    <div ref="frameRef" class="ed-frame">
      <aside class="ed-left">
        <div class="ed-brand">
          <a class="ed-logo" href="#top" @click.prevent="scrollTo('top')">Thash Attire</a>
          <p class="ed-tag">made for one person only</p>
          <div class="ed-icons">
            <button type="button" class="ed-icon ed-tip" data-tip="Orders" aria-label="Orders" @click="openPanel('orders')">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3.5" width="12" height="17" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 3.5h6V6H9zM9 11h6M9 14.5h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            </button>
            <button type="button" class="ed-icon ed-tip" data-tip="Cart" aria-label="Cart" @click="openPanel('bag')">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
              <span v-if="cartCount" class="ed-icon__count">{{ cartCount }}</span>
            </button>
            <button type="button" class="ed-icon ed-tip" data-tip="Profile" aria-label="Profile" @click="openPanel('profile')">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            </button>
          </div>
          <a class="ed-start" href="#contact" @click.prevent="scrollTo('contact')">Start your dress</a>
        </div>
        <nav class="ed-nav" aria-label="Page">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="`#${item.id}`"
            :class="{ 'is-on': activeSection === item.id }"
            @click.prevent="scrollTo(item.id)"
          >
            <i />
            {{ item.label }}
          </a>
        </nav>
      </aside>

      <div ref="cutLine" class="ed-line" />
      <svg ref="scissors" class="ed-scissors" viewBox="-24 -62 48 112" aria-hidden="true">
        <g transform="translate(0 28)">
          <g ref="armLeft">
            <path d="M0 0 L-4 -52" stroke="#231a1d" stroke-width="3.5" stroke-linecap="round" />
            <circle cx="-9" cy="8" r="8" fill="#fbf4ec" stroke="#231a1d" stroke-width="3" />
          </g>
          <g ref="armRight">
            <path d="M0 0 L4 -52" stroke="#231a1d" stroke-width="3.5" stroke-linecap="round" />
            <circle cx="9" cy="8" r="8" fill="#fbf4ec" stroke="#231a1d" stroke-width="3" />
          </g>
        </g>
      </svg>
      <div ref="zipLine" class="ed-zip-line" aria-hidden="true" />
      <div ref="zipper" class="ed-zip" aria-hidden="true">
        <div class="ed-zip__cap" />
        <div ref="zipHandle" class="ed-zip__handle">
          <div class="ed-zip__hole" />
        </div>
      </div>

      <main ref="scroller" class="ed-sc">
        <div ref="track" class="ed-track">
        <section id="top" class="ed-sec ed-hero">
          <div class="ed-hero-grid">
            <div class="ed-hero-copy">
              <span class="ed-lab ed-rv">new season ↘</span>
              <h1 class="ed-rv">Dresses,<br>cut for <em>you.</em></h1>
              <div class="ed-rv">
                <a class="ed-btn ed-btn--rose" href="#contact" @click.prevent="scrollTo('contact')">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Start your dress
                </a>
                <button type="button" class="ed-btn" @click="scrollTo('work')">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="4" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="13" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="13" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
                  Collections
                </button>
              </div>
              <p class="ed-love ed-rv">Made with love. Delivered to your doorstep.</p>
            </div>
            <div class="ed-panel ed-rv">
              <div class="ed-photo-wrap">
                <img
                  v-for="(src, index) in heroSlides"
                  :key="src"
                  class="ed-photo"
                  :class="{ 'is-on': index === heroIndex }"
                  :src="src"
                  alt="Thash Attire dress"
                >
                <span class="ed-photo-tag">Yours</span>
              </div>
              <div class="ed-script">made for you, with love</div>
            </div>
          </div>
        </section>

        <section id="look" class="ed-sec">
          <div class="ed-lookbook">
            <figure v-for="look in lookbook" :key="look.key" class="ed-look ed-rv">
              <button type="button" class="ed-look__open" @click="openProduct(look)">
                <img :src="look.image" :alt="look.name">
              </button>
              <figcaption>
                <div>
                  <strong>{{ look.name }}</strong>
                  <span>{{ formatCurrency(look.price) }}</span>
                </div>
                <div class="ed-look__actions">
                  <button
                    type="button"
                    class="ed-tip"
                    :data-tip="addedKey === look.key ? 'Added' : 'Add to cart'"
                    aria-label="Add to cart"
                    @click="addLook(look)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
                  </button>
                  <button type="button" class="ed-tip" data-tip="Order now" aria-label="Order now" @click="buyLook(look)">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </div>
              </figcaption>
            </figure>
          </div>
          <button type="button" class="ed-btn" @click="openAllProducts">See more</button>
        </section>

        <section id="work" class="ed-sec">
          <span class="ed-lab ed-rv">our collections</span>
          <h2 class="ed-rv">Every style,<br>made for you.</h2>
          <div class="ed-cats">
            <button
              v-for="(collection, index) in collections"
              :key="collection.title"
              type="button"
              class="ed-cat ed-rv"
              @click="openAlbum(index)"
            >
              <div class="ed-cat__tile" :style="{ background: collection.palette[1] }">
                <img :src="collection.image" :alt="collection.title">
              </div>
              <h3>{{ collection.title }}</h3>
              <small>{{ collection.items.length }} products</small>
            </button>
          </div>
        </section>

        <section id="reviews" class="ed-sec">
          <span class="ed-lab ed-rv">reviews</span>
          <div class="ed-reviews">
            <article
              v-for="review in reviews"
              :key="review.name"
              class="ed-review ed-rv"
              :style="{ background: review.background }"
            >
              <h3>{{ review.quote }}</h3>
              <p>{{ review.name }}</p>
            </article>
          </div>
        </section>

        <section id="contact" class="ed-sec">
          <div class="ed-contact ed-rv">
            <span class="ed-lab">get in touch</span>
            <h2>Ready to be measured?</h2>
            <a class="ed-btn ed-btn--wa" :href="whatsappLink" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18l1.2-3.4A7 7 0 1 1 12 19a7 7 0 0 1-3.2-.8L6 18z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
              WhatsApp
            </a>
            <a class="ed-btn ed-btn--ivory" :href="instagramUrl" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="16.2" cy="7.8" r="0.8" fill="currentColor"/></svg>
              Instagram
            </a>
            <a class="ed-btn ed-btn--rose" href="mailto:hello@thashattire.com">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 7l7 6 7-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
              Email
            </a>
          </div>
          <footer class="ed-foot ed-rv">
            <span class="ed-logo">Thash Attire</span>
            <span class="ed-script ed-script--ink">Made with love, mom’s care</span>
            <span class="ed-foot__links">
              <button type="button" @click="openPanel('orders')">Orders</button>
              <button type="button" @click="openPanel('profile')">Profile</button>
              <button type="button" @click="openPanel('bag')">Bag</button>
            </span>
            <span>© {{ year }} Thash Attire</span>
          </footer>
        </section>
        </div>
      </main>

      <div class="ed-album" :class="{ 'is-open': albumOpen }">
        <button v-if="albumMode === 'product'" type="button" class="ed-back" @click="albumMode = albumFrom">
          ← {{ albumFrom === 'all' ? 'All products' : activeCollection?.title }}
        </button>
        <button v-else type="button" class="ed-back" @click="closeAlbum">← Home</button>

        <div v-if="albumMode === 'all'" class="ed-catalog">
          <span class="ed-lab">the edit</span>
          <h2>All products</h2>
          <div class="ed-product-grid">
            <button
              v-for="item in allProducts"
              :key="item.key"
              type="button"
              class="ed-product"
              @click="openProduct(item, 'all')"
            >
              <img :src="item.image" :alt="item.name">
              <strong>{{ item.name }}</strong>
              <span>{{ formatCurrency(item.price) }}</span>
            </button>
          </div>
        </div>

        <div v-else-if="albumMode === 'collection' && activeCollection" class="ed-catalog">
          <span class="ed-lab">collection</span>
          <h2>{{ activeCollection.title }}</h2>
          <p class="ed-album__copy">{{ activeCollection.description }}</p>
          <div class="ed-product-grid">
            <button
              v-for="item in activeCollection.items"
              :key="item.key"
              type="button"
              class="ed-product"
              @click="openProduct(item, 'collection')"
            >
              <img :src="item.image" :alt="item.name">
              <strong>{{ item.name }}</strong>
              <span>{{ formatCurrency(item.price) }} · {{ item.images.length }} photos</span>
            </button>
          </div>
        </div>

        <div v-else-if="activeLookItem" class="ed-album__body">
          <div class="ed-stage">
            <button type="button" class="ed-arrow" aria-label="Previous image" @click="stepImage(-1)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
            </button>
            <div class="ed-big" :style="{ background: lookPalette[1] }">
              <img :src="activeLookImage" :alt="activeLook">
            </div>
            <button type="button" class="ed-arrow" aria-label="Next image" @click="stepImage(1)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div>
            <span class="ed-lab">{{ activeCollection.title }}</span>
            <h2>{{ activeLook }}</h2>
            <p class="ed-album__price">{{ formatCurrency(activeLookItem.price) }}</p>
            <p class="ed-album__copy">{{ activeCollection.description }}</p>
            <button type="button" class="ed-btn" @click="addLook(activeLookItem)">Add to cart</button>
            <button type="button" class="ed-btn ed-btn--rose" @click="buyLook(activeLookItem)">Buy now</button>
            <div class="ed-thumbs">
              <button
                v-for="(src, index) in activeLookImages"
                :key="`${activeLook}-${index}`"
                type="button"
                :class="{ 'is-on': index === imageIndex }"
                :aria-label="`${activeLook} photo ${index + 1}`"
                @click="imageIndex = index"
              >
                <img :src="src" :alt="activeLook">
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-show="showWhatsappTab" class="ed-tri">
        <a :href="whatsappLink" target="_blank" rel="noopener" aria-label="Order on WhatsApp">
          <svg viewBox="0 0 200 200">
            <polygon points="8,200 200,200 200,8" fill="#d9707a" stroke="#d9707a" stroke-width="16" stroke-linejoin="round" />
            <path d="M52 200L200 52" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 8" fill="none" />
            <text transform="translate(142 142) rotate(-45)" text-anchor="middle" font-size="13">Order on</text>
            <text transform="translate(149 149) rotate(-45)" text-anchor="middle" font-size="13">WhatsApp ✦</text>
          </svg>
        </a>
        <button type="button" aria-label="Close" @click="showWhatsappTab = false">×</button>
      </div>

      <div v-if="!panel && !albumOpen" class="ed-search">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search a dress"
          aria-label="Search a dress"
          @focus="searchOpen = true"
          @input="searchOpen = true"
        >
        <ul v-if="searchOpen && searchQuery.trim()" class="ed-search__list">
          <li v-if="!searchResults.length">No dresses match that.</li>
          <li v-for="item in searchResults" :key="item.key">
            <button type="button" @click="chooseSearch(item)">
              <img :src="item.image" :alt="item.name">
              <span>{{ item.label || item.name }}</span>
              <b>{{ formatCurrency(item.price) }}</b>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="panel" class="ed-drawer">
        <button type="button" class="ed-drawer__scrim" aria-label="Close panel" @click="closePanel" />
        <aside class="ed-drawer__sheet" role="dialog" :aria-label="panelTitle">
          <header class="ed-drawer__head">
            <h2>{{ panelTitle }}</h2>
            <button type="button" aria-label="Close" @click="closePanel">×</button>
          </header>

          <div v-if="panel === 'orders'" class="ed-orders">
            <template v-if="!isAuthenticated">
              <p>Sign in to see current and past orders.</p>
              <NuxtLink class="ed-btn ed-btn--rose" :to="{ path: '/login', query: { redirect: '/?panel=orders' } }">Sign in</NuxtLink>
            </template>
            <template v-else-if="ordersLoading">
              <p class="ed-drawer__note">Loading your orders…</p>
            </template>
            <template v-else>
              <p v-if="ordersError" class="ed-drawer__note">{{ ordersError }}</p>
              <h3>Current</h3>
              <p v-if="!currentOrders.length" class="ed-drawer__note">No orders in progress.</p>
              <ul v-else>
                <li v-for="order in currentOrders" :key="order.id">
                  <span>{{ order.order_number }}</span>
                  <span>{{ orderLabel(order) }}</span>
                  <b>{{ orderStatusLabel(order.status) }}</b>
                  <strong>{{ formatCurrency(order.final_amount) }}</strong>
                </li>
              </ul>
              <h3>Past</h3>
              <p v-if="!pastOrders.length" class="ed-drawer__note">No past orders yet.</p>
              <ul v-else>
                <li v-for="order in pastOrders" :key="order.id">
                  <span>{{ order.order_number }}</span>
                  <span>{{ orderLabel(order) }}</span>
                  <b>{{ orderStatusLabel(order.status) }}</b>
                  <strong>{{ formatCurrency(order.final_amount) }}</strong>
                </li>
              </ul>
            </template>
          </div>

          <CustomerHomeAccount v-else-if="panel === 'profile'" />
          <CustomerCheckout v-else-if="panel === 'bag'" />
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { DefaultImages } from '~/constants/defaults.js'
import { getWhatsAppLink } from '~/helpers/phone.js'
import { formatCurrency } from '~/helpers/currency.js'
import { ProductService } from '~/services/ProductService.js'
import { StorageService } from '~/services/StorageService.js'
import { StorageBucket } from '~/enums/storageBucket.js'
import { CustomerOrderService } from '~/services/CustomerOrderService.js'
import { OrderStatusLabels } from '~/enums/orderStatus.js'

definePageMeta({ layout: 'blank' })

useHead({
  title: PageTitles.HOME,
  meta: [
    {
      name: 'description',
      content: 'Your dress, cut & stitched for you. No bulk. No stock sizes. Every Thash dress is made after your measurements, one at a time.',
    },
  ],
})

const config = useRuntimeConfig()
const year = new Date().getFullYear()

const gallery = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80',
]

const heroSlides = gallery.slice(0, 6)
const heroIndex = ref(0)

function lookPhotos(seed) {
  return [0, 1, 2].map(step => gallery[(seed + step * 7) % gallery.length])
}

const palettes = [
  ['#d9707a', '#f5d5d3'],
  ['#1f5c46', '#f1d9a0'],
  ['#e8b84a', '#d9e8e0'],
  ['#3b3fa8', '#f5d5d3'],
  ['#e9a3a8', '#f1d9a0'],
  ['#2f7a5b', '#f4e3b8'],
]

const collections = [
  {
    title: 'Casual Wear',
    description: 'Easy everyday dresses, cut for comfort and made to move with you.',
    looks: ['Everyday Kurta Dress', 'Shirt Dress', 'Tiered Midi', 'Wrap Dress', 'A-line Dress', 'Maxi Dress'],
    fabrics: 'Cotton, linen, soft crepe',
  },
  {
    title: 'Co-ord Sets',
    description: 'Matching tops and bottoms, stitched as a pair to your measurements.',
    looks: ['Linen Co-ord', 'Printed Co-ord', 'Kurti Pant Set', 'Skirt Set', 'Crop Set', 'Palazzo Set'],
    fabrics: 'Linen, cotton, rayon',
  },
  {
    title: 'Festive Wear',
    description: 'Rich fabrics and detail for celebrations, made for one person.',
    looks: ['Mehendi Anarkali', 'Silk Lehenga', 'Sharara Set', 'Embroidered Kurta', 'Festive Gown', 'Saree Blouse'],
    fabrics: 'Silk, georgette, brocade',
  },
  {
    title: 'Party Gowns',
    description: 'Statement gowns fitted closely to you and finished by hand.',
    looks: ['Evening Gown', 'Cocktail Dress', 'Fit & Flare', 'Off-shoulder Gown', 'Satin Slip', 'Tulle Gown'],
    fabrics: 'Satin, crepe, tulle',
  },
  {
    title: 'Kurti Sets',
    description: 'Classic kurti sets for work, family and every day in between.',
    looks: ['Straight Kurti Set', 'A-line Kurti Set', 'Cotton Set', 'Printed Set', 'Anarkali Set', 'Angrakha Set'],
    fabrics: 'Cotton, rayon, chanderi',
  },
  {
    title: 'Kids Wear',
    description: 'Soft, comfortable outfits for little ones, made to grow with them.',
    looks: ['Frock', 'Party Frock', 'Ethnic Set', 'Lehenga Choli', 'Casual Dress', 'Twinning Set'],
    fabrics: 'Soft cotton, muslin, silk',
  },
].map((collection, index) => {
  const items = collection.looks.map((name, look) => {
    const seed = index * 6 + look
    const images = lookPhotos(seed)
    return {
      key: `${index}-${look}`,
      name,
      price: 1890 + (seed % 7) * 350,
      images,
      image: images[0],
      collectionIndex: index,
      lookIndex: look,
      label: `${name} · ${collection.title}`,
    }
  })
  return {
    ...collection,
    palette: palettes[index % palettes.length],
    image: items[0].image,
    items,
    lookImages: items.map(item => item.image),
  }
})

const lookbook = collections.slice(0, 3).map(collection => collection.items[0])
const allProducts = collections.flatMap(collection => collection.items)

const route = useRoute()
const { isAuthenticated } = useCustomerAuth()
const { count, addItem } = useCart()
const cartCount = computed(() => count.value)

const navItems = [
  { id: 'look', label: 'Lookbook' },
  { id: 'work', label: 'Collections' },
  { id: 'reviews', label: 'Reviews' },
]

const reviews = [
  { quote: '“The kurta dress sat exactly where I asked — waist, hip, and length.”', name: 'Ananya R., Kochi', background: '#f5d5d3' },
  { quote: '“I sent measurements on WhatsApp. The co-ord arrived ready to wear.”', name: 'Priya Sharma, Bengaluru', background: '#f4e3b8' },
  { quote: '“No one else at the wedding had this colour, because it was cut for me.”', name: 'Meera V., Thrissur', background: '#d9e8e0' },
]

const albumOpen = ref(false)
const albumMode = ref('collection')
const albumFrom = ref('collection')
const panel = ref('')
const shopProducts = ref([])
const orders = ref([])
const ordersError = ref('')
const ordersLoading = ref(false)
const collectionIndex = ref(0)
const lookIndex = ref(0)
const imageIndex = ref(0)
const addedKey = ref('')
const searchQuery = ref('')
const searchOpen = ref(false)
const activeSection = ref('how')
const showWhatsappTab = ref(true)

const frameRef = ref(null)
const scroller = ref(null)
const cutLine = ref(null)
const scissors = ref(null)
const armLeft = ref(null)
const armRight = ref(null)
const trailSvg = ref(null)
const trailPath = ref(null)
const track = ref(null)
const zipper = ref(null)
const zipHandle = ref(null)
const zipLine = ref(null)

const whatsappLink = computed(() =>
  getWhatsAppLink(config.public.whatsappNumber, 'Hi Thash Attire, I’d like to start a dress.'),
)

const instagramUrl = computed(() => config.public.instagramUrl || 'https://instagram.com/thashattire')

const panelTitle = computed(() => {
  if (panel.value === 'orders') return 'Orders'
  if (panel.value === 'bag') return 'Cart'
  return 'Your details'
})

const activeCollection = computed(() => collections[collectionIndex.value] || null)

const activeLookItem = computed(() => activeCollection.value?.items?.[lookIndex.value] || null)

const activeLook = computed(() => activeLookItem.value?.name || '')

const activeLookImages = computed(() => activeLookItem.value?.images || [])

const activeLookImage = computed(() => activeLookImages.value[imageIndex.value] || activeLookItem.value?.image || gallery[0])

const lookPalette = computed(() => palettes[(lookIndex.value + collectionIndex.value) % palettes.length])

const pastStatuses = new Set(['delivered', 'completed', 'cancelled'])

const currentOrders = computed(() => orders.value.filter(order => !pastStatuses.has(order.status)))

const pastOrders = computed(() => orders.value.filter(order => pastStatuses.has(order.status)))

const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []
  const editorial = collections.flatMap(collection => collection.items)
  const remote = shopProducts.value.map(product => ({
    key: product.id,
    name: product.name,
    label: product.name,
    price: Number(product.selling_price) || 0,
    image: productImage(product),
  }))
  return [...remote, ...editorial]
    .filter(item => `${item.name} ${item.label || ''}`.toLowerCase().includes(query))
    .slice(0, 6)
})

const pageIds = ['top', 'look', 'work', 'reviews', 'contact']

const productImage = (product) => {
  const img = product?.images?.[0]
  if (!img) return DefaultImages.PRODUCT
  if (String(img).startsWith('http')) return img
  return StorageService.getPublicUrl(StorageBucket.PRODUCTS, img) || DefaultImages.PRODUCT
}

const openPanel = (name) => {
  searchOpen.value = false
  panel.value = name
  if (name === 'orders') loadOrders()
}

const closePanel = () => {
  panel.value = ''
}

function cartPayload(item) {
  if (!item) return null
  return {
    productId: item.productId || item.key,
    name: item.name,
    price: Number(item.price) || 0,
    image: item.image || item.images?.[0] || '',
    size: '',
    color: '',
    quantity: 1,
    sku: item.sku || '',
  }
}

function addLook(item) {
  const payload = cartPayload(item)
  if (!payload) return
  addItem(payload)
  addedKey.value = item.key
}

function buyLook(item) {
  const payload = cartPayload(item)
  if (!payload) return
  addItem(payload)
  searchOpen.value = false
  panel.value = 'bag'
}

function chooseSearch(item) {
  searchOpen.value = false
  searchQuery.value = ''
  if (item.collectionIndex == null) {
    openAllProducts()
    return
  }
  openProduct(item, 'all')
}

function orderLabel(order) {
  return order.product_name || order.sale_items?.[0]?.product_name || 'Custom order'
}

function orderStatusLabel(status) {
  return OrderStatusLabels[status] || 'In progress'
}

async function loadOrders() {
  if (!isAuthenticated.value) return
  ordersLoading.value = true
  ordersError.value = ''
  try {
    orders.value = await CustomerOrderService.getMine()
  } catch (err) {
    ordersError.value = err.message
  } finally {
    ordersLoading.value = false
  }
}

async function loadShop() {
  try {
    const result = await ProductService.getAll({
      limit: 24,
      sortBy: 'created_at',
      sortOrder: 'desc',
    })
    shopProducts.value = result.data || []
  } catch {
    shopProducts.value = []
  }
}

const scrollTo = (id) => {
  const root = scroller.value
  const target = document.getElementById(id)
  if (!root || !target) return
  closeAlbum()
  const limit = Math.max(0, (track.value?.scrollHeight || 0) - root.clientHeight)
  if (id === 'top') {
    cut = 0
    zipPhase = 0
    goal = 0
  } else {
    cut = 1
    zipPhase = 0
    goal = -Math.min(limit, Math.max(0, target.offsetTop - 8))
  }
  if (reduceMotion) {
    pos = goal
    velocity = 0
    goal = null
    applyMotion()
  }
}

const openAlbum = (index) => {
  collectionIndex.value = index
  albumMode.value = 'collection'
  albumFrom.value = 'collection'
  searchOpen.value = false
  albumOpen.value = true
}

const openAllProducts = () => {
  albumMode.value = 'all'
  albumFrom.value = 'all'
  searchOpen.value = false
  albumOpen.value = true
}

const openProduct = (item, from = 'collection') => {
  collectionIndex.value = item.collectionIndex
  lookIndex.value = item.lookIndex
  imageIndex.value = 0
  albumFrom.value = from
  albumMode.value = 'product'
  searchOpen.value = false
  albumOpen.value = true
}

const closeAlbum = () => {
  albumOpen.value = false
}

const stepImage = (direction) => {
  const total = activeLookImages.value.length || 1
  imageIndex.value = (imageIndex.value + direction + total) % total
}

let frameId = 0
let reduceMotion = false
let pos = 0
let velocity = 0
let goal = null
let cut = 0
let zipPhase = 0
let touchY = 0
const touchSamples = []
const trailPoints = []
const TRAIL_LIFE = 200
const SCROLL_SPEED = 0.16
const SCROLL_FRICTION = 0.86
const MAX_VELOCITY = 28
const TOOL_RANGE = 520

const applyMotion = () => {
  const root = scroller.value
  const frame = frameRef.value
  const board = track.value
  if (!root || !frame || !board) return

  const pages = board.querySelectorAll('.ed-sec')
  const stageH = root.clientHeight
  const wideMotion = window.innerWidth > 860
  if (!wideMotion) {
    cut = 1
    zipPhase = 0
  }
  pages.forEach((section, index) => {
    if (index === 0) return
    if (index === pages.length - 1) {
      section.style.minHeight = wideMotion ? `${stageH}px` : ''
      return
    }
    section.style.minHeight = ''
  })

  const limit = Math.max(0, board.scrollHeight - root.clientHeight)

  if (goal != null) {
    const diff = goal - pos
    if (Math.abs(diff) < 1.5) {
      pos = goal
      velocity = 0
      goal = null
    } else {
      velocity = diff * 0.08
    }
  }

  if (pos >= -1 && velocity > 0 && cut > 0) {
    cut = Math.max(0, cut - velocity / 36)
    velocity = 0
  }
  const tail = pages[pages.length - 1]
  const tailTop = tail ? tail.offsetTop + pos : 0
  if (cut >= 1 && limit > 0 && pos <= -limit + 1 && tailTop <= 24 && velocity < 0 && zipPhase < 1) {
    zipPhase = Math.min(1, zipPhase - velocity / 36)
    velocity = 0
  }

  const coasting = window.innerWidth <= 860 && goal == null
  const cap = goal != null ? 72 : (coasting ? 110 : MAX_VELOCITY)
  velocity = Math.max(-cap, Math.min(cap, velocity))

  if (!reduceMotion) {
    pos += velocity
    velocity *= coasting ? 0.94 : SCROLL_FRICTION
    if (Math.abs(velocity) < 0.08) velocity = 0
  }

  if (pos < -limit) {
    pos = -limit
    velocity = 0
    if (goal != null && goal <= -limit) goal = null
  }
  if (pos > 0) {
    pos = 0
    velocity = 0
    if (goal != null && goal >= 0) goal = null
  }

  board.style.transform = `translate3d(0, ${pos}px, 0)`

  const first = pages[0]
  const last = pages[pages.length - 1]
  const stageTop = root.offsetTop
  const iconHeight = scissors.value?.getBoundingClientRect().height || 96
  const seamTop = 10

  pages.forEach((section) => {
    section.style.transform = ''
  })

  const bottomY = Math.max(seamTop, stageH - iconHeight * 0.42)
  const scissorsY = bottomY - cut * (bottomY - seamTop)
  const showScissors = wideMotion && cut < 0.98 && pos > -20 && zipPhase < 0.02

  if (scissors.value) {
    scissors.value.style.top = `${stageTop + scissorsY}px`
    scissors.value.style.opacity = showScissors ? '1' : '0'
  }

  const snip = showScissors ? (1 + Math.sin(cut * Math.PI * 8)) / 2 : 0
  const angle = 6 + snip * 18
  armLeft.value?.setAttribute('transform', `rotate(${-angle})`)
  armRight.value?.setAttribute('transform', `rotate(${angle})`)

  const opened = cut >= 1
  const zipping = zipPhase > 0.02
  const leftPane = frame.querySelector('.ed-left')
  leftPane?.classList.toggle('is-framed', opened && !zipping)
  frame.classList.toggle('is-zip', zipping)
  root.classList.toggle('is-open', opened)
  if (first) {
    const sheet = wideMotion && opened
    first.classList.toggle('is-sheet', sheet)
    if (sheet) {
      first.style.height = `${stageH}px`
      first.style.minHeight = `${stageH}px`
      first.style.maxHeight = `${stageH}px`
      first.style.overflow = 'hidden'
    } else {
      first.style.height = ''
      first.style.minHeight = ''
      first.style.maxHeight = ''
      first.style.overflow = ''
    }
    const leave = sheet ? Math.min(1, Math.max(0, -pos / stageH)) : 0
    if (leave > 0.001 && window.innerWidth > 860) {
      const swing = Math.min(1, leave * 1.35)
      const shift = swing * root.clientWidth * 0.42
      const tilt = swing * -18
      first.style.position = 'relative'
      first.style.zIndex = '5'
      first.style.transformOrigin = '0% 100%'
      first.style.transform = `translate3d(${shift.toFixed(1)}px, 0, 0) rotate(${tilt.toFixed(2)}deg)`
    } else {
      first.style.zIndex = ''
      first.style.transformOrigin = ''
    }
  }

  const span = bottomY - seamTop

  if (cutLine.value) {
    const zipY = seamTop + zipPhase * span
    if (zipping && zipPhase < 0.98) {
      const from = zipY + 50
      cutLine.value.style.display = 'block'
      cutLine.value.style.top = `${stageTop + from}px`
      cutLine.value.style.height = `${Math.max(0, stageH - from)}px`
    } else if (!zipping && showScissors && cut > 0.02) {
      const from = scissorsY + iconHeight * 0.58
      cutLine.value.style.display = 'block'
      cutLine.value.style.top = `${stageTop + from}px`
      cutLine.value.style.height = `${Math.max(0, stageH - from)}px`
    } else {
      cutLine.value.style.display = 'none'
    }
  }

  const lastTop = last ? last.offsetTop + pos : stageH
  const apart = opened ? Math.min(1, Math.max(0, lastTop / stageH)) : 0

  if (last && last !== first) {
    const closing = !zipping && apart > 0.02 && window.innerWidth > 860
    last.classList.toggle('is-sheet', closing)
    if (closing) {
      const swing = apart
      const shift = swing * root.clientWidth * 0.42
      const rise = swing * Math.min(stageH * 0.55, 360)
      const tilt = swing * 18
      last.style.position = 'relative'
      last.style.zIndex = ''
      last.style.transformOrigin = '0% 100%'
      last.style.transform = `translate3d(${shift.toFixed(1)}px, ${rise.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`
    } else {
      last.style.zIndex = ''
      last.style.transformOrigin = ''
      last.style.transform = ''
    }
  }

  if (zipper.value) {
    zipper.value.style.opacity = zipPhase > 0.02 ? '1' : '0'
    zipper.value.style.top = `${stageTop + seamTop + zipPhase * span}px`
  }
  if (zipHandle.value) {
    const swing = Math.sin(zipPhase * Math.PI * 2) * 18
    zipHandle.value.style.transform = `rotate(${-42 + zipPhase * 84 + swing}deg)`
  }

  const viewed = -pos + 48
  let current = ''
  pageIds.forEach((id) => {
    const section = document.getElementById(id)
    if (section && section.offsetTop <= viewed) current = id
  })
  activeSection.value = -pos < 40 ? '' : current
}

const drawTrail = () => {
  const path = trailPath.value
  const svg = trailSvg.value
  if (!path || !svg) return
  const now = performance.now()
  while (trailPoints.length && now - trailPoints[0].t > TRAIL_LIFE) trailPoints.shift()
  if (trailPoints.length < 2) {
    path.setAttribute('d', '')
    svg.classList.remove('is-on')
    return
  }
  svg.classList.add('is-on')
  path.setAttribute('d', trailPoints.map((point, index) => (
    `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
  )).join(' '))
}

const loop = () => {
  drawTrail()
  applyMotion()
  frameId = requestAnimationFrame(loop)
}

const onPointerMove = (event) => {
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    trailPoints.push({ x: event.clientX, y: event.clientY, t: performance.now() })
  }
}

const useToolScroll = (delta) => {
  const root = scroller.value
  const board = track.value
  const stageH = root?.clientHeight || 0
  const limit = Math.max(0, (board?.scrollHeight || 0) - stageH)
  const last = board?.querySelector('.ed-sec:last-child')
  const lastTop = last ? last.offsetTop + pos : 0
  const settled = !last || lastTop <= 24
  const atTop = pos >= -8
  const atEnd = cut >= 1 && limit > 0 && pos <= -limit + 8 && settled

  if (delta > 0 && atTop && cut < 1) {
    const need = (1 - cut) * TOOL_RANGE
    cut = Math.min(1, cut + delta / TOOL_RANGE)
    velocity = 0
    goal = null
    if (delta > need) movePage(delta - need)
    return true
  }
  if (delta < 0 && atTop && cut > 0) {
    cut = Math.max(0, cut + delta / TOOL_RANGE)
    velocity = 0
    goal = null
    return true
  }
  if (delta > 0 && atEnd && zipPhase < 1) {
    zipPhase = Math.min(1, zipPhase + delta / TOOL_RANGE)
    velocity = 0
    goal = null
    return true
  }
  if (delta < 0 && atEnd && zipPhase > 0) {
    zipPhase = Math.max(0, zipPhase + delta / TOOL_RANGE)
    velocity = 0
    goal = null
    return true
  }
  return false
}

const wheelPixels = (event) => {
  const raw = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
  if (event.deltaMode === 1) return raw * 42
  if (event.deltaMode === 2) return raw * (scroller.value?.clientHeight || 700)
  return raw
}

const movePage = (delta) => {
  const root = scroller.value
  const board = track.value
  const limit = Math.max(0, (board?.scrollHeight || 0) - (root?.clientHeight || 0))
  pos = Math.max(-limit, Math.min(0, pos - delta))
  velocity = 0
  goal = null
}

const onWheel = (event) => {
  if (panel.value || albumOpen.value || event.target.closest('.ed-album') || event.target.closest('.ed-drawer')) return
  event.preventDefault()
  const delta = wheelPixels(event)
  goal = null
  if (window.innerWidth <= 860) {
    movePage(delta * 2.4)
    return
  }
  if (useToolScroll(delta)) return
  if (cut >= 1) {
    movePage(delta)
    return
  }
  velocity += -delta * SCROLL_SPEED
}

const onTouchStart = (event) => {
  touchY = event.touches[0]?.clientY || 0
  touchSamples.length = 0
  touchSamples.push({ y: touchY, t: performance.now() })
  velocity = 0
  goal = null
}

const onTouchMove = (event) => {
  if (panel.value || albumOpen.value || event.target.closest('.ed-album') || event.target.closest('.ed-drawer')) return
  const nextY = event.touches[0]?.clientY || touchY
  const delta = touchY - nextY
  touchY = nextY
  if (!delta) return
  event.preventDefault()
  goal = null
  const now = performance.now()
  touchSamples.push({ y: nextY, t: now })
  while (touchSamples.length && now - touchSamples[0].t > 90) touchSamples.shift()
  if (window.innerWidth > 860 && cut < 1 && delta > 0) {
    cut = Math.min(1, cut + Math.abs(delta) / 280)
  }
  const gain = window.innerWidth <= 860 ? 2.4 : 1
  movePage(delta * gain)
}

const onTouchEnd = () => {
  if (touchSamples.length < 2) return
  const first = touchSamples[0]
  const last = touchSamples[touchSamples.length - 1]
  const dt = Math.max(16, last.t - first.t)
  const gain = window.innerWidth <= 860 ? 2.4 : 1
  const pxPerMs = ((first.y - last.y) * gain) / dt
  const cap = window.innerWidth <= 860 ? 110 : 42
  velocity = Math.max(-cap, Math.min(cap, -pxPerMs * 16.7))
  if (Math.abs(velocity) < 0.8) velocity = 0
  touchSamples.length = 0
}

const onEscape = () => {
  if (searchOpen.value) {
    searchOpen.value = false
    return
  }
  if (panel.value) closePanel()
  else closeAlbum()
}

const onKeydown = (event) => {
  if (event.key === 'Escape') onEscape()
}

let heroTimer = 0

onMounted(async () => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) {
    heroTimer = window.setInterval(() => {
      heroIndex.value = (heroIndex.value + 1) % heroSlides.length
    }, 4200)
  }
  if (reduceMotion) cut = 1
  const root = scroller.value
  const frame = frameRef.value
  frame?.addEventListener('wheel', onWheel, { passive: false })
  frame?.addEventListener('touchstart', onTouchStart, { passive: true })
  frame?.addEventListener('touchmove', onTouchMove, { passive: false })
  frame?.addEventListener('touchend', onTouchEnd)
  frame?.addEventListener('touchcancel', onTouchEnd)
  window.addEventListener('resize', applyMotion)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pointermove', onPointerMove)
  applyMotion()
  const requested = route.query.panel
  if (requested === 'orders' || requested === 'bag' || requested === 'profile' || window.location.hash === '#you') {
    openPanel(requested === 'orders' || requested === 'bag' ? requested : 'profile')
  }
  loadShop()
  if (!reduceMotion) frameId = requestAnimationFrame(loop)

  const revealItems = root?.querySelectorAll('.ed-rv') || []
  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add('is-in'))
  } else if (root) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      })
    }, { root, threshold: 0.01, rootMargin: '80px 0px' })
    root.querySelectorAll('.ed-sec').forEach((section) => {
      section.querySelectorAll('.ed-rv').forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index, 7) * 80}ms`
        observer.observe(item)
      })
    })
    onUnmounted(() => observer.disconnect())
  }
})

onUnmounted(() => {
  clearInterval(heroTimer)
  cancelAnimationFrame(frameId)
  frameRef.value?.removeEventListener('wheel', onWheel)
  frameRef.value?.removeEventListener('touchstart', onTouchStart)
  frameRef.value?.removeEventListener('touchmove', onTouchMove)
  frameRef.value?.removeEventListener('touchend', onTouchEnd)
  frameRef.value?.removeEventListener('touchcancel', onTouchEnd)
  window.removeEventListener('resize', applyMotion)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointermove', onPointerMove)
})
</script>

<style scoped lang="scss">
.ed {
  --ed-bg: #fbf4ec;
  --ed-card: #fffcf7;
  --ed-ink: #231a1d;
  --ed-mute: #6f6063;
  --ed-rose: #d9707a;
  --ed-line: #f0b9bd;
  --ed-yel: #f1d9a0;
  --rail: clamp(210px, 18vw, 260px);
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  max-width: none;
  z-index: 30;
  background: var(--ed-bg);
  color: var(--ed-ink);
  font: 400 16px/1.6 Jost, sans-serif;
}

.ed-sprite {
  position: absolute;
}

.ed-frame {
  position: absolute;
  top: 16px;
  right: 16px;
  bottom: 16px;
  left: 16px;
  overflow: hidden;
  background: transparent;
  touch-action: none;
}

.ed-left {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--rail);
  z-index: 12;
  background: var(--ed-bg);
  border: 4px dotted var(--ed-ink);
  border-right-color: transparent;
  border-radius: 30px 0 0 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 44px 20px 48px;
  text-align: center;
}

.ed-logo {
  font: 500 40px "Dancing Script", cursive;
  color: var(--ed-rose);
  display: block;
}

.ed-tag,
.ed-start,
.ed-nav,
.ed-btn,
.ed-pills span,
.ed-back,
.ed-foot__links {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ed-tag {
  font-size: 11px;
  margin: 14px 0 20px;
}

.ed-start,
.ed-nav,
.ed-btn {
  font-size: 11.5px;
  font-weight: 600;
}

.ed-start:hover,
.ed-nav a:hover {
  color: var(--ed-rose);
}

button.ed-start {
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.ed-nav {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ed-nav a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ed-nav i {
  width: 20px;
  height: 20px;
  border: 2px solid var(--ed-ink);
  border-radius: 50%;
  transition: 0.3s;
}

.ed-nav a.is-on i {
  background: var(--ed-rose);
  border-color: var(--ed-rose);
  transform: scale(1.15);
}

.ed-line {
  position: absolute;
  left: calc(var(--rail) - 4px);
  width: 4px;
  height: 0;
  border: 0;
  background-image: radial-gradient(circle, #231a1d 2px, transparent 2.2px);
  background-size: 4px 8px;
  background-repeat: repeat-y;
  background-position: center 0;
  z-index: 15;
  pointer-events: none;
  display: none;
}

.ed-zip-line {
  display: none;
}

.ed-scissors {
  position: absolute;
  left: calc(var(--rail) - 22px);
  top: 12px;
  width: 44px;
  height: auto;
  z-index: 20;
  pointer-events: none;
  overflow: visible;
}

.ed-trail {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 80;
  opacity: 0;

  &.is-on {
    opacity: 1;
  }

  path {
    fill: none;
    stroke: #231a1d;
    stroke-width: 2.4px;
    stroke-linecap: square;
    stroke-dasharray: 0.1 8;
  }
}

.ed-left.is-framed {
  border-right-color: var(--ed-ink);
}

.ed-sc {
  position: absolute;
  left: var(--rail);
  right: 0;
  width: auto;
  top: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  box-sizing: border-box;
  border: 4px dotted var(--ed-ink);
  border-left-width: 0;
  border-radius: 0 30px 30px 0;
  background: var(--ed-bg);
}

.ed-sc.is-open {
  border-color: transparent;
  background: transparent;
}

.ed-frame.is-zip .ed-left {
  border-right-color: transparent;
}

.ed-frame.is-zip .ed-sc {
  border-color: var(--ed-ink);
  border-left-width: 0;
  background: var(--ed-bg);
}

.ed-frame.is-zip .ed-sec.is-sheet {
  border-color: transparent;
}

.ed-sec.is-sheet {
  margin-left: 12px;
  width: calc(100% - 12px);
  border: 4px dotted var(--ed-ink);
  border-radius: 0 26px 26px 0;
  box-sizing: border-box;
  background: var(--ed-bg);
}

.ed-zip {
  position: absolute;
  left: calc(var(--rail) - 24px);
  width: 48px;
  height: 48px;
  z-index: 21;
  opacity: 0;
  pointer-events: none;
}

.ed-zip__cap {
  position: absolute;
  top: 15%;
  left: 29%;
  width: 40%;
  height: 70%;
  border: 2px solid #231a1d;
  border-radius: 30%;
  background: #fbf4ec;
  z-index: 2;
}

.ed-zip__handle {
  position: absolute;
  top: 28%;
  left: 4%;
  width: 90%;
  height: 170%;
  border: 2px solid #231a1d;
  border-radius: 8px;
  background: #fbf4ec;
  transform-origin: 50% 22%;
}

.ed-zip__hole {
  position: absolute;
  top: 58%;
  left: 16%;
  width: 64%;
  height: 28%;
  border: 2px solid #231a1d;
  border-radius: 100%;
  background: #fbf4ec;
}

.ed-sec {
  box-sizing: border-box;
  margin: 0;
  padding: 28px 48px 12px;
  background: var(--ed-bg);
}

.ed-sec + .ed-sec {
  margin-top: 72px;
}

#reviews {
  padding-top: 8px;
}

.ed-lab {
  display: block;
  margin-bottom: 4px;
  font: italic 500 24px "Cormorant Garamond", serif;
  color: var(--ed-rose);
}

h1,
h2,
h3 {
  font-family: "Cormorant Garamond", Georgia, serif;
  font-weight: 600;
  margin: 0;
  line-height: 1.05;
}

h2 {
  font-size: clamp(30px, 4vw, 46px);
  margin-bottom: 28px;
}

.ed-hero {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  padding: 28px 40px 20px;
}

.ed-hero h1 {
  font-size: clamp(40px, 4.4vw, 68px);
  letter-spacing: -0.01em;
  margin: 4px 0 14px;
}

.ed-hero h1 em {
  font-style: normal;
  color: var(--ed-rose);
  border-bottom: 4px solid var(--ed-rose);
}

.ed-hero-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 32px;
  align-items: stretch;
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.ed-hero-copy {
  min-width: 0;
  align-self: start;
  padding-top: 72px;
}

.ed-hero-grid p {
  color: var(--ed-mute);
  max-width: 460px;
  margin: 0 0 22px;
}

.ed-love {
  margin-top: 16px !important;
  max-width: none !important;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-style: italic;
  font-size: 18px;
  color: var(--ed-ink) !important;
}

.ed-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid var(--ed-ink);
  border-radius: 99px;
  padding: 12px 22px;
  color: var(--ed-ink);
  background: none;
  margin: 0 8px 8px 0;
  transition: 0.3s;

  svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
  }

  &:hover {
    background: var(--ed-ink);
    color: var(--ed-bg);
  }

  &--rose {
    background: var(--ed-rose);
    border-color: var(--ed-rose);
    color: #fff;

    &:hover {
      background: var(--ed-ink);
      border-color: var(--ed-ink);
      color: var(--ed-bg);
    }
  }

  &--wa {
    background: #1fa971;
    border: 0;
    color: #fff;
  }

  &--ivory {
    background: #fbf4ec;
    border: 0;
    color: #231a1d;
  }
}

.ed-icons {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 0 0 16px;
}

.ed-icon {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid var(--ed-ink);
  background: transparent;
  color: var(--ed-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: var(--ed-ink);
    color: var(--ed-bg);
  }

  &__count {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 99px;
    background: var(--ed-rose);
    color: #fff;
    font-size: 10px;
    line-height: 16px;
    letter-spacing: 0;
    text-transform: none;
  }
}

.ed-lookbook {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.ed-look {
  position: relative;
  overflow: hidden;
  margin: 0;
  border-radius: 18px;
  background: var(--ed-card);
  min-height: 360px;
}

.ed-look__open {
  display: block;
  width: 100%;
  height: 420px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.ed-look figcaption {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  color: #fff;

  strong {
    display: block;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 22px;
    font-weight: 600;
    line-height: 1;
  }

  span {
    font-size: 13px;
    letter-spacing: 0.04em;
  }
}

.ed-look__actions {
  display: flex;
  gap: 6px;

  button {
    position: relative;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 50%;
    background: #fffcf7;
    color: #231a1d;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.ed-tip::after {
  content: attr(data-tip);
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  padding: 5px 8px;
  border-radius: 6px;
  background: #231a1d;
  color: #fbf4ec;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: none;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
}

.ed-tip:hover::after,
.ed-tip:focus-visible::after {
  opacity: 1;
}

.ed-icon.ed-tip::after {
  bottom: auto;
  top: calc(100% + 8px);
}

.ed-search {
  position: absolute;
  z-index: 24;
  top: 22px;
  left: calc(var(--rail) + 40px);
  width: min(380px, 36vw);

  input {
    width: 100%;
    height: 46px;
    border: 0;
    border-radius: 999px;
    padding: 0 18px;
    background: #fffcf7;
    box-shadow: 0 12px 28px rgba(35, 26, 29, 0.12);
    color: var(--ed-ink);
    font: inherit;
    outline: none;
  }

  &__list {
    margin: 8px 0 0;
    padding: 6px;
    list-style: none;
    background: #fffcf7;
    border-radius: 16px;
    box-shadow: 0 18px 40px rgba(35, 26, 29, 0.16);
  }

  li {
    color: var(--ed-mute);
    padding: 8px;
  }

  button {
    width: 100%;
    display: grid;
    grid-template-columns: 42px 1fr auto;
    gap: 10px;
    align-items: center;
    border: 0;
    background: none;
    color: var(--ed-ink);
    text-align: left;
    padding: 6px;
    cursor: pointer;
  }

  img {
    width: 42px;
    height: 54px;
    object-fit: cover;
    border-radius: 8px;
  }

  b {
    font-size: 13px;
  }
}

.ed-panel {
  background: var(--ed-card);
  border: 1.5px dashed var(--ed-line);
  border-radius: 26px;
  padding: 16px 16px 14px;
  text-align: center;
  perspective: 700px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  align-self: stretch;
}

.ed-photo-wrap {
  position: relative;
  width: 100%;
  flex: 0 0 auto;
  aspect-ratio: 3 / 4.2;
  min-height: 560px;
  border-radius: 18px;
  overflow: hidden;
  margin: 0 auto 10px;
}

.ed-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 72%;
  display: block;
  opacity: 0;
  transition: opacity 0.9s ease;

  &.is-on {
    opacity: 1;
  }
}

.ed-photo-tag {
  position: absolute;
  z-index: 2;
  top: 14px;
  right: 14px;
  background: #fffcf7;
  border: 1.5px solid #231a1d;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
}

.ed-script {
  font: 500 20px "Dancing Script", cursive;
  color: var(--ed-rose);

  &--ink {
    color: var(--ed-ink);
  }
}

.ed-pills {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 8px 0;
}

.ed-pills span {
  border: 1.5px solid var(--ed-ink);
  border-radius: 99px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;

  &:last-child {
    background: var(--ed-ink);
    color: var(--ed-bg);
  }
}


.ed-steps,
.ed-cats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.ed-step,
.ed-cat,
.ed-price {
  background: var(--ed-card);
  border: 1.5px dashed var(--ed-line);
}

.ed-step {
  border-radius: 18px;
  padding: 20px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }

  b {
    display: block;
    font: 700 36px "Cormorant Garamond", serif;
    color: var(--ed-rose);
  }

  h3 {
    font-size: 22px;
    margin: 4px 0;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--ed-mute);
  }
}

.ed-cat {
  display: block;
  width: 100%;
  border-radius: 20px;
  padding: 14px;
  text-align: left;
  color: inherit;
  transition: transform 0.35s;

  &:hover {
    transform: translateY(-6px);
  }

  h3 {
    font-size: 26px;
  }

  small {
    color: var(--ed-mute);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 10px;
  }

  &__tile {
    aspect-ratio: 3 / 4;
    border-radius: 14px;
    overflow: hidden;
    display: grid;
    margin-bottom: 12px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.ed-cats {
  grid-template-columns: repeat(3, 1fr);
}

.ed-reviews {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.ed-review {
  border-radius: 18px;
  padding: 28px 22px;
  color: #2a1d20;
  min-height: 220px;

  h3 {
    font-size: clamp(22px, 2vw, 30px);
    line-height: 1.15;
    margin-bottom: 16px;
  }

  p {
    margin: 0;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #5a4a4d;
  }
}

.ed-price {
  max-width: 480px;
  border-radius: 22px;
  padding: 40px 42px;
  text-align: center;

  h2 {
    font-size: 44px;
    margin: 6px 0;
  }

  small {
    color: var(--ed-mute);
  }

  ul {
    list-style: none;
    padding: 0;
    text-align: left;
    font-size: 13px;
    margin: 18px 0;
  }

  li::before {
    content: "✦ ";
    color: var(--ed-rose);
  }
}

.ed-review-nav,
.ed-album__controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.ed-arrow,
.ed-back {
  background: none;
  color: var(--ed-ink);
}

.ed-arrow {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1.5px solid var(--ed-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  svg {
    width: 18px;
    height: 18px;
  }
}

.ed-sec details {
  border-top: 1.5px dashed var(--ed-line);
  padding: 18px 0;

  &:last-of-type {
    border-bottom: 1.5px dashed var(--ed-line);
  }

  p {
    color: var(--ed-mute);
    margin: 8px 0 0;
    font-size: 13px;
  }
}

.ed-sec summary {
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;

  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    content: "+";
    color: var(--ed-rose);
    font-size: 18px;
  }
}

.ed-sec details[open] summary::after {
  content: "–";
}

.ed-contact {
  background: #231a1d;
  color: #fbf4ec;
  border-radius: 24px;
  text-align: center;
  padding: 50px 16px;

  h2 {
    font-size: clamp(28px, 4vw, 44px);
    margin-bottom: 20px;
    color: #fbf4ec;
  }
}

.ed-foot {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 34px 0;
  font-size: 12px;
  align-items: center;

  .ed-logo {
    font-size: 30px;
  }
}

.ed-foot__links {
  display: flex;
  gap: 14px;
  font-size: 11px;
  font-weight: 600;

  button {
    background: none;
    border: 0;
    padding: 0;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    cursor: pointer;
  }
}

.ed-drawer {
  position: absolute;
  inset: 0;
  z-index: 40;

  &__scrim {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(35, 26, 29, 0.32);
    cursor: pointer;
  }

  &__sheet {
    position: absolute;
    top: 16px;
    right: 16px;
    bottom: 16px;
    width: min(520px, calc(100% - 32px));
    overflow: auto;
    background: #fffcf7;
    border: 0;
    border-radius: 28px;
    box-shadow: 0 24px 60px rgba(35, 26, 29, 0.24);
    padding: 28px 24px 48px;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 40px;
    }

    button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1.5px solid var(--ed-ink);
      background: transparent;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
    }
  }

  &__note {
    color: var(--ed-mute);
  }
}

.ed-shop {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  &__card {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    text-align: left;
    cursor: pointer;

    a {
      color: inherit;
      text-decoration: none;
    }

    img {
      width: 100%;
      aspect-ratio: 3 / 4;
      object-fit: cover;
      border-radius: 16px;
      display: block;
      background: #f5d5d3;
    }

    strong {
      display: block;
      margin-top: 8px;
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 22px;
      font-weight: 600;
    }

    > button {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 0;
      background: #fffcf7;
      color: var(--ed-ink);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
}

.ed-rv {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.75s ease, transform 0.75s cubic-bezier(0.2, 0.7, 0.2, 1);

  &.is-in {
    opacity: 1;
    transform: none;
  }
}

.ed-album {
  position: absolute;
  left: var(--rail);
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 8;
  background: var(--ed-bg);
  overflow-y: auto;
  touch-action: pan-y;
  padding: 28px 40px 60px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(24px);
  transition: opacity 0.45s, transform 0.45s;
  scrollbar-width: none;

  &.is-open {
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }
}

.ed-back {
  border: 0;
  font: 600 11.5px Jost, sans-serif;
  letter-spacing: 0.14em;
  margin-bottom: 20px;
  padding: 0;
}

.ed-album__body {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 34px;
}

.ed-stage {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
}

.ed-catalog h2 {
  margin-bottom: 8px;
}

.ed-product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.ed-product {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;

  img {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 16px;
    display: block;
    background: #f5d5d3;
  }

  strong {
    display: block;
    margin-top: 8px;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 22px;
    font-weight: 600;
  }

  span {
    color: var(--ed-mute);
    font-size: 13px;
  }
}

.ed-big {
  aspect-ratio: 4 / 5;
  border-radius: 22px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ed-orders {
  h3 {
    font-size: 28px;
    margin: 8px 0 10px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 18px;
  }

  li {
    display: grid;
    gap: 2px;
    padding: 12px 0;
    border-bottom: 1px solid #f0d2d4;
  }

  b {
    color: var(--ed-rose);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.ed-album__price {
  margin: 8px 0 4px;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 36px;
}

.ed-album__copy {
  color: var(--ed-mute);
  max-width: 420px;
}

.ed-thumbs {
  display: grid;
  grid-template-columns: repeat(3, 72px);
  gap: 8px;
  margin-top: 12px;

  button {
    aspect-ratio: 1;
    border-radius: 12px;
    border: 2px solid transparent;
    padding: 0;
    overflow: hidden;
    display: grid;

    &.is-on {
      border-color: var(--ed-ink);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.ed-facts {
  margin: 18px 0 24px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 20px;
  font-size: 15px;

  dt {
    color: var(--ed-mute);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-size: 11px;
    padding-top: 4px;
  }

  dd {
    margin: 0;
  }
}

.ed-tri {
  position: absolute;
  right: 0;
  bottom: 0;
  width: min(190px, 40vw);
  aspect-ratio: 1;
  z-index: 6;

  svg {
    width: 100%;
    height: 100%;
    display: block;
    transform-origin: 100% 100%;
    transition: transform 0.35s;
  }

  a:hover svg {
    transform: scale(1.1);
  }

  text {
    font-family: Jost, sans-serif;
    fill: #fff;
    font-weight: 700;
  }

  button {
    position: absolute;
    right: 8px;
    bottom: 6px;
    background: none;
    border: 0;
    color: #fff;
    font: 700 16px Jost, sans-serif;
    line-height: 1;
  }
}



@media (max-width: 860px) {
  .ed-frame {
    top: 8px;
    right: 8px;
    bottom: 8px;
    left: 8px;
    border: 4px dotted var(--ed-ink);
    border-radius: 20px;
    background: var(--ed-bg);
  }

  .ed-left,
  .ed-left.is-framed {
    left: 0;
    top: 0;
    width: 100%;
    bottom: auto;
    height: 62px;
    flex-direction: row;
    padding: 8px 16px;
    border: 0;
    border-radius: 0;
    justify-content: space-between;
  }

  .ed-sc,
  .ed-frame.is-zip .ed-sc {
    left: 0;
    right: 0;
    top: 62px;
    bottom: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .ed-brand {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 12px;
  }

  .ed-logo {
    font-size: 30px;
  }

  .ed-tag,
  .ed-nav {
    display: none;
  }

  .ed-sc {
    left: 0;
    right: 0;
    top: 62px;
    bottom: 0;
  }

  .ed-sec {
    padding: 22px 22px 8px;
  }

  .ed-sec + .ed-sec {
    margin-top: 28px;
  }

  .ed-scissors,
  .ed-zip,
  .ed-line {
    display: none;
  }

  .ed-photo-wrap {
    width: 100%;
    height: min(68vh, 560px);
    min-height: 0;
    aspect-ratio: auto;
    flex: 0 0 auto;
    margin-left: auto;
    margin-right: auto;
  }

  .ed-panel {
    order: -1;
  }

  .ed-hero-grid,
  .ed-reviews,
  .ed-album__body {
    grid-template-columns: 1fr;
  }

  .ed-search {
    top: 74px;
    left: 16px;
    right: 16px;
    width: auto;
  }

  .ed-hero-copy {
    padding-top: 64px;
  }

  .ed-lookbook,
  .ed-album__body {
    grid-template-columns: 1fr;
  }

  .ed-product-grid {
    grid-template-columns: 1fr 1fr;
  }

  .ed-look__open {
    height: 280px;
  }

  .ed-stage {
    grid-template-columns: auto 1fr auto;
  }

  .ed-icons {
    margin: 0;
  }

  .ed-start {
    display: none;
  }

  .ed-cats {
    grid-template-columns: 1fr 1fr;
  }

  .ed-album {
    left: 0;
    top: 62px;
    padding: 20px 20px 80px;
  }

  .ed-tri {
    width: 140px;
  }

  .ed-hero h1 {
    font-size: clamp(42px, 12vw, 68px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ed-rv {
    opacity: 1;
    transform: none;
  }

  .ed-sc,
  .ed-album {
    scroll-behavior: auto;
    transition: none;
  }
}
</style>
