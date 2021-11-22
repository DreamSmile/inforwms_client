import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/reset.css'
import { setCursor } from './utiles/tools'
import axios from 'axios';

import Head from './components/headName.vue'
Vue.prototype.setCursor = setCursor;
Vue.config.productionTip = false
Vue.prototype.axios = axios;
Vue.prototype.$apiUrl = 'http://192.168.35.96:8900/svr-inforwms/storage/';
Vue.component('headName', Head)
Vue.component('remote-script', {
  render: function (createElement) {
    var self = this;
    return createElement('script', {
      attrs: {
        type: 'text/javascript',
        src: this.src
      },
      on: {
        load: function (event) {
          self.$emit('load', event);
        },
        error: function (event) {
          self.$emit('error', event);
        },
        readystatechange: function (event) {
          if (this.readyState == 'complete') {
            self.$emit('load', event);
          }
        }
      }
    });
  },
  props: {
    src: {
      type: String,
      required: true
    }
  }
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
