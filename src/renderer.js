import Vue from 'vue'
import VueI18n from 'vue-i18n'
import app from './template/app.vue'
import zh from './i18n/zh-CN.js'
import ja from './i18n/ja-JP.js'
import vueGlobal from './js/globalProperty.js'
import configurer from './js/config.js'
let config = configurer.getConfig()
Vue.use(VueI18n)
Vue.use(vueGlobal)

const i18n = new VueI18n({
  locale: config.language ? config.language : 'zh',
  messages: {
    zh,
    ja
  }
})

window.app = new Vue({
  el: '#app',
  i18n,
  render: h => h(app)
})
