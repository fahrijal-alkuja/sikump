export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    head: {
      title: 'SIKUMP UNIKARTA - Intelligence SDM Command',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistem Informasi Kepegawaian UNIKARTA (SIKUMP) - Intelligence SDM Command Center' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
