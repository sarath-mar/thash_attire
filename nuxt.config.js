// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: true,

  css: [
    '@mdi/font/css/materialdesignicons.min.css',
    '~/assets/scss/main.scss',
  ],

  modules: ['vuetify-nuxt-module'],

  vuetify: {
    moduleOptions: {
      styles: { configFile: 'assets/scss/vuetify-settings.scss' },
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'thashLight',
        themes: {
          thashLight: {
            dark: false,
            colors: {
            primary: '#231A1D',
            secondary: '#6F6063',
            accent: '#D9707A',
              error: '#C0392B',
              warning: '#D4A574',
              info: '#6B7280',
              success: '#2D6A4F',
              background: '#FBF4EC',
              surface: '#FFFCF7',
            },
          },
          thashDark: {
            dark: true,
            colors: {
              primary: '#F5F0EB',
              secondary: '#C9A96E',
              accent: '#D4AF7A',
              error: '#E74C3C',
              warning: '#F39C12',
              info: '#95A5A6',
              success: '#27AE60',
              background: '#0F0F0F',
              surface: '#1A1A1A',
            },
          },
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      whatsappNumber: process.env.NUXT_PUBLIC_WHATSAPP_NUMBER || '',
      instagramUrl: process.env.NUXT_PUBLIC_INSTAGRAM_URL || '',
    },
  },

  app: {
    head: {
      title: 'Thash Attire',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Your dress, cut & stitched for you. Every Thash dress is made after your measurements, one at a time.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Dancing+Script:wght@500&family=Jost:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/abstracts/variables" as *; @use "~/assets/scss/abstracts/mixins" as *;',
        },
      },
    },
  },
})
