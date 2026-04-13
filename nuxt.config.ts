export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
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
