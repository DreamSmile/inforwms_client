import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/reset.css'

import Head from './components/headName.vue'

Vue.config.productionTip = false
Vue.prototype.$apiUrl = 'http://192.168.35.96:8900/svr-inforwms/storage/'
Vue.component('headName', Head)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
