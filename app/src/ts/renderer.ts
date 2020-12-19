import './renderer/preload'

import '../css/mishiro.css'
import './renderer/developer-api'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Mishiro from '../vue/Mishiro.vue'
import zh from './i18n/zh-CN'
import ja from './i18n/ja-JP'
import en from './i18n/en-US'
import vueGlobal from './renderer/vue-global'
import store from './renderer/store'

if (process.env.NODE_ENV !== 'production') Object.defineProperty(window, 'ELECTRON_DISABLE_SECURITY_WARNINGS', { value: true })

// if (process.env.NODE_ENV !== 'production') require('./renderer/socket.ts').connect()

Vue.use(VueI18n)
Vue.use(vueGlobal)

const vm = new Vue({
  i18n: new VueI18n({
    locale: window.preload.configurer.getConfig().language,
    messages: {
      zh,
      ja,
      en
    }
  }),
  store,
  render: (h) => h(Mishiro)
})
vm.$mount('#app')

if (process.env.NODE_ENV !== 'production') {
  if ((module as any).hot) (module as any).hot.accept()
}

// window.addEventListener('beforeunload', () => {
//   remote.app.quit()
// })
