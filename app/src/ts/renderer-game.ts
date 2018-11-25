import '../css/game.css'
import Vue from 'vue'
import MishiroGame from '../vue/MishiroGame.vue'

// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  render: h => h(MishiroGame)
})
