import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Mishiro from '../vue/Mishiro.vue'
import zh from './i18n/zh-CN.js'
import ja from './i18n/ja-JP.js'
import vueGlobal from './renderer/vue-global.js'
import configurer from './common/config.js'

Vue.use(VueI18n)
Vue.use(vueGlobal);

(async function () {
  let config = await configurer.getConfig()

  const i18n = new VueI18n({
    locale: config.language ? config.language : 'zh',
    messages: {
      zh,
      ja
    }
  })

  new Vue({
    el: '#app',
    i18n,
    render: h => h(Mishiro)
  })
})()
