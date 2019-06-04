import Vue from 'vue'
import App from './App'
import router from './router/index'
import store from './store/store'
import iView from 'iview';
import 'iview/dist/styles/iview.css';

import './assets/scss/style.scss'
import './assets/scss/main.scss'

import axios from 'axios'

Vue.use(iView);
Vue.config.debug = true
Vue.config.productionTip = false
Vue.prototype.$axios = axios

new Vue({
  el: '#app',
  router: router,
  store: store,
  render: h => h(App)
})
