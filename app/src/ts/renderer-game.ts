import '../css/game.css'
import { ipcRenderer, Event } from 'electron'

import { Game, newImage, keyBind } from './renderer/game'
import Vue from 'vue'
import MishiroGame from '../vue/MishiroGame.vue'

window.addEventListener('load', () => {
  keyBind()
  let canvasLive = document.getElementById('live') as HTMLCanvasElement

  Game.CTX = canvasLive.getContext('2d') as CanvasRenderingContext2D
  let canvasIconBar = document.getElementById('iconBar') as HTMLCanvasElement

  Game.BACK_CTX = canvasIconBar.getContext('2d') as CanvasRenderingContext2D
  let ctxIconBar = Game.BACK_CTX
  let liveIcon = newImage('../../asset/img.asar/live_icon_857x114.png')
  liveIcon.addEventListener('load', function () {
    ctxIconBar.drawImage(this, 211.5, 586)
  }, false)

}, false)

ipcRenderer.on('start', (_event: Event, song: any, fromWindowId: number) => {
  Game.start(song, fromWindowId)
})

// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  render: h => h(MishiroGame)
})
