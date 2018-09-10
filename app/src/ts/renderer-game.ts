import '../css/game.css'
import { remote, ipcRenderer, Event } from 'electron'
import { parse } from 'path'
import { Note, ShortNote, LongNote, newImage, keyBind, liveResult } from './renderer/game'
import Vue from 'vue'
import Game from '../vue/MishiroGame.vue'
const prefix = 60

window.addEventListener('load', () => {
  keyBind()
  let canvasLive = document.getElementById('live') as HTMLCanvasElement

  Note.CTX = canvasLive.getContext('2d') as CanvasRenderingContext2D
  let canvasIconBar = document.getElementById('iconBar') as HTMLCanvasElement

  Note.BACK_CTX = canvasIconBar.getContext('2d') as CanvasRenderingContext2D
  let ctxIconBar = Note.BACK_CTX
  let liveIcon = newImage('./img.asar/live_icon_857x114.png')
  liveIcon.addEventListener('load', function () {
    ctxIconBar.drawImage(this, 211.5, 586)
  }, false)

}, false)

ipcRenderer.on('start', (_event: Event, song: any, fromWindowId: number) => {
  let name = parse(song.src).name.split('-')[1]
  document.getElementsByTagName('title')[0].innerHTML = liveResult.name = name
  liveResult.fullCombo = song.fullCombo
  let isCompleted = false
  window.addEventListener('beforeunload', () => {
    const fromWindow = remote.BrowserWindow.fromId(fromWindowId)
    fromWindow.webContents.send('liveEnd', liveResult, isCompleted)
  })
  let music = new Audio(song.src)
  const msbp = 60 / song.bpm * 1000
  const DELAY = Note.DISTANCE / Note.PX_SPEED
  music.addEventListener('play', () => {
    for (let i = 0; i < song.score.length; i++) {
      const note = song.score[i]
      setTimeout(() => {
        // tslint:disable-next-line:no-unused-expression
        if (!note[2]) new ShortNote(note[1])
        // tslint:disable-next-line:no-unused-expression
        else new LongNote(note[1], note[2] * msbp * Note.PX_SPEED)
      }, note[0] * msbp - DELAY + prefix)
    }
  }, false)

  music.addEventListener('ended', () => {
    isCompleted = true
    window.close()
  }, false)

  music.play().catch(err => console.log(err))
})

// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  render: h => h(Game)
})
