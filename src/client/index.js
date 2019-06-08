import Vue from 'vue'
import App from './App'
import router from './router/index'
import store from './store/store'
import iView from 'iview';
import SocketIO from 'socket.io-client';
import 'iview/dist/styles/iview.css';

import './assets/scss/style.scss'
import './assets/scss/main.scss'

import axios from 'axios'

var socket=SocketIO('/game');
Vue.use(iView);
Vue.config.debug = true
Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.prototype.$socket = socket;

new Vue({
  el: '#app',
  router: router,
  store: store,
  render: h => h(App)
})
