import dotenv from 'dotenv'
import { DefinePlugin } from 'webpack'
export default {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: 'Trump Barometer',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  pwa: {
    manifest: {
      name: 'Trump Barometer',
      short_name: 'Trump Barometer',
      display: 'standalone',
    },
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: ['element-ui/lib/theme-chalk/index.css'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['@/plugins/element-ui', '@/plugins/vue-lazyload'],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxt/typescript-build', '@aceforth/nuxt-optimized-images'],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Nuxt Optimzed Images Build
   */
  optimizedImages: {
    optimizeImages: true,
  },
  /*
   ** Build configuration
   */
  build: {
    transpile: [/^element-ui/, 'vue-echarts', 'resize-detector'],
    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {}
    extend(config) {
      config.plugins.push(
        new DefinePlugin({
          'process.env': JSON.stringify(
            dotenv.config({ path: './.env' }).parsed
          ),
        })
      )
    },
  },
}
