import { remote, ipcRenderer } from 'electron'
import { parse } from 'path'
import { Note, ShortNote, LongNote, newImage, keyBind, liveResult } from './renderer/game.js'

window.addEventListener('load', () => {
  keyBind()
  Note.CTX = document.getElementById('live').getContext('2d')
  let ctxIconBar = document.getElementById('iconBar').getContext('2d')
  let liveIcon = newImage('./img/live_icon_857x114.png')
  liveIcon.addEventListener('load', function () {
    ctxIconBar.drawImage(this, 211.5, 586)
  }, false)
}, false)

ipcRenderer.on('start', (event, song, fromWindowId) => {
  let name = parse(song.src).name.split('-')[1]
  document.getElementsByTagName('title')[0].innerHTML = name
  let isCompleted = false
  window.addEventListener('beforeunload', (e) => {
    const fromWindow = remote.BrowserWindow.fromId(fromWindowId)
    fromWindow.webContents.send('liveEnd', liveResult, isCompleted)
  })
  let music = new Audio(song.src)

  music.addEventListener('play', () => {
    for (let i = 0; i < song.score.length; i++) {
      const note = song.score[i]
      setTimeout(() => {
        if (!note[2]) new ShortNote(note[1])
        else new LongNote(note[1], note[2] * 60 / song.bpm * 1000 * Note.PX_SPEED)
      }, note[0] * 60 / song.bpm * 1000 - Note.DISTANCE / Note.PX_SPEED)
    }
  }, false)

  music.addEventListener('ended', () => {
    isCompleted = true
    window.close()
  }, false)

  music.play()
})
