import { parse, relative } from 'path'
import { remote } from 'electron'

let liveResult: any = {
  perfect: 0,
  great: 0,
  nice: 0,
  bad: 0,
  miss: 0,
  maxCombo: 0,
  combo: 0,
  hp: 100
}

// let comboDom = document.getElementById('combo')
// if (comboDom === null) throw new Error('#comboDom null')
// let numberDom = comboDom.getElementsByClassName('combo-number')[0]
// let hpDom = document.getElementById('hp')

// let model: any = {
//   combo: 0,
//   hp: 100
// }

// Object.defineProperties(liveResult, {
//   combo: {
//     configurable: true,
//     enumerable: true,
//     get () {
//       return model.combo
//     },
//     set (n) {
//       model.combo = n
//       if (comboDom !== null) {
//         if (n > 0) {
//           comboDom.style.display = 'flex'
//           numberDom.innerHTML = n
//         } else {
//           comboDom.style.display = 'none'
//         }
//       }
//     }
//   },
//   hp: {
//     configurable: true,
//     enumerable: true,
//     get () {
//       return model.hp
//     },
//     set (h) {
//       model.hp = h
//       if (hpDom !== null) {
//         hpDom.style.width = h + '%'
//         if (h <= 40 && h > 20) {
//           hpDom.className = 'hp warning'
//         } else if (h <= 20) {
//           hpDom.className = 'hp dangerous'
//         } else {
//           hpDom.className = 'hp'
//         }
//       }
//     }
//   }
// })

function createAudio (src: string) {
  const audio = new Audio(src)
  audio.preload = 'auto'
  return audio
}

let se = {
  clap: createAudio('../../asset/se.asar/se_live_clap.mp3'),
  fullcombo: createAudio('../../asset/se.asar/se_live_fullcombo.mp3'),
  longLoop: createAudio('../../asset/se.asar/se_live_long_loop.mp3'),
  tapGreat: createAudio('../../asset/se.asar/se_live_tap_great.mp3'),
  tapNice: createAudio('../../asset/se.asar/se_live_tap_nice.mp3'),
  tapPerfect: createAudio('../../asset/se.asar/se_live_tap_perfect.mp3')
}

const rankImg = newImage('../../asset/img.asar/rank.png')

function playSe (se: HTMLAudioElement) {
  if (se.currentTime !== 0) se.currentTime = 0
  se.play().catch(err => console.log(err))
}

function newImage (src: string) {
  let img = new Image()
  img.src = src
  return img
}

class Game {
  public static CTX: CanvasRenderingContext2D
  public static BACK_CTX: CanvasRenderingContext2D
  public static IMG: HTMLImageElement = newImage('../../asset/img.asar/icon_notes.png')
  public static SPEED: number = 12 // x 60 px / s
  public static PX_SPEED: number = Game.SPEED * 60 / 1000
  public static TOP_TO_BOTTOM: number = 592
  public static X: number[] = [238.5, 414.5, 589.5, 764.5, 937.5]
  public static queue: any[][] = [[], [], [], [], []]
  public static W: number = 102
  public static H: number = 102
  public static DISTANCE: number = Game.TOP_TO_BOTTOM + Game.H
  public static RANGE: number = 100
  public static start (song: any, fromWindowId: number) {
    const prefix = 80
    let isCompleted = false
    window.addEventListener('beforeunload', () => {
      const fromWindow = remote.BrowserWindow.fromId(fromWindowId)
      fromWindow.webContents.send('liveEnd', liveResult, isCompleted)
    })

    let name = parse(song.src).name.split('-')[1]
    document.getElementsByTagName('title')[0].innerHTML = liveResult.name = name
    liveResult.fullCombo = song.fullCombo
    let music = process.env.NODE_ENV === 'production' ? new Audio(song.src) : new Audio(relative(__dirname, song.src))
    const msbp = 60 / song.bpm * 1000
    const DELAY = Game.DISTANCE / Game.PX_SPEED
    music.addEventListener('play', () => {
      for (let i = 0; i < song.score.length; i++) {
        const note = song.score[i]
        setTimeout(() => {
          if (!note[2]) ShortNote.new(note[1])
          else LongNote.new(note[1], note[2] * msbp * Game.PX_SPEED)
        }, note[0] * msbp - DELAY + prefix)
      }
    }, false)

    music.addEventListener('ended', () => {
      isCompleted = true
      window.close()
    }, false)

    music.play().catch(err => console.log(err))
  }
}

class Note {
  path: number
  exist: boolean
  x: number
  y: number
  constructor (path: number, distance: number) {
    this.path = path
    this.exist = true
    this.x = Game.X[this.path - 1]
    this.y = Game.TOP_TO_BOTTOM - distance
    Game.queue[this.path - 1].push(this)
  }
}

class ShortNote extends Note {
  private static IMG_POSITION_X: number = 0
  private static IMG_POSITION_Y: number = 0
  t: number
  constructor (path: number, distance: number = Game.DISTANCE, doDrop: boolean = true) {
    super(path, distance)
    this.draw()
    if (doDrop) this.startDrop()
  }

  public static new (path: number, distance: number = Game.DISTANCE, doDrop: boolean = true) {
    return new ShortNote(path, distance, doDrop)
  }

  clean () {
    Game.CTX.clearRect(this.x, this.y, Game.W, Game.H)
  }

  draw () {
    Game.CTX.drawImage(
      Game.IMG,
      ShortNote.IMG_POSITION_X,
      ShortNote.IMG_POSITION_Y,
      Game.W,
      Game.H,
      this.x,
      this.y,
      Game.W,
      Game.H
    )
  }

  update (distance: number) {
    this.clean()
    this.y = Game.TOP_TO_BOTTOM - distance
    this.draw()
  }

  startDrop () {
    this.t = requestAnimationFrame(frame)
    let self = this
    function frame () {
      if (self.y >= Game.TOP_TO_BOTTOM + Game.RANGE * Game.PX_SPEED) {
        self.exist = false
        cancelAnimationFrame(self.t)
        self.clean()
        Game.queue[self.path - 1].shift()
        miss()
      } else if (self.exist) {
        let d = Game.TOP_TO_BOTTOM - self.y
        self.update(d - Game.SPEED)
        self.t = requestAnimationFrame(frame)
      }
    }
  }
}

class LongNote extends Note {
  private static IMG_POSITION_X: number = 102
  private static IMG_POSITION_Y: number = 0
  status: number
  length: number
  t: number
  constructor (path: number, length: number, distance: number = Game.DISTANCE, doDrop: boolean = true) {
    super(path, distance)
    this.status = 0
    this.length = length
    this.draw()
    if (doDrop) this.startDrop()
  }

  public static new (path: number, length: number, distance: number = Game.DISTANCE, doDrop: boolean = true) {
    return new LongNote(path, length, distance, doDrop)
  }

  clean () {
    Game.CTX.clearRect(this.x, this.y - this.length, Game.W + 1, this.length > 0 ? this.length + Game.H : Game.H)
  }

  draw () {
    Game.CTX.beginPath()
    Game.CTX.arc(this.x + Game.W / 2, this.y + Game.W / 2, Game.W / 2, Math.PI, 2 * Math.PI, true)
    Game.CTX.lineTo(this.x + 102, this.y + Game.W / 2 - this.length)
    Game.CTX.arc(this.x + Game.W / 2, this.y + Game.W / 2 - this.length, Game.W / 2, 0, Math.PI, true)
    Game.CTX.lineTo(this.x, this.y + Game.W / 2)
    Game.CTX.fillStyle = 'rgba(255, 255, 255, 0.66)'
    Game.CTX.fill()
    Game.CTX.drawImage(
      Game.IMG,
      LongNote.IMG_POSITION_X,
      LongNote.IMG_POSITION_Y,
      Game.W,
      Game.H,
      this.x,
      this.y - this.length,
      Game.W,
      Game.H
    )
    if (this.status === 0) {
      Game.CTX.drawImage(
        Game.IMG,
        LongNote.IMG_POSITION_X,
        LongNote.IMG_POSITION_Y,
        Game.W,
        Game.H,
        this.x,
        this.y,
        Game.W,
        Game.H
      )
    }
  }

  update (distance: number, length: number) {
    this.clean()
    this.y = Game.TOP_TO_BOTTOM - distance
    this.length = length
    this.draw()
  }

  startDrop () {
    this.t = requestAnimationFrame(frame)
    let self = this
    function frame () {
      if (self.y >= Game.TOP_TO_BOTTOM + Game.RANGE * Game.PX_SPEED) {
        self.exist = false
        cancelAnimationFrame(self.t)
        self.clean()
        Game.queue[self.path - 1].shift()
        miss()
        miss()
        return
      }

      if (self.status === 0 && self.exist) {
        let d = Game.TOP_TO_BOTTOM - self.y
        self.update(d - Game.SPEED, self.length)
        self.t = requestAnimationFrame(frame)
      } else if (self.status === 1 && self.exist) {
        if (self.y - self.length >= Game.TOP_TO_BOTTOM + Game.RANGE * Game.PX_SPEED) {
          self.exist = false
          cancelAnimationFrame(self.t)
          self.clean()
          Game.queue[self.path - 1].shift()
          miss()
          se.longLoop.pause()
          return
        }
        let l = self.length
        self.update(0, l - Game.SPEED)
        self.t = requestAnimationFrame(frame)
      }
    }
  }
}

function tap (note: ShortNote) {
  let dt = Math.abs(note.y - Game.TOP_TO_BOTTOM) / Game.PX_SPEED
  if (dt <= Game.RANGE) {
    note.exist = false
    cancelAnimationFrame(note.t)
    note.clean()
    Game.queue[note.path - 1].shift()
    rank(dt)
  } else {
    playSe(se.clap)
  }
}

function down (note: LongNote) {
  if (note.status === 0) {
    let dt = Math.abs(note.y - Game.TOP_TO_BOTTOM) / Game.PX_SPEED
    if (dt <= Game.RANGE) {
      note.clean()
      rank(dt)
      note.status = 1
      note.length = note.length - (note.y - Game.TOP_TO_BOTTOM)
      se.longLoop.loop = true
      se.longLoop.play().catch(err => console.log(err))
    } else {
      playSe(se.clap)
    }
  }
}

function up (note: LongNote) {
  se.longLoop.pause()
  let dt = Math.abs(note.y - note.length - Game.TOP_TO_BOTTOM) / Game.PX_SPEED
  if (dt <= Game.RANGE) {
    note.exist = false
    cancelAnimationFrame(note.t)
    note.clean()
    Game.queue[note.path - 1].shift()
    rank(dt)
  } else { // miss
    note.exist = false
    cancelAnimationFrame(note.t)
    note.clean()
    Game.queue[note.path - 1].shift()
    miss()
  }
}

function rank (dt: number) {
  if (dt <= 50) {
    liveResult.perfect++
    liveResult.combo++
    if (liveResult.combo > liveResult.maxCombo) liveResult.maxCombo = liveResult.combo
    showRank('perfect')
    playSe(se.tapPerfect)
    // console.log('perfect')
  } else if (dt <= 75) {
    liveResult.great++
    liveResult.combo++
    if (liveResult.combo > liveResult.maxCombo) liveResult.maxCombo = liveResult.combo
    showRank('great')
    playSe(se.tapGreat)
    // console.log('great')
  } else if (dt <= 87.5) {
    liveResult.nice++
    liveResult.combo = 0
    showRank('nice')
    playSe(se.tapNice)
    // console.log('nice')
  } else {
    playSe(se.tapNice)
    liveResult.bad++
    liveResult.combo = 0
    liveResult.hp -= 4
    showRank('bad')
    hpCheck()
    // console.log('bad')
  }
}

function miss () {
  liveResult.miss++
  liveResult.combo = 0
  liveResult.hp -= 6
  showRank('miss')
  hpCheck()
  // console.log('miss')
}

function hpCheck () {
  if (liveResult.hp < 0) window.close()
}

function clearRank () {
  Game.BACK_CTX.clearRect(0, Game.TOP_TO_BOTTOM - 100, 1280, 54)
}

let t = 1
let st: number | NodeJS.Timer = 1
function showRank (rank: string) {
  clearTimeout(st as NodeJS.Timer)
  clearRank()
  let f = 0
  cancelAnimationFrame(t)
  t = requestAnimationFrame(show)

  function show () {
    clearRank()
    if (rank === 'perfect') {
      Game.BACK_CTX.drawImage(
        rankImg,
        0,
        212,
        253,
        54,
        // (1280 - 253) / 2,
        (1280 - f * 253 / 9) / 2,
        // Game.TOP_TO_BOTTOM - 100,
        Game.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 253 / 9,
        f * 54 / 9
      )
    } else if (rank === 'great') {
      Game.BACK_CTX.drawImage(
        rankImg,
        0,
        159,
        208,
        53,
        (1280 - f * 208 / 9) / 2,
        Game.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 208 / 9,
        f * 53 / 9
      )
    } else if (rank === 'nice') {
      Game.BACK_CTX.drawImage(
        rankImg,
        0,
        106,
        141,
        53,
        (1280 - f * 141 / 9) / 2,
        Game.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 141 / 9,
        f * 53 / 9
      )
    } else if (rank === 'bad') {
      Game.BACK_CTX.drawImage(
        rankImg,
        0,
        53,
        128,
        53,
        (1280 - f * 128 / 9) / 2,
        Game.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 128 / 9,
        f * 53 / 9
      )
    } else if (rank === 'miss') {
      Game.BACK_CTX.drawImage(
        rankImg,
        0,
        0,
        151,
        53,
        (1280 - f * 151 / 9) / 2,
        Game.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 151 / 9,
        f * 53 / 9
      )
    }
    if (f >= 9) {
      cancelAnimationFrame(t)
      clearTimeout(st as NodeJS.Timer)
      st = setTimeout(() => {
        clearRank()
      }, 500)
    } else {
      f++
      requestAnimationFrame(show)
    }
  }
}

function keydown (path: number) {
  let note = Game.queue[path - 1][0]
  if (note) {
    if (note.constructor === ShortNote) tap(note)
    else down(note)
  } else {
    playSe(se.clap)
  }
}

function keyup (path: number) {
  let note = Game.queue[path - 1][0]
  if (note && note.constructor === LongNote && note.status === 1) up(note)
}

function keyBind () {
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'c': keydown(1); break
      case 'v': keydown(2); break
      case 'b': keydown(3); break
      case 'n': keydown(4); break
      case 'm': keydown(5); break
      default: break
    }
  }, false)

  window.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'c': keyup(1); break
      case 'v': keyup(2); break
      case 'b': keyup(3); break
      case 'n': keyup(4); break
      case 'm': keyup(5); break
      default: break
    }
  }, false)
}

export { Game, Note, ShortNote, LongNote, newImage, keyBind, liveResult }
