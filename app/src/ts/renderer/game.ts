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
  clap: createAudio('./se.asar/se_live_clap.mp3'),
  fullcombo: createAudio('./se.asar/se_live_fullcombo.mp3'),
  longLoop: createAudio('./se.asar/se_live_long_loop.mp3'),
  tapGreat: createAudio('./se.asar/se_live_tap_great.mp3'),
  tapNice: createAudio('./se.asar/se_live_tap_nice.mp3'),
  tapPerfect: createAudio('./se.asar/se_live_tap_perfect.mp3')
}

const rankImg = newImage('./img.asar/rank.png')

function playSe (se: HTMLAudioElement) {
  if (se.currentTime !== 0) se.currentTime = 0
  se.play().catch(err => console.log(err))
}

function newImage (src: string) {
  let img = new Image()
  img.src = src
  return img
}

class Note {
  static CTX: CanvasRenderingContext2D
  static BACK_CTX: CanvasRenderingContext2D
  static IMG: HTMLImageElement = newImage('./img.asar/icon_notes.png')
  static SPEED: number = 12 // x 60 px / s
  static PX_SPEED: number = Note.SPEED * 60 / 1000
  static TOP_TO_BOTTOM: number = 592
  static X: number[] = [238.5, 414.5, 589.5, 764.5, 937.5]
  static queue: any[][] = [[], [], [], [], []]
  static W: number = 102
  static H: number = 102
  static DISTANCE: number = Note.TOP_TO_BOTTOM + Note.H
  static RANGE: number = 100
  path: number
  exist: boolean
  x: number
  y: number
  constructor (path: number, distance: number) {
    this.path = path
    this.exist = true
    this.x = Note.X[this.path - 1]
    this.y = Note.TOP_TO_BOTTOM - distance
    Note.queue[this.path - 1].push(this)
  }
}

class ShortNote extends Note {
  static IMG_POSITION_X: number = 0
  static IMG_POSITION_Y: number = 0
  t: number
  constructor (path: number, distance: number = Note.DISTANCE, doDrop: boolean = true) {
    super(path, distance)
    this.draw()
    if (doDrop) this.startDrop()
  }

  clean () {
    Note.CTX.clearRect(this.x, this.y, Note.W, Note.H)
  }

  draw () {
    Note.CTX.drawImage(
      Note.IMG,
      ShortNote.IMG_POSITION_X,
      ShortNote.IMG_POSITION_Y,
      Note.W,
      Note.H,
      this.x,
      this.y,
      Note.W,
      Note.H
    )
  }

  update (distance: number) {
    this.clean()
    this.y = Note.TOP_TO_BOTTOM - distance
    this.draw()
  }

  startDrop () {
    this.t = requestAnimationFrame(frame)
    let self = this
    function frame () {
      if (self.y >= Note.TOP_TO_BOTTOM + Note.RANGE * Note.PX_SPEED) {
        self.exist = false
        cancelAnimationFrame(self.t)
        self.clean()
        Note.queue[self.path - 1].shift()
        miss()
      } else if (self.exist) {
        let d = Note.TOP_TO_BOTTOM - self.y
        self.update(d - Note.SPEED)
        requestAnimationFrame(frame)
      }
    }
  }
}

class LongNote extends Note {
  static IMG_POSITION_X: number = 102
  static IMG_POSITION_Y: number = 0
  status: number
  length: number
  t: number
  constructor (path: number, length: number, distance: number = Note.DISTANCE, doDrop: boolean = true) {
    super(path, distance)
    this.status = 0
    this.length = length
    this.draw()
    if (doDrop) this.startDrop()
  }

  clean () {
    Note.CTX.clearRect(this.x, this.y - this.length, Note.W + 1, this.length > 0 ? this.length + Note.H : Note.H)
  }

  draw () {
    Note.CTX.beginPath()
    Note.CTX.arc(this.x + Note.W / 2, this.y + Note.W / 2, Note.W / 2, Math.PI, 2 * Math.PI, true)
    Note.CTX.lineTo(this.x + 102, this.y + Note.W / 2 - this.length)
    Note.CTX.arc(this.x + Note.W / 2, this.y + Note.W / 2 - this.length, Note.W / 2, 0, Math.PI, true)
    Note.CTX.lineTo(this.x, this.y + Note.W / 2)
    Note.CTX.fillStyle = 'rgba(255, 255, 255, 0.66)'
    Note.CTX.fill()
    Note.CTX.drawImage(
      Note.IMG,
      LongNote.IMG_POSITION_X,
      LongNote.IMG_POSITION_Y,
      Note.W,
      Note.H,
      this.x,
      this.y - this.length,
      Note.W,
      Note.H
    )
    if (this.status === 0) {
      Note.CTX.drawImage(
        Note.IMG,
        LongNote.IMG_POSITION_X,
        LongNote.IMG_POSITION_Y,
        Note.W,
        Note.H,
        this.x,
        this.y,
        Note.W,
        Note.H
      )
    }
  }

  update (distance: number, length: number) {
    this.clean()
    this.y = Note.TOP_TO_BOTTOM - distance
    this.length = length
    this.draw()
  }

  startDrop () {
    this.t = requestAnimationFrame(frame)
    let self = this
    function frame () {
      if (self.y >= Note.TOP_TO_BOTTOM + Note.RANGE * Note.PX_SPEED) {
        self.exist = false
        cancelAnimationFrame(self.t)
        self.clean()
        Note.queue[self.path - 1].shift()
        miss()
        miss()
        return
      }

      if (self.status === 0 && self.exist) {
        let d = Note.TOP_TO_BOTTOM - self.y
        self.update(d - Note.SPEED, self.length)
        requestAnimationFrame(frame)
      } else if (self.status === 1 && self.exist) {
        if (self.y - self.length >= Note.TOP_TO_BOTTOM + Note.RANGE * Note.PX_SPEED) {
          self.exist = false
          cancelAnimationFrame(self.t)
          self.clean()
          Note.queue[self.path - 1].shift()
          miss()
          se.longLoop.pause()
          return
        }
        let l = self.length
        self.update(0, l - Note.SPEED)
        requestAnimationFrame(frame)
      }
    }
  }
}

function tap (note: ShortNote) {
  let dt = Math.abs(note.y - Note.TOP_TO_BOTTOM) / Note.PX_SPEED
  if (dt <= Note.RANGE) {
    note.exist = false
    cancelAnimationFrame(note.t)
    note.clean()
    Note.queue[note.path - 1].shift()
    rank(dt)
  } else {
    playSe(se.clap)
  }
}

function down (note: LongNote) {
  if (note.status === 0) {
    let dt = Math.abs(note.y - Note.TOP_TO_BOTTOM) / Note.PX_SPEED
    if (dt <= Note.RANGE) {
      note.clean()
      rank(dt)
      note.status = 1
      note.length = note.length - (note.y - Note.TOP_TO_BOTTOM)
      se.longLoop.loop = true
      se.longLoop.play().catch(err => console.log(err))
    } else {
      playSe(se.clap)
    }
  }
}

function up (note: LongNote) {
  se.longLoop.pause()
  let dt = Math.abs(note.y - note.length - Note.TOP_TO_BOTTOM) / Note.PX_SPEED
  if (dt <= Note.RANGE) {
    note.exist = false
    cancelAnimationFrame(note.t)
    note.clean()
    Note.queue[note.path - 1].shift()
    rank(dt)
  } else { // miss
    note.exist = false
    cancelAnimationFrame(note.t)
    note.clean()
    Note.queue[note.path - 1].shift()
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
  Note.BACK_CTX.clearRect(0, Note.TOP_TO_BOTTOM - 100, 1280, 54)
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
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        212,
        253,
        54,
        // (1280 - 253) / 2,
        (1280 - f * 253 / 9) / 2,
        // Note.TOP_TO_BOTTOM - 100,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 253 / 9,
        f * 54 / 9
      )
    } else if (rank === 'great') {
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        159,
        208,
        53,
        (1280 - f * 208 / 9) / 2,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 208 / 9,
        f * 53 / 9
      )
    } else if (rank === 'nice') {
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        106,
        141,
        53,
        (1280 - f * 141 / 9) / 2,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 141 / 9,
        f * 53 / 9
      )
    } else if (rank === 'bad') {
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        53,
        128,
        53,
        (1280 - f * 128 / 9) / 2,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
        f * 128 / 9,
        f * 53 / 9
      )
    } else if (rank === 'miss') {
      Note.BACK_CTX.drawImage(
        rankImg,
        0,
        0,
        151,
        53,
        (1280 - f * 151 / 9) / 2,
        Note.TOP_TO_BOTTOM - 75 - f * 25 / 9,
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
  let note = Note.queue[path - 1][0]
  if (note) {
    if (note.constructor === ShortNote) tap(note)
    else down(note)
  } else {
    playSe(se.clap)
  }
}

function keyup (path: number) {
  let note = Note.queue[path - 1][0]
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

export { Note, ShortNote, LongNote, newImage, keyBind, liveResult }
