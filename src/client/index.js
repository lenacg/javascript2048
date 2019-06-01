import Vue from 'vue'
import App from './App'
import router from './router/index'
import store from './store/store'

import './assets/scss/style.scss'
import './assets/scss/main.scss'

import axios from 'axios'

Vue.config.debug = true
Vue.config.productionTip = false
Vue.prototype.$axios = axios

new Vue({
  el: '#app',
  router: router,
  store: store,
  render: h => h(App)
})
