import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/css/reset.css'
import '@/assets/css/wall.css'
import '@/utils/tagcanvas.js'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
