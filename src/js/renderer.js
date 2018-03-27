import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Mishiro from '../vue/Mishiro.vue'
import zh from './i18n/zh-CN.js'
import ja from './i18n/ja-JP.js'
import en from './i18n/en-US.js'
import vueGlobal from './renderer/vue-global.js'
import { remote } from 'electron'

Vue.use(VueI18n)
Vue.use(vueGlobal)

const i18n = new VueI18n({
  locale: remote.getGlobal('config').language,
  messages: {
    zh,
    ja,
    en
  }
})

new Vue({
  el: '#app',
  i18n,
  render: h => h(Mishiro)
})
