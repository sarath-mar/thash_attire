<template>
  <div class="ed" @keydown.esc="closeAlbum">
    <svg ref="trailSvg" class="ed-trail" aria-hidden="true">
      <path ref="trailPath" />
    </svg>

    <div ref="frameRef" class="ed-frame">
      <aside class="ed-left">
        <div class="ed-brand">
          <a class="ed-logo" href="#top" @click.prevent="scrollTo('top')">Thash Attire</a>
          <p class="ed-tag">made for one person only</p>
          <a class="ed-start" href="#contact" @click.prevent="scrollTo('contact')">{ Start your dress }</a>
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
              <span class="ed-lab">made for one person only ↘</span>
              <h1>Your dress,<br>cut &amp; stitched<br>for <em>you.</em></h1>
              <p>No bulk. No stock sizes. Every Thash dress is made after your measurements, one at a time.</p>
              <a class="ed-btn ed-btn--rose" href="#contact" @click.prevent="scrollTo('contact')">{ Start your dress }</a>
              <a class="ed-btn" href="#work" @click.prevent="scrollTo('work')">See the collection</a>
              <p class="ed-love">Made with love. Delivered to your doorstep.</p>
            </div>
            <div class="ed-panel">
              <div class="ed-photo-wrap">
                <img class="ed-photo" :src="heroPhoto" alt="Thash Attire dress, cut to measure">
                <span class="ed-photo-tag">{{ dressTag }}</span>
              </div>
              <div class="ed-script">made for you, with love</div>
              <div class="ed-pills">
                <span>1. Measure</span>
                <span>2. Cut</span>
                <span>3. Stitch</span>
                <span>4. Deliver</span>
              </div>
            </div>
          </div>
        </section>

        <section id="how" class="ed-sec">
          <span class="ed-lab">how it works</span>
          <h2 class="ed-rv">From your measurements<br>to your doorstep.</h2>
          <div class="ed-steps">
            <article v-for="step in steps" :key="step.n" class="ed-step ed-rv">
              <b>{{ step.n }}</b>
              <h3>{{ step.title }}</h3>
              <p>{{ step.text }}</p>
            </article>
          </div>
        </section>

        <section id="work" class="ed-sec">
          <span class="ed-lab">our collections</span>
          <h2 class="ed-rv">Every style,<br>made for you.</h2>
          <div class="ed-cats">
            <button
              v-for="(collection, index) in collections"
              :key="collection.title"
              type="button"
              class="ed-cat"
              @click="openAlbum(index)"
            >
              <div class="ed-cat__tile" :style="{ background: collection.palette[1] }">
                <img :src="collection.image" :alt="collection.title">
              </div>
              <h3>{{ collection.title }}</h3>
              <small>{{ collection.looks.length }} designs</small>
            </button>
          </div>
        </section>

        <section id="why" class="ed-sec">
          <span class="ed-lab">why made-to-measure</span>
          <h2 class="ed-rv">Problems ready-made<br>can’t solve.</h2>
          <div class="ed-why">
            <article
              v-for="card in whyCards"
              :key="card.title"
              class="ed-why__card ed-rv"
              :style="{ background: card.background }"
            >
              <h3>{{ card.title }}</h3>
              <p>{{ card.text }}</p>
            </article>
          </div>
        </section>

        <section id="pricing" class="ed-sec">
          <div class="ed-price ed-rv">
            <span class="ed-lab">simple pricing</span>
            <h2>From<br>{{ priceLabel }}</h2>
            <small>per dress, made to order</small>
            <ul>
              <li>Stitched to your measurements</li>
              <li>Choose your fabric and colour</li>
              <li>One-to-one help with measuring</li>
              <li>Fitting notes confirmed before we cut</li>
            </ul>
            <a class="ed-btn ed-btn--rose" href="#contact" @click.prevent="scrollTo('contact')">{ Start your dress }</a>
          </div>
        </section>

        <section id="reviews" class="ed-sec">
          <span class="ed-lab">reviews</span>
          <h2>{{ reviews[reviewIndex].quote }}</h2>
          <b>{{ reviews[reviewIndex].name }}</b>
          <div class="ed-review-nav">
            <small>{{ reviewIndex + 1 }} of {{ reviews.length }}</small>
            <button type="button" class="ed-arrow" aria-label="Previous review" @click="stepReview(-1)">←</button>
            <button type="button" class="ed-arrow" aria-label="Next review" @click="stepReview(1)">→</button>
          </div>
        </section>

        <section id="faq" class="ed-sec">
          <span class="ed-lab">questions</span>
          <h2>Good to know.</h2>
          <details v-for="(item, index) in faqs" :key="item.q" :open="index === 0">
            <summary>{{ item.q }}</summary>
            <p>{{ item.a }}</p>
          </details>
        </section>

        <section id="contact" class="ed-sec">
          <div class="ed-contact">
            <span class="ed-lab">get in touch</span>
            <h2>Ready to be measured?</h2>
            <a class="ed-btn ed-btn--wa" :href="whatsappLink" target="_blank" rel="noopener">{ WhatsApp }</a>
            <a class="ed-btn ed-btn--ivory" :href="instagramUrl" target="_blank" rel="noopener">{ Instagram }</a>
            <a class="ed-btn ed-btn--rose" href="mailto:hello@thashattire.com">{ Email }</a>
          </div>
          <footer class="ed-foot">
            <span class="ed-logo">Thash Attire</span>
            <span class="ed-script ed-script--ink">Made with love, mom’s care</span>
            <span class="ed-foot__links">
              <NuxtLink to="/products">Shop</NuxtLink>
              <NuxtLink to="/about">About</NuxtLink>
              <NuxtLink to="/contact">Contact</NuxtLink>
            </span>
            <span>© {{ year }} Thash Attire</span>
          </footer>
        </section>
        </div>
      </main>

      <div class="ed-album" :class="{ 'is-open': albumOpen }">
        <button type="button" class="ed-back" @click="closeAlbum">← All collections</button>
        <div v-if="activeCollection" class="ed-album__body">
          <div>
            <div class="ed-big" :style="{ background: lookPalette[1] }">
              <img :src="activeLookImage" :alt="activeLook">
            </div>
            <div class="ed-album__controls">
              <button type="button" class="ed-arrow" aria-label="Previous design" @click="stepLook(-1)">←</button>
              <button type="button" class="ed-arrow" aria-label="Next design" @click="stepLook(1)">→</button>
              <small>{{ activeLook }} · {{ lookIndex + 1 }} of {{ activeCollection.looks.length }}</small>
            </div>
            <div class="ed-thumbs">
              <button
                v-for="(look, index) in activeCollection.looks"
                :key="look"
                type="button"
                :class="{ 'is-on': index === lookIndex }"
                :style="{ background: palettes[(index + collectionIndex) % palettes.length][1] }"
                :aria-label="look"
                @click="lookIndex = index"
              >
                <img :src="lookImage(index)" :alt="look">
              </button>
            </div>
          </div>
          <div>
            <span class="ed-lab">collection</span>
            <h2>{{ activeCollection.title }}</h2>
            <p class="ed-album__copy">{{ activeCollection.description }}</p>
            <dl class="ed-facts">
              <dt>Fabrics</dt>
              <dd>{{ activeCollection.fabrics }}</dd>
              <dt>Fit</dt>
              <dd>Made to your measurements</dd>
              <dt>Ready in</dt>
              <dd>Confirmed on WhatsApp before we cut</dd>
              <dt>Starting at</dt>
              <dd>{{ priceLabel }}</dd>
            </dl>
            <a class="ed-btn ed-btn--rose" :href="orderLink" target="_blank" rel="noopener">{ Order this style }</a>
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
    </div>
  </div>
</template>

<script setup>
import { PageTitles } from '~/constants/pageTitles.js'
import { getWhatsAppLink } from '~/helpers/phone.js'
import { formatCurrency } from '~/helpers/currency.js'
import { ProductService } from '~/services/ProductService.js'

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
]

const heroPhoto = gallery[2]

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
].map((collection, index) => ({
  ...collection,
  palette: palettes[index % palettes.length],
  image: gallery[index % gallery.length],
  lookImages: collection.looks.map((_, look) => gallery[(index + look) % gallery.length]),
}))

const navItems = [
  { id: 'how', label: 'How it works' },
  { id: 'work', label: 'Collections' },
  { id: 'why', label: 'Why made-to-measure' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
]

const steps = [
  { n: '1', title: 'Share your measurements', text: 'Send them on WhatsApp or use our form. We’ll guide you step by step.' },
  { n: '2', title: 'We cut your fabric', text: 'Your pieces are cut to your numbers, in the fabric and colour you choose.' },
  { n: '3', title: 'We stitch it', text: 'Every seam is stitched with care, and checked against your measurements.' },
  { n: '4', title: 'It reaches you', text: 'Delivered to your door. If the fit needs a small note, message us and we’ll help.' },
]

const whyCards = [
  { title: '“It never fits right.”', text: 'Tight at the hip, loose at the waist. Ours is cut to your numbers, so it sits where it should.', background: '#f5d5d3' },
  { title: '“Everyone has the same one.”', text: 'Because we don’t make in bulk, your dress is made for you alone: your fabric, your colour, your details.', background: '#f4e3b8' },
  { title: '“My size is always sold out.”', text: 'There is no stock to sell out. Every dress starts when you order, in your size.', background: '#d9e8e0' },
]

const reviews = [
  { quote: '“The kurta dress sat exactly where I asked — waist, hip, and length. It feels made, not picked off a rail.”', name: 'Ananya R., Kochi' },
  { quote: '“I sent measurements on WhatsApp and they walked me through each one. The co-ord arrived ready to wear.”', name: 'Priya Sharma, Bengaluru' },
  { quote: '“No one else at the wedding had this colour, because it was cut for me. That is the whole point.”', name: 'Meera V., Thrissur' },
]

const faqs = [
  { q: 'How does made-to-measure work?', a: 'You pick a design, send your measurements (we help you measure), and we cut and stitch the dress for you.' },
  { q: 'How long does it take?', a: 'Timing depends on the design and fabric. We confirm a date on WhatsApp before we cut.' },
  { q: 'Can I change the design or fabric?', a: 'Yes, before we cut. Tell us the fabric, colour, and the details you want changed.' },
  { q: 'Do you deliver across India?', a: 'Yes. We stitch to order and deliver to your doorstep.' },
]

const startingPrice = ref(null)
const reviewIndex = ref(0)
const albumOpen = ref(false)
const collectionIndex = ref(0)
const lookIndex = ref(0)
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

const priceLabel = computed(() => (
  startingPrice.value ? formatCurrency(startingPrice.value) : 'Made to order'
))

const dressTag = computed(() => (
  startingPrice.value ? formatCurrency(startingPrice.value) : 'Yours'
))

const activeCollection = computed(() => collections[collectionIndex.value] || null)

const activeLook = computed(() => activeCollection.value?.looks[lookIndex.value] || '')

const lookImage = (index) => activeCollection.value?.lookImages?.[index] || gallery[0]

const activeLookImage = computed(() => lookImage(lookIndex.value))

const lookPalette = computed(() => palettes[(lookIndex.value + collectionIndex.value) % palettes.length])

const orderLink = computed(() => {
  const collection = activeCollection.value
  if (!collection) return whatsappLink.value
  return getWhatsAppLink(
    config.public.whatsappNumber,
    `Hi Thash Attire, I’d like to order a ${activeLook.value} from ${collection.title}.`,
  )
})

const pageIds = ['top', 'how', 'work', 'why', 'pricing', 'reviews', 'faq', 'contact']

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
  lookIndex.value = 0
  albumOpen.value = true
}

const closeAlbum = () => {
  albumOpen.value = false
}

const stepLook = (direction) => {
  const total = activeCollection.value?.looks.length || 1
  lookIndex.value = (lookIndex.value + direction + total) % total
}

const stepReview = (direction) => {
  reviewIndex.value = (reviewIndex.value + direction + reviews.length) % reviews.length
}

let frameId = 0
let reduceMotion = false
let pos = 0
let velocity = 0
let goal = null
let cut = 0
let zipPhase = 0
let touchY = 0
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
  if (board.dataset.stageH !== String(stageH)) {
    board.dataset.stageH = String(stageH)
    pages.forEach((section) => {
      section.style.minHeight = `${stageH}px`
    })
  }

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
  if (cut >= 1 && limit > 0 && pos <= -limit + 1 && velocity < 0 && zipPhase < 1) {
    zipPhase = Math.min(1, zipPhase - velocity / 36)
    velocity = 0
  }

  const cap = goal != null ? 72 : MAX_VELOCITY
  velocity = Math.max(-cap, Math.min(cap, velocity))

  if (!reduceMotion) {
    pos += velocity
    velocity *= SCROLL_FRICTION
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
  const showScissors = cut < 0.98 && pos > -20 && zipPhase < 0.02

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
    first.classList.toggle('is-sheet', opened)
    first.style.height = `${stageH}px`
    first.style.minHeight = `${stageH}px`
    first.style.maxHeight = `${stageH}px`
    first.style.overflow = 'hidden'
    const leave = opened ? Math.min(1, Math.max(0, -pos / stageH)) : 0
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
      const swing = Math.min(1, apart * 1.35)
      const shift = swing * root.clientWidth * 0.42
      const tilt = swing * -18
      last.style.position = 'relative'
      last.style.zIndex = '5'
      last.style.transformOrigin = '0% 100%'
      last.style.transform = `translate3d(${shift.toFixed(1)}px, 0, 0) rotate(${tilt.toFixed(2)}deg)`
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
  const limit = Math.max(0, (board?.scrollHeight || 0) - (root?.clientHeight || 0))
  const atTop = pos >= -8
  const atEnd = cut >= 1 && limit > 0 && pos <= -limit + 8

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

const movePage = (delta) => {
  const root = scroller.value
  const board = track.value
  const limit = Math.max(0, (board?.scrollHeight || 0) - (root?.clientHeight || 0))
  pos = Math.max(-limit, Math.min(0, pos - delta))
  velocity = 0
  goal = null
}

const onWheel = (event) => {
  if (albumOpen.value || event.target.closest('.ed-album')) return
  event.preventDefault()
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
  goal = null
  if (useToolScroll(delta)) return
  if (cut >= 1) {
    movePage(delta)
    return
  }
  velocity += -delta * SCROLL_SPEED
}

const onTouchStart = (event) => {
  touchY = event.touches[0]?.clientY || 0
  velocity = 0
}

const onTouchMove = (event) => {
  if (albumOpen.value || event.target.closest('.ed-album')) return
  const nextY = event.touches[0]?.clientY || touchY
  const delta = touchY - nextY
  touchY = nextY
  if (!delta) return
  event.preventDefault()
  goal = null
  if (useToolScroll(delta)) return
  if (cut >= 1) {
    movePage(delta)
    return
  }
  velocity += -delta * 0.45
}

const onKeydown = (event) => {
  if (event.key === 'Escape') closeAlbum()
}

onMounted(async () => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) cut = 1
  const root = scroller.value
  const frame = frameRef.value
  frame?.addEventListener('wheel', onWheel, { passive: false })
  frame?.addEventListener('touchstart', onTouchStart, { passive: true })
  frame?.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('resize', applyMotion)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pointermove', onPointerMove)
  applyMotion()
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
    }, { root, threshold: 0.12 })
    revealItems.forEach((item) => observer.observe(item))
    onUnmounted(() => observer.disconnect())
  }

  try {
    const result = await ProductService.getAll({
      limit: 1,
      sortBy: 'selling_price',
      sortOrder: 'asc',
    })
    const price = Number(result.data?.[0]?.selling_price)
    if (price > 0) startingPrice.value = price
  } catch {
    startingPrice.value = null
  }
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  frameRef.value?.removeEventListener('wheel', onWheel)
  frameRef.value?.removeEventListener('touchstart', onTouchStart)
  frameRef.value?.removeEventListener('touchmove', onTouchMove)
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
  padding: 40px 48px 32px;
  background: var(--ed-bg);
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
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: end;
  flex: 1;
  min-height: 0;
  width: 100%;
}

.ed-hero-copy {
  min-width: 0;
  align-self: start;
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
  display: inline-block;
  border: 1.5px solid var(--ed-ink);
  border-radius: 99px;
  padding: 12px 22px;
  color: var(--ed-ink);
  background: none;
  margin: 0 8px 8px 0;
  transition: 0.3s;

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

.ed-panel {
  background: var(--ed-card);
  border: 1.5px dashed var(--ed-line);
  border-radius: 26px;
  padding: 16px;
  text-align: center;
  perspective: 700px;
  height: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  align-self: end;
}

.ed-photo-wrap {
  position: relative;
  width: min(100%, 420px);
  height: min(42vh, 420px);
  flex: 0 0 auto;
  border-radius: 18px;
  overflow: hidden;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ed-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  display: block;
}

.ed-photo-tag {
  position: absolute;
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

.ed-why {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.ed-why__card {
  border-radius: 18px;
  padding: 22px;
  color: #2a1d20;

  h3 {
    font-size: 22px;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #5a4a4d;
  }
}

.ed-price {
  max-width: 340px;
  border-radius: 22px;
  padding: 34px;
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
  font-size: 17px;
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
}

.ed-rv {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s, transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);

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

.ed-album__copy {
  color: var(--ed-mute);
  max-width: 420px;
}

.ed-thumbs {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
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
    padding: 28px 22px 24px;
  }

  .ed-line {
    left: auto;
    right: 28px;
  }

  .ed-scissors,
  .ed-zip {
    left: auto;
    right: 8px;
  }

  .ed-scissors {
    width: 44px;
    height: auto;
  }

  .ed-hero {
    justify-content: flex-start;
    padding: 18px 18px 12px;
  }

  .ed-hero-grid {
    display: flex;
    flex-direction: column;
  }

  .ed-photo-wrap {
    width: min(100%, 280px);
    height: 240px;
    flex: 0 0 auto;
    margin-left: auto;
    margin-right: auto;
  }

  .ed-panel {
    order: -1;
  }

  .ed-hero-grid,
  .ed-steps,
  .ed-why,
  .ed-album__body {
    grid-template-columns: 1fr;
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
