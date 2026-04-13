export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    head: {
      title: 'SIKUMP UNIKARTA - Intelligence SDM Command',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Intelligence SDM Command Center UNIKARTA - Integrated Human Resource Information System' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#6366f1' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Outfit:wght@100..900&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      productionAssetUrl: process.env.PRODUCTION_ASSET_URL || ''
    }
  },
  modules: [],
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },
})
